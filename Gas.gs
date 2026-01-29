  /**
  * Google Apps Script for PIT & Dependents Management System
  * Spreadsheet ID: 116Juj4pxMns62pgwN4hjV959vxJJN_Q_H_Z6tTLdAu8
  */

  const SPREADSHEET_ID = '116Juj4pxMns62pgwN4hjV959vxJJN_Q_H_Z6tTLdAu8';
  const API_KEY = 'PIT_SYSTEM_SECRET_KEY_2026';

  function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000); 
    
    try {
      let data;
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
        data = e.parameter;
      }
      
      // Security check
      if (data.apiKey !== API_KEY) {
        return createJsonResponse({ status: 'error', message: 'Unauthorized' });
      }
      
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const type = data.type;
      const timestamp = new Date();
      
      if (type === 'MST') {
        const sheet = getOrCreateSheet(ss, 'Confirm MST');
        sheet.appendRow([
          timestamp,
          data.userEmail,
          data.fullName,
          data.cccd,
          data.taxId,
          data.syncStatus,
          data.note,
          data.isConfirmed
        ]);
      } 
      else if (type === 'NPT_ADD' || type === 'NPT_EDIT' || type === 'NPT_TERMINATE') {
        const sheet = getOrCreateSheet(ss, 'Confirm NPT');
        const row = new Array(22).fill(''); 
        row[0] = timestamp;          // A
        row[1] = data.userEmail;     // B
        row[2] = data.nptFullName;   // C
        row[3] = data.nptTaxId;      // D
        row[4] = data.nptDob;        // E
        row[5] = data.nptCccd;       // F
        row[6] = data.nptRelationship; // G
        row[7] = data.permProvince;  // H
        row[8] = data.permWard;      // I
        row[9] = data.permDetail;    // J
        row[10] = data.currProvince; // K
        row[11] = data.currWard;     // L
        row[12] = data.currDetail;   // M
        
        if (type === 'NPT_EDIT') {
          row[13] = data.startDate;  // N
          row[14] = data.salaryDate; // O
        } else if (type === 'NPT_ADD') {
          row[15] = data.paperDocDate; // P
        }
        row[16] = data.status || ''; // Q: "Complete" / "giảm người phụ thuộc chờ xác nhận" / "Thêm NPT chờ xác nhận"
        row[17] = data.terminationMonth || ''; // R
        row[18] = data.terminationYear || '';  // S
        row[19] = data.declarationType || '';  // T: "Thêm NPT" / "Giảm NPT" / "Confirm NPT"
        row[20] = data.nptResult || '';        // U: Kết quả xử lý
        row[21] = data.nptNote || '';          // V: Ghi chú NPT
        sheet.appendRow(row);
      } 
      else if (type === 'NPT_QUICK_CONFIRM') {
        const sheet = getOrCreateSheet(ss, 'Confirm NPT');
        const row = new Array(22).fill(''); 
        row[0] = timestamp;        // A
        row[1] = data.userEmail;   // B
        row[2] = data.nptFullName; // C
        row[3] = data.nptTaxId;    // D
        row[16] = data.status;     // Q
        row[19] = data.declarationType; // T
        row[21] = data.nptNote || '';   // V
        sheet.appendRow(row);
      }
      else if (type === 'READ_CELL') {
        const sheetName = data.sheetName || 'Sheet1';
        const cellAddress = data.cell || 'A1';
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) return createJsonResponse({ status: 'error', message: 'Sheet not found' });
        const value = sheet.getRange(cellAddress).getValue();
        return createJsonResponse({ status: 'success', value: value });
      }
      else if (type === 'AUTH') {
        const username = data.username;
        const password = data.password;
        const userSheet = ss.getSheetByName('User');
        if (!userSheet) return createJsonResponse({ status: 'error', message: 'Sheet "User" not found' });
        
        const userData = userSheet.getDataRange().getValues();
        for (let i = 1; i < userData.length; i++) {
          if (userData[i][2].toString() === username.toString() && userData[i][3].toString() === password.toString()) {
            const mstInfo = checkMstVerification(ss, userData[i][2]);
            return createJsonResponse({ 
              status: 'success', 
              user: {
                fullName: userData[i][1], // Col B
                email: userData[i][2],    // Col C
                avatarUrl: userData[i][4], // Col E
                role: userData[i][5],      // Col F
                cccd: userData[i][6],      // Col G
                taxId: userData[i][7],     // Col H
                dependentCount: userData[i][8], // Col I
                isVerified: mstInfo.verified,
                isDependentsVerified: checkNptVerification(ss, userData[i][2]),
                taxSyncStatus: mstInfo.syncStatus || 'unknown',
                note: mstInfo.note || ''
              } 
            });
          }
        }
        return createJsonResponse({ status: 'error', message: 'Invalid username or password' });
      }
      else if (type === 'GET_DEPENDENTS') {
        const userEmail = data.userEmail;
        const nptSheet = ss.getSheetByName('NPT');
        if (!nptSheet) return createJsonResponse({ status: 'error', message: 'Sheet "NPT" not found' });
        
        const nptData = nptSheet.getDataRange().getDisplayValues();
      const results = [];
      
      // Fetch processing results from Confirm NPT sheet
      const confirmSheet = ss.getSheetByName('Confirm NPT');
      const confirmData = confirmSheet ? confirmSheet.getDataRange().getDisplayValues() : [];
      const processingResultsMap = {}; // key: email_cccd or email_name_taxId or email_name -> { status: Q, result: U }
      
      if (confirmData.length > 1) {
        for (let j = 1; j < confirmData.length; j++) {
          const cRow = confirmData[j];
          const cEmail = (cRow[1] || '').toString().toLowerCase().trim();
          const cName = (cRow[2] || '').toString().toLowerCase().trim();
          const cTaxId = (cRow[3] || '').toString().toLowerCase().trim();
          const cCccd = (cRow[5] || '').toString().toLowerCase().trim();
          const cStatus = cRow[16] || ''; // Col Q
          const cResult = cRow[20] || ''; // Col U
          const cNote = cRow[21] || '';   // Col V
          
          if (cEmail) {
            // Priority 1: Email + CCCD
            if (cCccd) {
              processingResultsMap[`${cEmail}_cccd_${cCccd}`] = { status: cStatus, result: cResult, note: cNote };
            }
            // Priority 2: Email + Name + MST
            if (cName) {
              const nameKey = cTaxId ? `${cEmail}_name_${cName}_tax_${cTaxId}` : `${cEmail}_name_${cName}`;
              processingResultsMap[nameKey] = { status: cStatus, result: cResult, note: cNote };
            }
          }
        }
      }
      
      for (let i = 1; i < nptData.length; i++) {
        const row = nptData[i];
        if (row[1] && row[1].toString().trim().toLowerCase() === userEmail.toString().trim().toLowerCase()) {
          const email = row[1].toString().toLowerCase().trim();
          const name = (row[6] || '').toString().toLowerCase().trim();
          const taxId = (row[7] || '').toString().toLowerCase().trim();
          const cccd = (row[10] || '').toString().toLowerCase().trim();
          
          // Find the best match
          let confirmInfo = {};
          if (cccd && processingResultsMap[`${email}_cccd_${cccd}`]) {
            confirmInfo = processingResultsMap[`${email}_cccd_${cccd}`];
          } else if (name && processingResultsMap[`${email}_name_${name}_tax_${taxId}`]) {
            confirmInfo = processingResultsMap[`${email}_name_${name}_tax_${taxId}`];
          } else if (name && processingResultsMap[`${email}_name_${name}`]) {
            confirmInfo = processingResultsMap[`${email}_name_${name}`];
          }
          
          results.push({
            id: 'row_' + (i + 1),
            fullName: row[6],  // Col G
            taxId: row[7],     // Col H
            dob: row[8],       // Col I
            cccd: row[10],     // Col K
            relationship: row[21], // Col V
            permanentAddress: {
              province: row[15], // Col P
              ward: row[16],     // Col Q
              detail: row[17]    // Col R
            },
            currentAddress: {
              province: row[18], // Col S
              ward: row[19],     // Col T
              detail: row[20]    // Col U
            },
            status: row[23],    // Col X
            startDate: row[25], // Col Z
            salaryDeductionDate: row[24], // Col Y
            isConfirmed: row[28] === true || row[28] === 'TRUE', // Col AC
            isInfoChecked: row[29] === true || row[29] === 'TRUE', // Col AD
            isSent: row[30] === true || row[30] === 'TRUE', // Col AE
            processingResult: confirmInfo.result || '',
            confirmationStatus: confirmInfo.status || '',
            note: confirmInfo.note || ''
          });
        }
      }
        return createJsonResponse({ status: 'success', data: results });
      }
      else if (type === 'GET_LOCATION_DATA') {
        const dataSheet = ss.getSheetByName('Data');
        if (!dataSheet) return createJsonResponse({ status: 'error', message: 'Sheet "Data" not found' });
        
        const values = dataSheet.getDataRange().getValues();
        const locations = {}; // { Province: [Ward1, Ward2, ...] }
        
        for (let i = 1; i < values.length; i++) {
          const province = values[i][0]; // Col A
          const ward = values[i][1];     // Col B
          
          if (province) {
            if (!locations[province]) {
              locations[province] = [];
            }
            if (ward && !locations[province].includes(ward)) {
              locations[province].push(ward);
            }
          }
        }
        return createJsonResponse({ status: 'success', data: locations });
      }

      return createJsonResponse({ status: 'success' });

    } catch (err) {
      return createJsonResponse({ status: 'error', message: err.toString() });
    } finally {
      lock.releaseLock();
    }
  }

  function checkMstVerification(ss, email) {
    const sheet = ss.getSheetByName('Confirm MST');
    if (!sheet) return { verified: false };
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] && data[i][1].toString().toLowerCase().trim() === email.toString().toLowerCase().trim()) {
        const isVerified = data[i][7] === true || data[i][7] === 'TRUE';
        if (isVerified) {
          return {
            verified: true,
            syncStatus: data[i][5] === 'Đã đồng bộ' ? 'synced' : 'unsynced',
            note: data[i][6] || ''
          };
        }
      }
    }
    return { verified: false };
  }

  function checkNptVerification(ss, email) {
    const sheet = ss.getSheetByName('Confirm NPT');
    if (!sheet) return false;
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] && data[i][1].toString().toLowerCase().trim() === email.toString().toLowerCase().trim()) {
        if (data[i][16] === 'Complete') {
          return true;
        }
      }
    }
    return false;
  }

  function getOrCreateSheet(ss, name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === 'Confirm MST') {
        sheet.appendRow(['Thời điểm', 'Email User', 'Họ tên', 'Số CCCD', 'Mã số thuế', 'Đồng bộ định danh', 'Ghi chú', 'Tích xác nhận']);
      } else if (name === 'Confirm NPT') {
        const header = [
          'Thời điểm', 'Email User', 'Họ tên NPT', 'Mã số thuế NPT', 'Ngày sinh NPT', 'Số CCCD NPT', 'Mối quan hệ', 
          'ĐC thường trú (Tỉnh)', 'ĐC thường trú (Xã)', 'ĐC thường trú (Số nhà)', 
          'ĐC hiện tại (Tỉnh)', 'ĐC hiện tại (Xã)', 'ĐC hiện tại (Số nhà)', 
          'Thời điểm giảm trừ (N)', 'Thời điểm áp dụng lương (O)', 'Thời điểm cung cấp hồ sơ (P)', 'Trạng thái (Q)', 'Tháng cắt NPT (R)', 'Năm cắt NPT (S)', 'Loại khai báo (T)', 'Kết quả xử lý (U)', 'Ghi chú NPT (V)'
        ];
        sheet.appendRow(header);
      }
    }
    return sheet;
  }

  function createJsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function doGet(e) {
    return ContentService.createTextOutput("Gas Script is running. Spreadsheet ID: " + SPREADSHEET_ID);
  }
