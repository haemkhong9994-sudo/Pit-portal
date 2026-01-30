
import React, { useState } from 'react';
import { ICONS } from '../../constants';
import { login } from '../../api';
import { UserProfile } from '../../types';

interface LoginProps {
    onLoginSuccess: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(username, password);
            if (result.status === 'success') {
                // Auto-collection of user data from the sheet
                const userProfile: UserProfile = {
                    fullName: result.user.fullName,
                    email: result.user.email,
                    role: result.user.role,
                    avatarUrl: result.user.avatarUrl,
                    cccd: result.user.cccd?.toString() || '',
                    taxId: result.user.taxId?.toString() || '',
                    dependentCount: Number(result.user.dependentCount) || 0,
                    isVerified: result.user.isVerified || false,
                    isDependentsVerified: result.user.isDependentsVerified || false,
                    note: result.user.note || '',
                    taxSyncStatus: result.user.taxSyncStatus || 'unknown'
                };
                onLoginSuccess(userProfile);
            } else {
                setError(result.message || 'Sai tên đăng nhập hoặc mật khẩu.');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra kết nối tới máy chủ.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#00AAEB] relative overflow-hidden font-sans">
            {/* Animated Floating Dots Background */}
            <div className="absolute inset-0 z-0 opacity-60">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="floating-dot"
                        style={{
                            width: `${Math.random() * 8 + 3}px`,
                            height: `${Math.random() * 8 + 3}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 20 + 10}s`,
                            animationDelay: `${Math.random() * 10}s`,
                        }}
                    ></div>
                ))}
            </div>

            {/* Dynamic Background Elements for brand consistency */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full animate-pulse duration-700"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-black/10 mb-6 transition-transform overflow-hidden">
                        <img
                            src="/assets/images/Mynavi_logo_doc.png"
                            alt="Mynavi Logo"
                            className="w-full h-full object-contain p-2"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">PIT Portal</h1>
                    <p className="text-white/80 font-bold text-xs uppercase tracking-widest">Mynavi Techtus Vietnam</p>
                </div>

                <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[32px] p-8 shadow-2xl shadow-black/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                                    <ICONS.Plus />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/20 border border-white/20 focus:border-white focus:ring-4 focus:ring-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium placeholder:text-white/40 outline-none transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                                    <ICONS.Info />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/20 border border-white/20 focus:border-white focus:ring-4 focus:ring-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium placeholder:text-white/40 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-white/20 border border-white/30 rounded-xl p-4 flex items-center gap-3 text-white animate-in slide-in-from-top-2">
                                <ICONS.AlertTriangle />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-[#00AAEB] hover:bg-white/90 font-black py-4 rounded-2xl shadow-xl shadow-black/5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-[#00AAEB]/30 border-t-[#00AAEB] rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ICONS.Check />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-tighter">Bản quyền © 2026 Mynavi Techtus Việt Nam</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
