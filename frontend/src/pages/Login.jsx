import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png'; 

const Login = () => {
    const [email, setEmail] = useState('littleseeds@gmail.com');
    const [password, setPassword] = useState('Patna@2026');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/admin-login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('admin', JSON.stringify(res.data.admin));
                toast.success('Welcome back, Admin!', {
                  icon: '👋',
                  duration: 4000,
                });
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 800);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#EBF0F5] flex items-center justify-center p-4 overflow-hidden" 
             style={{ fontFamily: "'Roboto', sans-serif" }}>
            
            {/* Main Login Card - Refined Proportions (920px x 520px) */}
            <div className="w-full max-w-[920px] bg-white rounded-[32px] shadow-[0_15px_60px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row h-auto min-h-[520px] relative z-20">
                
                {/* LEFT SIDE: Branding Panel (Larger Width - 62%) */}
                <div className="hidden md:flex md:w-[62%] bg-gradient-to-br from-[#F5F8FF] to-[#EFF3FF] p-10 flex-col items-center justify-center text-center relative overflow-hidden border-r border-[#EDF2F7]">
                    
                    {/* Top Left Corner Round Effect - Premium Detail */}
                    <div className="absolute top-[-30px] left-[-30px] w-32 h-32 bg-white rounded-full opacity-40 blur-sm pointer-events-none"></div>
                    <div className="absolute top-[-60px] left-[-60px] w-48 h-48 border-[20px] border-white/30 rounded-full pointer-events-none"></div>
                    
                    <div className="relative mb-6 transform transition-transform duration-700 hover:rotate-1 scale-[0.85]">
                        <img 
                          src={logoImg} 
                          alt="Logo" 
                          className="w-56 drop-shadow-2xl"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Logo'; }}
                        />
                    </div>
                    
                    <h2 className="text-[24px] font-black leading-tight mb-4 tracking-tighter">
                        <span className="text-[#6366F1]">School</span>{' '}
                        <span className="text-[#F97316]">Management</span>{' '}
                        <span className="text-[#22C55E]">System</span>
                    </h2>

                    <p className="text-[12px] font-bold text-slate-400 max-w-[280px] leading-relaxed mb-8">
                        The ultimate solution for modern school administration.
                    </p>

                    <div className="inline-flex items-center space-x-2 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full text-[#6366F1] font-black text-[9px] uppercase tracking-widest shadow-sm">
                        <ShieldCheck size={14} fill="#C7D2FE" strokeWidth={2.5} />
                        <span>Trusted by Little Seeds</span>
                    </div>

                    {/* Bottom Right Shape */}
                    <div className="absolute bottom-[-40px] right-[-40px] w-32 h-32 bg-[#E0E7FF] rounded-full opacity-30"></div>
                </div>

                {/* RIGHT SIDE: Login Form Panel (Narrower Width - 38%) */}
                <div className="flex-1 md:w-[38%] p-8 md:p-10 flex flex-col bg-white relative justify-center">
                    
                    {/* Centered Top Logo */}
                    <div className="absolute top-8 left-0 w-full flex justify-center">
                         <img src={logoImg} alt="Center Logo" className="w-16 drop-shadow-sm opacity-100" />
                    </div>

                    <div className="mt-14 mb-8 text-center">
                        <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.25em] mb-1 leading-none">Admin Portal</p>
                        <h1 className="text-[28px] font-black text-slate-900 leading-none mb-2 tracking-tighter">Sign In</h1>
                        <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto">Access your control panel</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="px-3 py-2 bg-rose-50 border-l-2 border-rose-500 text-rose-700 text-[10px] font-bold rounded flex items-center space-x-2">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors">
                                    <User size={14} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[42px] pl-9 pr-4 bg-[#F5F8FF] border-none rounded-xl text-[12px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-sans"
                                    placeholder="littleseeds@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors">
                                    <Lock size={14} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[42px] pl-9 pr-9 bg-[#F5F8FF] border-none rounded-xl text-[12px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-sans"
                                    placeholder="••••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6366F1] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} strokeWidth={2.5} /> : <Eye size={14} strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-200 text-[#6366F1] focus:ring-[#6366F1]/10 cursor-pointer" />
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 select-none">Remember</span>
                            </label>
                            <button type="button" className="text-[11px] font-black text-[#6366F1] hover:text-[#4F46E5] transition-colors">Forgot?</button>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full h-[46px] bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:to-[#4338CA] text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={18} strokeWidth={3} />}
                            <span>{loading ? 'Entering...' : 'Sign In Now'}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="group text-[10px] font-black text-slate-400 hover:text-[#6366F1] transition-colors flex items-center justify-center mx-auto space-x-1 uppercase tracking-widest"
                        >
                           <span><ArrowRight className="rotate-180 transform group-hover:-translate-x-1 transition-transform" size={12} strokeWidth={3} /></span>
                           <span>Main website</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtle Attribution */}
            <div className="absolute bottom-4 left-0 w-full text-center">
                <p className="text-[8px] font-black text-slate-400/40 uppercase tracking-[0.3em]">Little Seeds Management Portal</p>
            </div>
        </div>
    );
};

export default Login;
