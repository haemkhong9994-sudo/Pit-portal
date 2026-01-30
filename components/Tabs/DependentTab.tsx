
import React, { useState, useEffect } from 'react';
import { Dependent, DependentStatus, Address, Relationship, UserProfile } from '../../types';
import { ICONS } from '../../constants';
import { saveToGoogleSheet, getLocationData } from '../../api';
import SearchableSelect from '../Common/SearchableSelect';

interface DependentTabProps {
  dependents: Dependent[];
  setDependents: React.Dispatch<React.SetStateAction<Dependent[]>>;
  user: UserProfile;
}

const INITIAL_FORM_STATE: Omit<Dependent, 'id'> = {
  fullName: '',
  taxId: '',
  dob: '',
  cccd: '',
  relationship: 'Con',
  permanentAddress: { province: '', ward: '', detail: '' },
  currentAddress: { province: '', ward: '', detail: '' },
  status: DependentStatus.PROCESSING,
  startDate: '',
  endDate: '',
  salaryDeductionDate: '',
  paperDocDate: '',
  isConfirmed: false,
  isInfoChecked: false,
  isSent: false,
  isTerminated: false
};

const DependentTab: React.FC<DependentTabProps> = ({ dependents, setDependents, user }) => {
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Dependent | Omit<Dependent, 'id'>>(INITIAL_FORM_STATE);
  const [localDependents, setLocalDependents] = useState<Dependent[]>(dependents);
  const [showToast, setShowToast] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [locationData, setLocationData] = useState<Record<string, string[]>>({});

  // Terminate Dependent States
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminationTargetId, setTerminationTargetId] = useState<string>('');
  const [terminationMonth, setTerminationMonth] = useState('');
  const [terminationYear, setTerminationYear] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await getLocationData();
        if (result.status === 'success') {
          setLocationData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    setLocalDependents(dependents);
    setHasChanges(false);
  }, [dependents]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Common mandatory fields
    if (!formData.fullName.trim()) newErrors.push('fullName');
    if (!formData.dob) newErrors.push('dob');
    if (!formData.relationship) newErrors.push('relationship');
    // CCCD Validation: Must be 12 digits
    if (!formData.cccd.trim() || formData.cccd.trim().length !== 12) {
      newErrors.push('cccd');
    }

    if (isEditing) {
      // RULES FOR UPDATING
      // Tax ID Validation for Update: Must be 10 or 12 digits
      const taxIdTrim = formData.taxId.trim();
      if (!taxIdTrim || (taxIdTrim.length !== 10 && taxIdTrim.length !== 12)) {
        newErrors.push('taxId');
      }
      if (!formData.startDate.trim()) newErrors.push('startDate');
      if (!formData.salaryDeductionDate.trim()) newErrors.push('salaryDeductionDate');
    } else {
      // RULES FOR ADDING NEW
      // Tax ID Validation for Add: Optional, but if entered must be 10 or 12 digits
      const taxIdTrim = formData.taxId.trim();
      if (taxIdTrim && taxIdTrim.length !== 10 && taxIdTrim.length !== 12) {
        newErrors.push('taxId');
      }

      const today = new Date().toISOString().split('T')[0];
      if (!formData.paperDocDate) {
        newErrors.push('paperDocDate');
      } else if (formData.paperDocDate < today) {
        newErrors.push('paperDocDate_past');
      }
    }

    // Addresses are mandatory for both
    const checkAddress = (addr: Address, prefix: string) => {
      if (!addr.province.trim()) newErrors.push(`${prefix}province`);
      if (!addr.ward.trim()) newErrors.push(`${prefix}ward`);
      if (!addr.detail.trim()) newErrors.push(`${prefix}detail`);
    };

    checkAddress(formData.permanentAddress, 'perm_');
    checkAddress(formData.currentAddress, 'curr_');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const statusBadge = (status: DependentStatus) => {
    switch (status) {
      case DependentStatus.SUCCESS_INCREASE:
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full uppercase tracking-tight">Thành công</span>;
      case DependentStatus.PROCESSING:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full uppercase tracking-tight">Đang xử lý</span>;
      case DependentStatus.SUCCESS_DECREASE:
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full uppercase tracking-tight">Báo giảm</span>;
      case DependentStatus.NOT_APPLICABLE:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full uppercase tracking-tight">Không áp dụng</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full uppercase tracking-tight">Khác</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleOpenAdd = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsEditing(false);
    setErrors([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dep: Dependent) => {
    setFormData({ ...dep });
    setIsEditing(true);
    setErrors([]);
    setIsFormOpen(true);
    setSelectedDependent(null);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.');
      return;
    }

    if (isEditing) {
      // Logic changed: Do NOT save to Google Sheet immediate for Edits
      // (Wait for Confirm action to save 2.1 + 2.3 in one row)
      const updatedDep = formData as Dependent;
      setLocalDependents(localDependents.map(d => d.id === updatedDep.id ? updatedDep : d));
    } else {
      // DO NOT save to Google Sheet yet for ADD NEW
      const newDep = { ...formData, id: Date.now().toString() } as Dependent;
      setLocalDependents([...localDependents, newDep]);
    }
    setHasChanges(true);
    setIsFormOpen(false);
  };

  const handleToggleConfirm = (id: string) => {
    const dep = localDependents.find(d => d.id === id);
    if (!dep) return;

    const nextConfirmed = !dep.isConfirmed;

    setLocalDependents(prev => prev.map(d =>
      d.id === id ? { ...d, isConfirmed: nextConfirmed } : d
    ));
    setHasChanges(true);
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      for (const dep of localDependents) {
        const original = dependents.find(d => d.id === dep.id);

        // Filter for records that are newly confirmed (local is true, original was false/none)
        const isNewlyConfirmed = dep.isConfirmed && (!original || !original.isConfirmed);

        if (isNewlyConfirmed) {
          if (!original) {
            // 2.2 + 2.3: Fully NEW dependent record
            await saveToGoogleSheet({
              type: 'NPT_ADD',
              userEmail: user.email,
              nptFullName: dep.fullName,
              nptTaxId: "'" + dep.taxId,
              nptDob: dep.dob,
              nptCccd: "'" + dep.cccd,
              nptRelationship: dep.relationship,
              nptNote: dep.note || '',
              permProvince: dep.permanentAddress.province,
              permWard: dep.permanentAddress.ward,
              permDetail: dep.permanentAddress.detail,
              currProvince: dep.currentAddress.province,
              currWard: dep.currentAddress.ward,
              currDetail: dep.currentAddress.detail,
              paperDocDate: dep.paperDocDate,
              status: 'Thêm NPT chờ xử lý',     // Q Column
              declarationType: 'Thêm NPT'          // T Column
            });
          } else {
            // Check if core data has changed since initial load
            const hasDataChanged =
              dep.fullName !== original.fullName ||
              dep.taxId !== original.taxId ||
              dep.dob !== original.dob ||
              dep.cccd !== original.cccd ||
              dep.relationship !== original.relationship ||
              dep.permanentAddress.province !== original.permanentAddress.province ||
              dep.permanentAddress.ward !== original.permanentAddress.ward ||
              dep.permanentAddress.detail !== original.permanentAddress.detail ||
              dep.currentAddress.province !== original.currentAddress.province ||
              dep.currentAddress.ward !== original.currentAddress.ward ||
              dep.currentAddress.detail !== original.currentAddress.detail ||
              dep.startDate !== original.startDate ||
              dep.salaryDeductionDate !== original.salaryDeductionDate;

            if (hasDataChanged) {
              // 2.1 + 2.3: EDITED existing record + Confirm
              await saveToGoogleSheet({
                type: 'NPT_EDIT',
                userEmail: user.email,
                nptFullName: dep.fullName,
                nptTaxId: "'" + dep.taxId,
                nptDob: dep.dob,
                nptCccd: "'" + dep.cccd,
                nptRelationship: dep.relationship,
                nptNote: dep.note || '',
                permProvince: dep.permanentAddress.province,
                permWard: dep.permanentAddress.ward,
                permDetail: dep.permanentAddress.detail,
                currProvince: dep.currentAddress.province,
                currWard: dep.currentAddress.ward,
                currDetail: dep.currentAddress.detail,
                startDate: dep.startDate,    // N Column
                salaryDate: dep.salaryDeductionDate, // O Column
                status: 'Complete',          // Q Column
                declarationType: 'Confirm NPT' // T Column
              });
            } else {
              // 2.3 ONLY: Unchanged existing record + Confirm
              await saveToGoogleSheet({
                type: 'NPT_QUICK_CONFIRM',
                userEmail: user.email,
                nptFullName: dep.fullName,
                nptTaxId: "'" + dep.taxId,
                status: 'Complete',
                declarationType: 'Confirm NPT',
                nptNote: dep.note || ''
              });
            }
          }
        }
      }

      setDependents(localDependents);
      setShowToast(true);
      setHasChanges(false);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetTerminateStates = () => {
    setTerminationTargetId('');
    setTerminationMonth('');
    setTerminationYear('');
  };

  const handleTerminateSave = async () => {
    if (!terminationTargetId || !terminationMonth || !terminationYear) {
      alert("Vui lòng chọn người phụ thuộc và thời điểm cắt (Tháng/Năm).");
      return;
    }

    const dep = localDependents.find(d => d.id === terminationTargetId);
    if (!dep) return;

    setIsSaving(true);
    try {
      await saveToGoogleSheet({
        type: 'NPT_TERMINATE',
        userEmail: user.email,
        nptFullName: dep.fullName,
        nptTaxId: "'" + dep.taxId,
        nptDob: dep.dob,
        nptCccd: "'" + dep.cccd,
        nptRelationship: dep.relationship,
        nptNote: dep.note || '',
        permProvince: dep.permanentAddress.province,
        permWard: dep.permanentAddress.ward,
        permDetail: dep.permanentAddress.detail,
        currProvince: dep.currentAddress.province,
        currWard: dep.currentAddress.ward,
        currDetail: dep.currentAddress.detail,
        terminationYear: terminationYear,
        status: 'Giảm NPT, chờ xử lý', // Q Column
        declarationType: 'Giảm NPT'                  // T Column
      });

      // Mark as terminated and update status immediately
      const updated = localDependents.map(d =>
        d.id === terminationTargetId ? { ...d, isTerminated: true, confirmationStatus: 'Giảm NPT, chờ xử lý' } : d
      );
      setLocalDependents(updated);
      setDependents(updated);

      setShowToast(true);
      setIsTerminateModalOpen(false);
      resetTerminateStates();
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Terminate failed:", error);
      alert("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressChange = (type: 'permanent' | 'current', field: keyof Address, value: string) => {
    const key = type === 'permanent' ? 'permanentAddress' : 'currentAddress';
    const newAddress = { ...formData[key], [field]: value };

    // Reset ward if province changes
    if (field === 'province') {
      newAddress.ward = '';
    }

    setFormData({
      ...formData,
      [key]: newAddress
    });
    const errorId = type === 'permanent' ? `perm_${field}` : `curr_${field}`;
    setErrors(prev => prev.filter(e => e !== errorId));

    if (field === 'province') {
      setErrors(prev => prev.filter(e => e !== (type === 'permanent' ? 'perm_ward' : 'curr_ward')));
    }
  };

  const isReadOnlyPage = user.isDependentsVerified;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">Người phụ thuộc</h3>

          </div>
          <p className="text-sm text-slate-500">Quản lý danh sách người thân được đăng ký giảm trừ gia cảnh.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <ICONS.Plus />
            Thêm người phụ thuộc
          </button>
          <button
            onClick={() => {
              resetTerminateStates();
              setIsTerminateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl border border-rose-200 transition-all active:scale-95"
          >
            <ICONS.AlertTriangle />
            Giảm người phụ thuộc
          </button>
        </div>
      </div>



      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px] text-center">Họ và tên</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Quan hệ</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Mã số thuế</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thời điểm được giảm trừ</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thời điểm áp dụng trong lương</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Chi tiết</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Kiểm tra thông tin</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Đối chiếu Etax mobile</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ghi chú</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Kết quả xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDependents.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      {dep.relationship === 'Con' ? (
                        <img
                          src="/assets/images/baby.png"
                          alt="Con"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : dep.relationship === 'Cha/mẹ' ? (
                        <img
                          src="/assets/images/Ongba.png"
                          alt="Cha/mẹ"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (dep.relationship === 'Đối tượng khác' || dep.relationship === 'Vợ/chồng') ? (
                        <img
                          src="/assets/images/khac.png"
                          alt="Khác"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {dep.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800">{dep.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-center">{dep.relationship}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono text-center">{dep.taxId || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium text-center">
                    {dep.startDate || "---"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium text-center">
                    {dep.salaryDeductionDate || "---"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedDependent(dep)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <ICONS.Eye />
                      </button>
                      {/* Hide edit button ONLY for existing records if page is verified OR individual record is already confirmed */}
                      {(!dep.isSent && !dep.isTerminated && !dep.confirmationStatus) && (
                        <button
                          onClick={() => handleOpenEdit(dep)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      {(dep.isSent || dep.isTerminated || dep.confirmationStatus) ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Đã gửi">
                          <ICONS.Check />
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={dep.isInfoChecked || false}
                          onChange={(e) => {
                            const updated = localDependents.map(d =>
                              d.id === dep.id ? { ...d, isInfoChecked: e.target.checked } : d
                            );
                            setLocalDependents(updated);
                            setHasChanges(true);
                          }}
                          className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      {(dep.isSent || dep.isTerminated || dep.confirmationStatus) ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Đã gửi">
                          <ICONS.Check />
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={dep.isConfirmed || false}
                          onChange={() => handleToggleConfirm(dep.id)}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {(dep.isSent || dep.isTerminated || dep.confirmationStatus) ? (
                      <span className="text-xs text-slate-500 font-medium italic px-3 block truncate max-w-[200px]" title={dep.note}>
                        {dep.note || "---"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={dep.note || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = localDependents.map(d =>
                            d.id === dep.id ? { ...d, note: val } : d
                          );
                          setLocalDependents(updated);
                          setDependents(updated);
                        }}
                        placeholder="Thêm lưu ý..."
                        className="w-full min-w-[150px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      {dep.confirmationStatus ? (
                        <div className={`px-4 py-2 ${dep.confirmationStatus.includes('chờ xử lý') ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'} text-xs font-bold rounded-lg border`}>
                          {dep.confirmationStatus}
                        </div>
                      ) : dep.isTerminated ? (
                        <div className="px-4 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                          Giảm NPT, chờ xử lý
                        </div>
                      ) : dep.isSent ? (
                        dep.id.toString().startsWith('row_') ? (
                          <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                            Complete
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                            Thêm NPT chờ xử lý
                          </div>
                        )
                      ) : (dep.isInfoChecked && dep.isConfirmed) ? (
                        <button
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              // Save this specific dependent's data to Google Sheets
                              const originalDep = dependents.find(d => d.id === dep.id);

                              if (originalDep) {
                                // Existing record - save as NPT_EDIT
                                await saveToGoogleSheet({
                                  type: 'NPT_EDIT',
                                  userEmail: user.email,
                                  nptFullName: dep.fullName,
                                  nptTaxId: "'" + dep.taxId,
                                  nptDob: dep.dob,
                                  nptCccd: "'" + dep.cccd,
                                  nptRelationship: dep.relationship,
                                  permProvince: dep.permanentAddress.province,
                                  permWard: dep.permanentAddress.ward,
                                  permDetail: dep.permanentAddress.detail,
                                  currProvince: dep.currentAddress.province,
                                  currWard: dep.currentAddress.ward,
                                  currDetail: dep.currentAddress.detail,
                                  startDate: dep.startDate,
                                  salaryDate: dep.salaryDeductionDate,
                                  status: 'Complete',
                                  declarationType: 'Confirm NPT',
                                  nptNote: dep.note || ''
                                });
                              } else {
                                // NEW record - save as NPT_ADD
                                await saveToGoogleSheet({
                                  type: 'NPT_ADD',
                                  userEmail: user.email,
                                  nptFullName: dep.fullName,
                                  nptTaxId: "'" + dep.taxId,
                                  nptDob: dep.dob,
                                  nptCccd: "'" + dep.cccd,
                                  nptRelationship: dep.relationship,
                                  permProvince: dep.permanentAddress.province,
                                  permWard: dep.permanentAddress.ward,
                                  permDetail: dep.permanentAddress.detail,
                                  currProvince: dep.currentAddress.province,
                                  currWard: dep.currentAddress.ward,
                                  currDetail: dep.currentAddress.detail,
                                  paperDocDate: dep.paperDocDate,
                                  status: 'Thêm NPT chờ xử lý',
                                  declarationType: 'Thêm NPT',
                                  nptNote: dep.note || ''
                                });
                              }

                              // Mark as sent
                              const updated = localDependents.map(d =>
                                d.id === dep.id ? { ...d, isSent: true } : d
                              );
                              setLocalDependents(updated);
                              setDependents(updated);
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 3000);
                            } catch (error) {
                              console.error("Send failed:", error);
                              alert("Lỗi khi gửi thông tin. Vui lòng thử lại.");
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                        >
                          Gửi thông tin
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      <span className="text-sm font-medium text-slate-600 italic">
                        {dep.processingResult || "---"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Action Bar - Hidden as per requirement */}
      {false && hasChanges && !isSaving && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleFinalSave}
            className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
          >
            <ICONS.Check />
            Lưu tất cả thay đổi
          </button>
        </div>
      )}

      {isSaving && (
        <div className="flex justify-end pt-2">
          <div className="px-8 py-3 rounded-xl font-bold flex items-center gap-3 bg-slate-100 text-slate-400 shadow-none border border-slate-200">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
            Đang xử lý dữ liệu...
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 z-[100]">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ICONS.Check />
          </div>
          <div>
            <p className="text-sm font-bold">Thành công!</p>
            <p className="text-xs text-slate-400">Đã lưu toàn bộ thay đổi người phụ thuộc.</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDependent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xl font-bold text-slate-900">Hồ sơ Người phụ thuộc</h4>
              <button onClick={() => setSelectedDependent(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thông tin cá nhân</h5>
                  <DetailRow label="Họ tên" value={selectedDependent.fullName} />
                  <DetailRow label="Mối quan hệ" value={selectedDependent.relationship} />
                  <DetailRow label="Ngày sinh" value={formatDate(selectedDependent.dob)} />
                  <DetailRow label="Mã số thuế" value={selectedDependent.taxId} />
                  <DetailRow label="Số CCCD" value={selectedDependent.cccd} />
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái & Hồ sơ</h5>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Trạng thái hiện tại</p>
                      <div className="flex items-center gap-2">
                        {statusBadge(selectedDependent.status as any)}
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {selectedDependent.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1 italic">Thông tin giảm trừ</p>
                      <DetailRow label="Thời điểm được giảm trừ" value={selectedDependent.startDate || "---"} />
                      <div className="mt-2 text-[10px]"></div>
                      <DetailRow label="Thời điểm áp dụng trong lương" value={selectedDependent.salaryDeductionDate || "---"} />
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Xác nhận thông tin</p>
                      {/* Show 'Đã xác nhận' if page is verified for EXISTING records, or if individual record is confirmed */}
                      {((isReadOnlyPage && dependents.find(d => d.id === selectedDependent.id)) || dependents.find(d => d.id === selectedDependent.id)?.isConfirmed || selectedDependent.isConfirmed) ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Đã xác nhận
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Chưa xác nhận
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <AddressViewSection title="Địa chỉ thường trú" address={selectedDependent.permanentAddress} theme="indigo" />
              <AddressViewSection title="Địa chỉ nơi ở hiện tại" address={selectedDependent.currentAddress} theme="slate" />
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDependent(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Đóng
              </button>
              {((!isReadOnlyPage || !dependents.find(d => d.id === selectedDependent.id)) && !selectedDependent.isConfirmed) && (
                <button
                  onClick={() => handleOpenEdit(selectedDependent)}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Integrated Split Logic) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 my-auto">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Cập nhật Người phụ thuộc' : 'Thêm Người phụ thuộc mới'}
              </h4>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Common Fields Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormInput
                  label="Họ và tên *"
                  value={formData.fullName}
                  onChange={v => {
                    setFormData({ ...formData, fullName: v });
                    setErrors(prev => prev.filter(e => e !== 'fullName'));
                  }}
                  error={errors.includes('fullName')}
                />
                <FormInput
                  label="Ngày sinh *"
                  value={formData.dob}
                  onChange={v => {
                    setFormData({ ...formData, dob: v });
                    setErrors(prev => prev.filter(e => e !== 'dob'));
                  }}
                  type="date"
                  error={errors.includes('dob')}
                />
                <div className="flex flex-col">
                  <FormInput
                    label="Số CCCD *"
                    value={formData.cccd}
                    onChange={v => {
                      const numericValue = v.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, cccd: numericValue });
                      setErrors(prev => prev.filter(e => e !== 'cccd'));
                    }}
                    placeholder="Nhập đúng 12 số"
                    error={errors.includes('cccd')}
                  />
                  {errors.includes('cccd') && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">CCCD phải đúng 12 chữ số</p>
                  )}
                </div>
              </div>

              {/* Common Fields Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormSelect
                  label="Mối quan hệ *"
                  value={formData.relationship}
                  onChange={v => {
                    setFormData({ ...formData, relationship: v as Relationship });
                    setErrors(prev => prev.filter(e => e !== 'relationship'));
                  }}
                  options={['Cha/mẹ', 'Con', 'Vợ/chồng', 'Đối tượng khác']}
                  error={errors.includes('relationship')}
                />
                <div className="flex flex-col">
                  <FormInput
                    label={isEditing ? "Mã số thuế *" : "Mã số thuế"}
                    value={formData.taxId}
                    onChange={v => {
                      const numericValue = v.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, taxId: numericValue });
                      setErrors(prev => prev.filter(e => e !== 'taxId'));
                    }}
                    placeholder="Nhập 10 hoặc 12 số"
                    error={errors.includes('taxId')}
                  />
                  {errors.includes('taxId') && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">MST phải là 10 hoặc 12 chữ số</p>
                  )}
                </div>

                {!isEditing && (
                  <FormInput
                    label="Thời điểm cung cấp hồ sơ (Bản giấy) *"
                    value={formData.paperDocDate}
                    onChange={v => {
                      setFormData({ ...formData, paperDocDate: v });
                      setErrors(prev => prev.filter(e => e !== 'paperDocDate' && e !== 'paperDocDate_past'));
                    }}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    error={errors.includes('paperDocDate') || errors.includes('paperDocDate_past')}
                  />
                )}
              </div>

              {/* Conditional Fields for Editing Only */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <FormInput
                    label="Thời điểm được giảm trừ (mm/yyyy) *"
                    value={formData.startDate}
                    onChange={v => {
                      setFormData({ ...formData, startDate: v });
                      setErrors(prev => prev.filter(e => e !== 'startDate'));
                    }}
                    placeholder="01/2025"
                    error={errors.includes('startDate')}
                  />
                  <FormInput
                    label="Thời điểm áp dụng trong lương (mm/yyyy) *"
                    value={formData.salaryDeductionDate}
                    onChange={v => {
                      setFormData({ ...formData, salaryDeductionDate: v });
                      setErrors(prev => prev.filter(e => e !== 'salaryDeductionDate'));
                    }}
                    placeholder="01/2025"
                    error={errors.includes('salaryDeductionDate')}
                  />
                </div>
              )}

              {errors.includes('paperDocDate_past') && (
                <p className="text-[10px] text-rose-500 font-bold -mt-4">Ngày nộp hồ sơ không được là ngày quá khứ</p>
              )}

              <div className="space-y-6">
                <AddressFormSection
                  title="Địa chỉ thường trú *"
                  address={formData.permanentAddress}
                  onChange={(f, v) => handleAddressChange('permanent', f, v)}
                  errors={errors}
                  errorPrefix="perm_"
                  locationData={locationData}
                />
                <AddressFormSection
                  title="Địa chỉ nơi ở hiện tại *"
                  address={formData.currentAddress}
                  onChange={(f, v) => handleAddressChange('current', f, v)}
                  errors={errors}
                  errorPrefix="curr_"
                  locationData={locationData}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                {isEditing ? 'Lưu thay đổi' : 'Đăng ký hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Dependent Modal */}
      {isTerminateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <ICONS.AlertTriangle />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Giảm người phụ thuộc</h4>
                  <p className="text-sm text-slate-500">Dừng tính giảm trừ gia cảnh cho người thân.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTerminateModalOpen(false);
                  resetTerminateStates();
                }}
                className="p-2 hover:bg-rose-100/50 rounded-full transition-colors text-slate-400"
              >
                <ICONS.Plus className="rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <SearchableSelect
                  label="Chọn người phụ thuộc *"
                  value={localDependents.find(d => d.id === terminationTargetId)?.fullName || ''}
                  onChange={(val) => {
                    const found = localDependents.find(d => d.fullName === val || d.id === val);
                    if (found) setTerminationTargetId(found.id);
                  }}
                  options={localDependents.map(d => d.fullName)}
                  placeholder="Gõ tên để tìm kiếm..."
                />

                {terminationTargetId && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-6">
                      <DetailRow label="Họ và tên" value={localDependents.find(d => d.id === terminationTargetId)?.fullName || ''} />
                      <DetailRow label="Mã số thuế" value={localDependents.find(d => d.id === terminationTargetId)?.taxId || ''} />
                      <DetailRow label="Mối quan hệ" value={localDependents.find(d => d.id === terminationTargetId)?.relationship || ''} />
                      <DetailRow label="Số CCCD" value={localDependents.find(d => d.id === terminationTargetId)?.cccd || ''} />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                      label="Tháng cắt hồ sơ *"
                      value={terminationMonth}
                      onChange={setTerminationMonth}
                      options={['--- Chọn Tháng ---', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))]}
                    />
                    <FormSelect
                      label="Năm cắt hồ sơ *"
                      value={terminationYear}
                      onChange={setTerminationYear}
                      options={[
                        '--- Chọn Năm ---',
                        ...Array.from({ length: 16 }, (_, i) => (new Date().getFullYear() - 10 + i).toString())
                      ]}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 italic">
                    * Lưu ý: Từ tháng/năm nhập trên sẽ không được tính giảm trừ NPT nữa.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsTerminateModalOpen(false);
                  resetTerminateStates();
                }}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleTerminateSave}
                disabled={!terminationTargetId || !terminationMonth || !terminationYear || isSaving}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${!terminationTargetId || !terminationMonth || !terminationYear || isSaving
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                  }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ICONS.Check />
                )}
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value || "---"}</p>
  </div>
);

const AddressViewSection = ({ title, address, theme }: { title: string; address: Address; theme: 'indigo' | 'slate' }) => {
  const bgColor = theme === 'indigo' ? 'bg-indigo-50/50' : 'bg-slate-50';
  const labelColor = theme === 'indigo' ? 'text-indigo-400' : 'text-slate-400';
  const textColor = theme === 'indigo' ? 'text-indigo-900' : 'text-slate-800';
  const borderColor = theme === 'indigo' ? 'border-indigo-100' : 'border-slate-200';

  return (
    <div>
      <h5 className={`text-[10px] font-bold ${labelColor} uppercase tracking-widest mb-3`}>{title}</h5>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 ${bgColor} border ${borderColor} rounded-xl`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Tỉnh/Thành phố</p>
          <p className={`text-sm font-semibold ${textColor}`}>{address.province || "---"}</p>
        </div>
        <div className={`p-3 ${bgColor} border ${borderColor} rounded-xl`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Xã / Phường</p>
          <p className={`text-sm font-semibold ${textColor}`}>{address.ward || "---"}</p>
        </div>
        <div className={`p-3 ${bgColor} border ${borderColor} rounded-xl`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Số nhà / Đường / Tổ</p>
          <p className={`text-sm font-semibold ${textColor}`}>{address.detail || "---"}</p>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({ label, value, onChange, placeholder, type = 'text', error, min }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean; min?: string }) => (
  <div className="flex flex-col">
    <label className={`text-[10px] font-bold uppercase tracking-widest min-h-[44px] flex items-end pb-1.5 ${error ? 'text-rose-500' : 'text-slate-400'}`}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 transition-all text-sm font-medium outline-none ${error
        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 text-rose-900 placeholder:text-rose-300'
        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900'
        }`}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, error, disabled }: { label: string; value: string; onChange: (v: string) => void; options: string[]; error?: boolean; disabled?: boolean }) => (
  <div className="flex flex-col">
    <label className={`text-[10px] font-bold uppercase tracking-widest min-h-[44px] flex items-end pb-1.5 ${error ? 'text-rose-500' : 'text-slate-400'}`}>{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 transition-all text-sm font-medium outline-none appearance-none bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''} ${error
        ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 text-rose-900 bg-[url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23f43f5e%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E\')]'
        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-[url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E\')]'
        }`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const AddressFormSection = ({ title, address, onChange, errors, errorPrefix, locationData }: { title: string; address: Address; onChange: (field: keyof Address, value: string) => void; errors: string[]; errorPrefix: string; locationData: Record<string, string[]> }) => {
  const provinces = Object.keys(locationData).sort();
  const wards = (locationData[address.province] || []).sort();

  return (
    <div className={`p-6 border transition-all rounded-2xl ${errors.some(e => e.startsWith(errorPrefix)) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
      <h5 className={`text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${errors.some(e => e.startsWith(errorPrefix)) ? 'text-rose-500' : 'text-slate-400'}`}>
        <div className={`w-1 h-3 rounded-full ${errors.some(e => e.startsWith(errorPrefix)) ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
        {title}
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchableSelect
          label="Tỉnh/Thành phố *"
          value={address.province}
          onChange={v => onChange('province', v)}
          options={['--- Chọn Tỉnh/Thành phố ---', ...provinces]}
          error={errors.includes(`${errorPrefix}province`)}
        />
        <SearchableSelect
          label="Xã / Phường *"
          value={address.ward}
          onChange={v => onChange('ward', v)}
          options={['--- Chọn Xã / Phường ---', ...wards]}
          error={errors.includes(`${errorPrefix}ward`)}
          disabled={!address.province || address.province.includes('---')}
        />
        <FormInput label="Số nhà / Đường / Tổ *" value={address.detail} onChange={v => onChange('detail', v)} placeholder="VD: Số 5 Duy Tân" error={errors.includes(`${errorPrefix}detail`)} />
      </div>
    </div>
  );
};

export default DependentTab;
