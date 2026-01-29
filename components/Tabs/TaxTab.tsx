
import React, { useState } from 'react';
import { UserProfile, TaxSyncStatus } from '../../types';
import { ICONS } from '../../constants';
import { saveToGoogleSheet } from '../../api';

interface TaxTabProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const TaxTab: React.FC<TaxTabProps> = ({ user, setUser }) => {
  const [localTaxId, setLocalTaxId] = useState(user.taxId);
  const [localNote, setLocalNote] = useState(user.note);
  const [isConfirmed, setIsConfirmed] = useState(user.isVerified);
  // If user is already verified, use the sync status from profile
  const [syncStatus, setSyncStatus] = useState<TaxSyncStatus | 'none'>(
    user.isVerified ? (user.taxSyncStatus as TaxSyncStatus) : 'none'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (syncStatus === 'none' || !isConfirmed) {
      alert('Vui lòng chọn trạng thái đồng bộ và tích xác nhận trước khi lưu.');
      return;
    }

    setIsSaving(true);

    const sheetData = {
      type: 'MST',
      userEmail: user.email,
      fullName: user.fullName,
      cccd: "'" + user.cccd,
      taxId: "'" + localTaxId,
      syncStatus: syncStatus === 'synced' ? 'Đã đồng bộ' : 'Chưa đồng bộ',
      note: localNote,
      isConfirmed: isConfirmed
    };

    try {
      await saveToGoogleSheet(sheetData);

      setUser({
        ...user,
        taxId: localTaxId,
        note: localNote,
        isVerified: isConfirmed,
        taxSyncStatus: syncStatus as TaxSyncStatus
      });
      setIsSaving(false);
      alert('Thông tin đã được cập nhật thành công.');
    } catch (error) {
      setIsSaving(false);
      alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
    }
  };

  const isReadOnly = user.isVerified;
  const canSave = syncStatus !== 'none' && isConfirmed && !isSaving;

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Xác nhận Mã số thuế</h3>
            <p className="text-sm text-slate-500 mt-1">Vui lòng kiểm tra và hoàn thiện thông tin định danh thuế cá nhân.</p>
          </div>
          {isReadOnly && (
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              ĐÃ HOÀN TẤT
            </span>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* Read Only Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ và Tên</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium opacity-80">
                {user.fullName}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Công ty</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium opacity-80">
                {user.email}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số CCCD</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium opacity-80">
                {user.cccd}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã số thuế TNCN</label>
              <input
                type="text"
                value={localTaxId}
                disabled={true}
                placeholder="Nhập mã số thuế"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium opacity-80 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Sync Status Radio Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trạng thái đồng bộ định danh <span className="text-rose-500">*</span>
            </label>
            <div className={`grid grid-cols-1 gap-3 ${isReadOnly ? 'pointer-events-none' : ''}`}>
              <button
                type="button"
                onClick={() => setSyncStatus('synced')}
                disabled={isReadOnly}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group ${syncStatus === 'synced'
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  } ${isReadOnly && syncStatus !== 'synced' ? 'opacity-40' : ''}`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${syncStatus === 'synced' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                  {syncStatus === 'synced' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <p className={`text-sm font-bold ${syncStatus === 'synced' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    Mã số thuế đã được đồng bộ cùng Số CCCD
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">(MST trùng CCCD: Dãy 12 số)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSyncStatus('unsynced')}
                disabled={isReadOnly}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group ${syncStatus === 'unsynced'
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  } ${isReadOnly && syncStatus !== 'unsynced' ? 'opacity-40' : ''}`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${syncStatus === 'unsynced' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                  {syncStatus === 'unsynced' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <p className={`text-sm font-bold ${syncStatus === 'unsynced' ? 'text-indigo-900' : 'text-slate-800'}`}>
                    Mã số thuế chưa được đồng bộ cùng CCCD
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">(MST vẫn là dãy 10 số)</p>
                </div>
              </button>
            </div>
            {syncStatus === 'none' && !isReadOnly && (
              <p className="text-[10px] text-rose-500 font-bold ml-1 animate-pulse italic">* Vui lòng chọn một trong hai trạng thái trên</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú (Note)</label>
            <textarea
              rows={3}
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              disabled={isReadOnly}
              placeholder="Ví dụ: Đã đổi CCCD mới, Đã có MST từ năm 2020..."
              className={`w-full px-4 py-3 bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-900 transition-all ${isReadOnly ? 'bg-slate-50 cursor-not-allowed border-slate-200' : ''}`}
            />
          </div>

          {/* Validation Banner or Success Banner */}
          {isReadOnly ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 animate-in fade-in zoom-in-95">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <ICONS.Check />
              </div>
              <p className="text-sm font-bold">Thông tin đã được cập nhật và xác nhận thành công.</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <ICONS.AlertTriangle />
              <div className="text-sm">
                <p className="font-bold">Chưa xác nhận thông tin</p>
                <p className="opacity-90">Bạn cần chọn trạng thái đồng bộ và tích vào ô xác nhận bên dưới để Lưu thông tin.</p>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox - Hidden when Verified */}
          {!isReadOnly && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-6 h-6 border-2 rounded transition-all flex items-center justify-center ${isConfirmed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                  {isConfirmed && <div className="text-white scale-125"><ICONS.Check /></div>}
                </div>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                Tôi xác nhận thông tin mã số thuế trên là chính xác <span className="text-rose-500">*</span>
              </span>
            </label>
          )}
        </div>

        {/* Action Bar - Hidden when Verified */}
        {!isReadOnly && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-lg transition-all ${canSave
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none'
                }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ICONS.FileText />
              )}
              Lưu thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxTab;
