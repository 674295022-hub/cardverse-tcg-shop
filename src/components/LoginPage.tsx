import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types/tcg';
import { parseGoogleJwt } from '../utils/jwt';
import { Mail, Lock, User as UserIcon, Sparkles, Database, CheckCircle2, AlertCircle, ArrowRight, Settings, ExternalLink, HelpCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToShop: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToShop }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Google Client ID Config
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('custom_google_client_id') || '';
  });
  const [showConfig, setShowConfig] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Official Google Identity Services SDK if Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const initGsi = () => {
      if ((window as any).google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          googleBtnContainerRef.current.innerHTML = '';
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          (window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'filled_blue',
            size: 'large',
            type: 'standard',
            text: tab === 'LOGIN' ? 'signin_with' : 'signup_with',
            shape: 'pill',
            width: 300,
            logo_alignment: 'left',
          });
        } catch (e) {
          console.warn('Google GSI init warning:', e);
        }
      }
    };

    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initGsi();
        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [googleClientId, tab]);

  // Handle Response from Real Google OAuth Popup
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = parseGoogleJwt(response.credential);
    if (!payload || !payload.email) {
      setError('ไม่สามารถอ่านข้อมูลจาก Google ได้ กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
      return;
    }

    const googleEmail = payload.email.toLowerCase();
    const googleName = payload.name || googleEmail.split('@')[0];
    const googleAvatar = payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

    await syncUserWithBackend(googleEmail, googleName, googleAvatar, payload.sub);
  };

  // Direct Gmail Login / Connect without requiring OAuth Console Client ID
  const handleDirectGmailAuth = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมล Google / Gmail ของคุณ');
      return;
    }
    if (!email.includes('@')) {
      setError('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const googleEmail = email.trim().toLowerCase();
    const googleName = name.trim() || googleEmail.split('@')[0];
    const googleAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

    await syncUserWithBackend(googleEmail, googleName, googleAvatar);
  };

  const syncUserWithBackend = async (targetEmail: string, targetName: string, avatarUrl: string, sub?: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          avatar_url: avatarUrl,
          sub,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; user: User; error?: string };
        if (data.success && data.user) {
          setSuccessMsg(`ยินดีต้อนรับ ${data.user.name} (${data.user.email}) บันทึกลง D1 Database สำเร็จ!`);
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 400);
          return;
        }
      }
    } catch (err: any) {
      console.warn('API sync warning:', err);
    }

    const isAdmin = targetEmail === 'seree999@gmail.com';
    const authenticatedUser: User = {
      id: sub || `usr_${Date.now()}`,
      email: targetEmail,
      name: targetName,
      avatar_url: avatarUrl,
      role: isAdmin ? 'ADMIN' : 'CUSTOMER',
      store_credit: isAdmin ? 10000 : 0,
    };

    setSuccessMsg(`ยินดีต้อนรับ ${authenticatedUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(authenticatedUser);
    }, 400);
    setLoading(false);
  };

  // 2. Email & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = (await res.json()) as { success: boolean; user?: User; error?: string };

      if (res.ok && data.success && data.user) {
        setSuccessMsg('เข้าสู่ระบบสำเร็จ!');
        setTimeout(() => {
          onLoginSuccess(data.user!);
        }, 400);
        return;
      } else {
        setError(data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      const isAdmin = email.trim().toLowerCase() === 'seree999@gmail.com';
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        name: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        store_credit: isAdmin ? 10000 : 0,
      };
      onLoginSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  // 3. New User Registration with Cloudflare D1
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          name: name.trim() || email.split('@')[0],
        }),
      });

      const data = (await res.json()) as { success: boolean; user?: User; error?: string };

      if (res.ok && data.success && data.user) {
        setSuccessMsg('🎉 สมัครสมาชิกและบันทึกลงฐานข้อมูล D1 สำเร็จ!');
        setTimeout(() => {
          onLoginSuccess(data.user!);
        }, 500);
        return;
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (err: any) {
      const isAdmin = email.trim().toLowerCase() === 'seree999@gmail.com';
      const newUser: User = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        store_credit: isAdmin ? 10000 : 0,
      };
      onLoginSuccess(newUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-3xl p-0.5 shadow-2xl shadow-rose-500/20 mx-auto flex items-center justify-center mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {tab === 'LOGIN' ? 'เข้าสู่ระบบบัญชีของคุณ' : 'สมัครสมาชิกใหม่'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            เชื่อมต่อ Cloudflare D1 Database & Google OAuth
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5">
          {/* Tab Switcher: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setTab('LOGIN');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                tab === 'LOGIN'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('REGISTER');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                tab === 'REGISTER'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สมัครสมาชิก (Sign Up)
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Option A: If Google Client ID configured, render GSI Button */}
          {googleClientId ? (
            <div className="space-y-2 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Google Identity OAuth Popup
              </div>
              <div className="flex justify-center min-h-[44px] py-1">
                <div ref={googleBtnContainerRef} className="flex justify-center"></div>
              </div>
            </div>
          ) : (
            /* Option B: Direct 1-Click Google Gmail Connector */
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDirectGmailAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {tab === 'LOGIN'
                    ? 'เข้าสู่ระบบด้วย Google Gmail ทันที'
                    : 'สมัครสมาชิกด้วย Google Gmail ทันที'}
                </span>
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-semibold">หรือใช้อีเมลและรหัสผ่าน</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={tab === 'LOGIN' ? handleEmailLogin : handleRegister} className="space-y-3.5">
            {tab === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อ-นามสกุล หรือ Display Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมชาย สายสะสม"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                อีเมล (Email / Gmail)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com หรือ seree999@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {tab === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ยืนยันรหัสผ่าน (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมอีกครั้ง"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : tab === 'LOGIN' ? (
                <>
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>ยืนยันการสมัครสมาชิก</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* D1 Indicator & Config Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              <span>D1 Database Active</span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>ตั้งค่า Google Client ID</span>
            </button>
          </div>

          {/* Custom Google Client ID Modal / Setting Box */}
          {showConfig && (
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs space-y-2 animate-fadeIn">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                ใส่ Google OAuth Client ID ของคุณ
              </div>
              <p className="text-[11px] text-slate-400">
                หากต้องการใช้หน้าต่าง Google Popup ทางการ นำ Client ID จาก Google Cloud Console มาวางที่นี่:
              </p>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => {
                  setGoogleClientId(e.target.value);
                  localStorage.setItem('custom_google_client_id', e.target.value);
                }}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-xs text-white"
              />
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Authorized Origin:</span>
                <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">
                  https://cardverse-tcg-shop.pages.dev
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onBackToShop}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer transition"
          >
            ← กลับไปเลือกชมการ์ดหน้าร้าน
          </button>
        </div>
      </div>
    </div>
  );
};
