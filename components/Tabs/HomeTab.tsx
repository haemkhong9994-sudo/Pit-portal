
import React from 'react';
import { UserProfile } from '../../types';
import { ICONS } from '../../constants';

interface HomeTabProps {
  user: UserProfile;
  dependentCount: number;
  unconfirmedCount: number;
}

const HomeTab: React.FC<HomeTabProps> = ({ user, dependentCount, unconfirmedCount }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Họ Tên */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
            />
          ) : (
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500 font-medium">Họ và Tên</p>
            <p className="text-xl font-bold text-slate-900" title={user.fullName}>{user.fullName}</p>
          </div>
        </div>

        {/* 2. Số CCCD */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <img
            src="/assets/images/ID.png"
            alt="ID"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('p-3', 'bg-blue-50', 'text-blue-600', 'rounded-lg');
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              svg.setAttribute("width", "20");
              svg.setAttribute("height", "20");
              svg.setAttribute("viewBox", "0 0 24 24");
              svg.setAttribute("fill", "none");
              svg.setAttribute("stroke", "currentColor");
              svg.setAttribute("stroke-width", "2");
              svg.setAttribute("stroke-linecap", "round");
              svg.setAttribute("stroke-linejoin", "round");
              svg.innerHTML = '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/>';
              e.currentTarget.parentElement?.appendChild(svg);
            }}
          />
          <div>
            <p className="text-sm text-slate-500 font-medium">Số CCCD</p>
            <p className="text-xl font-bold text-slate-900">{user.cccd || "---"}</p>
          </div>
        </div>

        {/* 3. Trạng thái MST */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <ICONS.Check />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Trạng thái MST</p>
            <p className={`text-xl font-bold ${user.isVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
              {user.isVerified ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </p>
          </div>
        </div>

        {/* 4. Người phụ thuộc */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative w-12 h-12">
            <img
              src="/assets/images/Ongba.png"
              alt="Ongba"
              className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-white object-cover z-10"
            />
            <img
              src="/assets/images/baby.png"
              alt="Baby"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Người phụ thuộc</p>
            <p className="text-xl font-bold text-slate-900">{dependentCount} người</p>
            {dependentCount > 0 && (
              <p className={`text-xl font-bold ${user.isDependentsVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                {user.isDependentsVerified ? 'Đã xác nhận' : 'Chờ xác nhận'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Hướng dẫn kiểm tra đồng bộ MST */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Hướng dẫn kiểm tra đồng bộ MST</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            <ul className="space-y-8 relative">
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">1</span>
                <p className="font-semibold text-slate-800">Truy cập Cổng thông tin</p>
                <p className="text-sm text-slate-500 mt-1">Vào website <a href="https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium underline">tracuunnt.gdt.gov.vn</a> hoặc ứng dụng eTax Mobile.</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">2</span>
                <p className="font-semibold text-slate-800">Chọn chức năng tra cứu</p>
                <p className="text-sm text-slate-500 mt-1">Chọn phần "Tra cứu thông tin NNT" (Người nộp thuế).</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">3</span>
                <p className="font-semibold text-slate-800">Nhập số CCCD/CMND</p>
                <p className="text-sm text-slate-500 mt-1">Hệ thống sẽ hiển thị mã số thuế TNCN gắn liền với số định danh của bạn.</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">4</span>
                <p className="font-semibold text-slate-800">Cập nhật vào page Mã số thuế TNCN</p>
                <p className="text-sm text-slate-500 mt-1">Kiểm tra thông tin mã số thuế và xác nhận thông tin.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* 2. Hướng dẫn xác nhận người phụ thuộc */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Hướng dẫn xác nhận người phụ thuộc</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            <ul className="space-y-8 relative">
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">1</span>
                <p className="font-semibold text-slate-800">Truy cập ứng dụng eTax Mobile</p>
                <p className="text-sm text-slate-500 mt-1">Đăng nhập vào ứng dụng của Cục thuế bằng tài khoản định danh điện tử <b>VNeID</b>.</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">2</span>
                <p className="font-semibold text-slate-800">Chọn chức năng tra cứu</p>
                <p className="text-sm text-slate-500 mt-1">Chọn menu "Tra cứu thông tin người phụ thuộc".</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">3</span>
                <p className="font-semibold text-slate-800">Xem thông tin chi tiết</p>
                <p className="text-sm text-slate-500 mt-1">Xem và kiểm tra kỹ thông tin chi tiết của từng người phụ thuộc đang được đăng ký.</p>
              </li>
              <li className="pl-10">
                <span className="absolute left-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-500">4</span>
                <p className="font-semibold text-slate-800">Xác nhận tại page Người phụ thuộc</p>
                <p className="text-sm text-slate-500 mt-1">Đối chiếu thông tin trong ứng dụng eTax Mobile và dữ liệu Web, sau đó tích xác nhận.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Mức giảm trừ gia cảnh - Full width at bottom */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-bold text-slate-900">Mức giảm trừ gia cảnh</h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">Thông báo mới</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                Năm 2025
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex justify-between">
                  <span>Giảm trừ bản thân:</span>
                  <span className="font-bold text-slate-900">11.000.000 VNĐ/tháng</span>
                </li>
                <li className="flex justify-between">
                  <span>Mỗi người phụ thuộc:</span>
                  <span className="font-bold text-slate-900">4.400.000 VNĐ/tháng</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                Năm 2026
              </h4>
              <ul className="space-y-2 text-sm text-indigo-800/80">
                <li className="flex justify-between">
                  <span>Giảm trừ bản thân:</span>
                  <span className="font-bold text-indigo-900">15.500.000 VNĐ/tháng</span>
                </li>
                <li className="flex justify-between">
                  <span>Mỗi người phụ thuộc:</span>
                  <span className="font-bold text-indigo-900">6.200.000 VNĐ/tháng</span>
                </li>
                <li className="pt-2 border-t border-indigo-100 flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span>Chế độ Overtime:</span>
                  <span className="text-emerald-600">Miễn thuế 100%</span>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Biểu thuế suất mới (5 bậc)</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: '< 10tr', rate: '5%' },
                    { label: '10-30tr', rate: '10%' },
                    { label: '30-60tr', rate: '20%' },
                    { label: '60-100tr', rate: '30%' },
                    { label: '> 100tr', rate: '35%' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/50 p-2 rounded-lg border border-indigo-50 text-center">
                      <p className="text-[9px] text-slate-500 font-medium mb-1">{item.label}</p>
                      <p className="text-xs font-bold text-indigo-600">{item.rate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeTab;
