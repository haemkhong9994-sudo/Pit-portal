
import React from 'react';
import { ICONS } from '../../constants';

const OverallTab: React.FC = () => {
  // Mock data for Admin statistics
  const stats = {
    totalEmployees: 450,
    verifiedTax: 382,
    unverifiedTax: 68,
    dependentEdits: 124,
    newDependents: 42
  };

  const verifiedPercentage = Math.round((stats.verifiedTax / stats.totalEmployees) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-slate-900">Báo cáo Tổng quan (Admin)</h3>
        <p className="text-slate-500">Thống kê dữ liệu thuế và người phụ thuộc trên toàn hệ thống.</p>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tổng nhân sự" 
          value={stats.totalEmployees} 
          icon={<ICONS.Users />} 
          color="indigo" 
        />
        <StatCard 
          label="Đã xác nhận MST" 
          value={stats.verifiedTax} 
          icon={<ICONS.Check />} 
          color="emerald" 
          subValue={`${verifiedPercentage}%`}
        />
        <StatCard 
          label="Chưa xác nhận MST" 
          value={stats.unverifiedTax} 
          icon={<ICONS.AlertTriangle />} 
          color="amber" 
          subValue={`${100 - verifiedPercentage}%`}
        />
        <StatCard 
          label="Tổng người phụ thuộc" 
          value={stats.verifiedTax + stats.newDependents} 
          icon={<ICONS.Users />} 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Status Chart */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ICONS.FileText />
            Trạng thái xác nhận Mã số thuế
          </h4>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Hoàn thành xác nhận</span>
                <span className="text-sm font-bold text-indigo-600">{verifiedPercentage}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${verifiedPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Đã xác nhận</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.verifiedTax}</p>
                <p className="text-xs text-indigo-600 font-medium">Nhân viên</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Chưa xác nhận</p>
                <p className="text-2xl font-bold text-amber-900">{stats.unverifiedTax}</p>
                <p className="text-xs text-amber-600 font-medium">Cần đôn đốc</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dependent Activity Section */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ICONS.Users />
            Hoạt động Người phụ thuộc (Tháng này)
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm">
                  <ICONS.Plus />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900 leading-tight">Thêm mới</p>
                  <p className="text-xs text-emerald-600">Hồ sơ đăng ký mới</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-900">+{stats.newDependents}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 leading-tight">Chỉnh sửa</p>
                  <p className="text-xs text-blue-600">Yêu cầu thay đổi thông tin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-900">{stats.dependentEdits}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
             <p className="text-xs text-slate-500 italic">Dữ liệu được cập nhật tự động mỗi 15 phút từ hệ thống HRIS</p>
          </div>
        </section>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber' | 'blue';
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, subValue }) => {
  const themes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${themes[color]} border shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
           <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
           {subValue && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${themes[color]}`}>{subValue}</span>}
        </div>
      </div>
    </div>
  );
};

export default OverallTab;
