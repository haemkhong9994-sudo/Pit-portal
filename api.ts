
// Configuration for Google Apps Script Web App
// 1. Paste your deployed Web App URL into the WEB_APP_URL field below
export const GAS_CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwusP_7ZrdEeRh_UPGuC4zSixUlOYZLo0JJrI6BCT2KcHZARfKoFroA_g4fTuKU_NIkWw/exec',
    API_KEY: 'PIT_SYSTEM_SECRET_KEY_2026'
};

/**
 * Sends data to Google Sheets via Apps Script Web App
 */
export const saveToGoogleSheet = async (data: any) => {
    // Check if the URL has been updated from the placeholder
    if (!GAS_CONFIG.WEB_APP_URL || GAS_CONFIG.WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE') {
        console.warn('Google Sheets integration: Please configure the WEB_APP_URL in api.ts');
        return;
    }

    try {
        await fetch(GAS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Standard for GAS Web Apps to avoid CORS preflight issues
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                apiKey: GAS_CONFIG.API_KEY
            }),
        });
        console.log('✅ Data sent to Google Sheets successfully.');
    } catch (error) {
        console.error('❌ Error sending data to Google Sheets:', error);
    }
};

/**
 * Utility function to test the connection and API Key
 * Reads cell A1 from the first sheet (default 'Sheet1')
 */
export const testReadKey = async () => {
    if (!GAS_CONFIG.WEB_APP_URL || GAS_CONFIG.WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE') {
        alert("Lỗi: Bạn chưa dán URL Web App vào file api.ts");
        return;
    }

    console.log("🔍 Testing connection to Google Sheets...");

    const testData = {
        type: 'READ_CELL',
        sheetName: 'Sheet1',
        cell: 'A1',
        apiKey: GAS_CONFIG.API_KEY
    };

    try {
        const response = await fetch(GAS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            mode: 'cors', // Use 'cors' here to read the JSON response body
            cache: 'no-cache',
            body: JSON.stringify(testData)
        });

        if (response.status === 401) {
            throw new Error("Lỗi 401: Vui lòng kiểm tra lại quyền truy cập (phải chọn 'Who has access: Anyone')");
        }

        const result = await response.json();
        if (result.status === 'success') {
            alert("🚀 Kết nối thành công!\nGiá trị tại ô A1 là: " + result.value);
            console.log("Success result:", result);
        } else {
            alert("⚠️ Lỗi từ Script: " + result.message);
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
        alert("Thất bại: " + error);
    }
};

/**
 * Log in a user by checking credentials against the "User" sheet
 */
export const login = async (username: string, password: string) => {
    if (!GAS_CONFIG.WEB_APP_URL || GAS_CONFIG.WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE') {
        throw new Error("Google Sheets URL not configured in api.ts.");
    }

    try {
        const response = await fetch(GAS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: JSON.stringify({
                type: 'AUTH',
                username,
                password,
                apiKey: GAS_CONFIG.API_KEY
            }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Login request failed:", error);
        throw error;
    }
};

/**
 * Fetch all dependents for a specific user email from the NPT sheet
 */
export const getDependents = async (userEmail: string) => {
    if (!GAS_CONFIG.WEB_APP_URL || GAS_CONFIG.WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE') {
        throw new Error("Google Sheets URL not configured in api.ts.");
    }

    try {
        const response = await fetch(GAS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: JSON.stringify({
                type: 'GET_DEPENDENTS',
                userEmail,
                apiKey: GAS_CONFIG.API_KEY
            }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Get dependents request failed:", error);
        throw error;
    }
};

/**
 * Fetch hierarchical location data (Province/Ward) from the 'Data' sheet
 */
export const getLocationData = async () => {
    if (!GAS_CONFIG.WEB_APP_URL || GAS_CONFIG.WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE') {
        throw new Error("Google Sheets URL not configured in api.ts.");
    }

    try {
        const response = await fetch(GAS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            body: JSON.stringify({
                type: 'GET_LOCATION_DATA',
                apiKey: GAS_CONFIG.API_KEY
            }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Get location data request failed:", error);
        throw error;
    }
};
