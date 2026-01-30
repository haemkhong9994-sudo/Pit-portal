
import React, { useState } from 'react';
import { ActiveTab, UserProfile, Dependent, DependentStatus } from './types';
import { ICONS } from './constants';
import HomeTab from './components/Tabs/HomeTab';
import TaxTab from './components/Tabs/TaxTab';
import DependentTab from './components/Tabs/DependentTab';
import OverallTab from './components/Tabs/OverallTab';
import './index.css';

const MOCK_USER: UserProfile = {
  fullName: 'Nguyễn Văn A',
  email: 'a.nguyen@company.com',
  cccd: '012345678901',
  taxId: '8123456789',
  isVerified: false,
  isDependentsVerified: false,
  note: '',
  taxSyncStatus: 'unsynced'
};

const MOCK_DEPENDENTS: Dependent[] = [
  {
    id: '1',
    fullName: 'Trần Thị B',
    taxId: '9876543210',
    dob: '1960-05-15',
    cccd: '034567890123',
    relationship: 'Cha/mẹ',
    permanentAddress: {
      province: 'Hà Nội',
      ward: 'Hàng Đào',
      detail: '12 Hàng Đào'
    },
    currentAddress: {
      province: 'Hà Nội',
      ward: 'Dịch Vọng',
      detail: 'Số 5 Duy Tân'
    },
    status: DependentStatus.SUCCESS_INCREASE,
    startDate: '01/2023',
    endDate: '',
    salaryDeductionDate: '01/2023',
    paperDocDate: '2026-02-01',
    isConfirmed: false,
    isInfoChecked: false,
    isSent: false,
    isTerminated: false
  }
];

import Login from './components/Auth/Login';
import { getDependents } from './api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('pit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const handleLogin = (u: UserProfile) => {
    localStorage.setItem('pit_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('pit_user');
    setUser(null);
  };

  React.useEffect(() => {
    if (user?.email) {
      const fetchDependents = async () => {
        setIsLoadingData(true);
        try {
          const result = await getDependents(user.email);
          if (result.status === 'success') {
            setDependents(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching dependents:", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchDependents();
    } else {
      setDependents([]);
    }
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const renderContent = () => {
    const unconfirmedCount = dependents.filter(d => !d.isConfirmed).length;
    switch (activeTab) {
      case 'home':
        return <HomeTab user={user} dependentCount={user.dependentCount ?? dependents.length} unconfirmedCount={unconfirmedCount} />;
      case 'tax':
        return <TaxTab user={user} setUser={setUser} />;
      case 'dependents':
        return <DependentTab dependents={dependents} setDependents={setDependents} user={user} />;
      case 'overall':
        return user.role === 'Admin' ? <OverallTab /> : <HomeTab user={user} dependentCount={dependents.length} unconfirmedCount={unconfirmedCount} />;
      default:
        return <HomeTab user={user} dependentCount={dependents.length} unconfirmedCount={unconfirmedCount} />;
    }
  };

  const isAdmin = user.role === 'Admin';

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-700">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-[#00AAEB] text-white flex-shrink-0 flex flex-col shadow-xl z-20 h-auto md:h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="bg-white p-1.5 rounded-lg text-[#00AAEB]">PIT</span>
            Portal
          </h1>
          <p className="text-xs text-indigo-50 mt-1 opacity-80 uppercase tracking-tighter font-bold">Mynavi Techtus Vietnam</p>
        </div>

        <div className="mt-4 px-3 space-y-1 flex-1">
          <NavItem
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
            icon={<ICONS.Home />}
            label="Home"
          />
          <NavItem
            active={activeTab === 'tax'}
            onClick={() => setActiveTab('tax')}
            icon={<ICONS.FileText />}
            label="Mã số thuế TNCN"
          />
          <NavItem
            active={activeTab === 'dependents'}
            onClick={() => setActiveTab('dependents')}
            icon={<ICONS.Users />}
            label="Người phụ thuộc"
          />

          {isAdmin && (
            <>
              <div className="pt-6 pb-2 px-4 border-t border-white/10 mt-4">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Dành cho Admin</p>
              </div>
              <NavItem
                active={activeTab === 'overall'}
                onClick={() => setActiveTab('overall')}
                icon={<ICONS.LayoutDashboard />}
                label="Thống kê Tổng quan"
              />
            </>
          )}
        </div>

        <div className="mx-4 mb-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
          <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Liên hệ hỗ trợ
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-6 h-6 rounded overflow-hidden group-hover:scale-110 transition-transform flex-shrink-0">
                <img src="/assets/images/slack.png" alt="Slack" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-none">Bint</p>
                <p className="text-[9px] text-white/50 font-medium">Slack Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-6 h-6 rounded overflow-hidden group-hover:scale-110 transition-transform flex-shrink-0">
                <img src="/assets/images/slack.png" alt="Slack" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-none">OanhTT</p>
                <p className="text-[9px] text-white/50 font-medium">Slack Support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 text-[10px] font-bold text-white/40 border-t border-white/10 flex justify-between items-center bg-black/5">
          <span>V1.0.0 © 2026 Mynavi</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'home' && "Thông tin chung"}
            {activeTab === 'tax' && "Thông tin Mã số thuế"}
            {activeTab === 'dependents' && "Danh sách Người phụ thuộc"}
            {activeTab === 'overall' && "Bảng điều khiển Quản trị"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <ICONS.LogOut />
            </button>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
      : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
