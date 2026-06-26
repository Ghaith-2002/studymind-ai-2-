/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ ما أثناء المصادقة');
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'apple') => {
    setLoading(true);
    setTimeout(() => {
      // Simulate quick OAuth success
      const simulatedUser: UserType = {
        id: 'user_oauth',
        name: provider === 'google' ? 'أحمد محمد (جوجل)' : 'أحمد محمد (آبل)',
        email: 'student@studymind.ai',
        subscriptionId: 'sub_free',
        planName: 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setLoading(false);
      onAuthSuccess(simulatedUser);
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('الرجاء كتابة بريدك الإلكتروني أولاً لإرسال رابط الاستعادة.');
      return;
    }
    setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
  };

  return (
    <div className="min-height-screen flex items-center justify-center bg-[#0b0f19] px-4 py-16 relative overflow-hidden font-sans">
      {/* Background visual effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2563eb]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-xl mb-4 border border-emerald-500/30">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">StudyMind AI</h1>
          <p className="text-sm text-gray-400 mt-2">مساعدك الذكي المتكامل للدراسة والتعليم</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-4 text-right">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-sm p-3 rounded-lg mb-4 text-right">
            {message}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1f2937] border border-gray-700 text-white pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 text-right transition-all"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1f2937] border border-gray-700 text-white pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 text-right transition-all"
              />
              <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-emerald-400 hover:underline hover:text-emerald-300 transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
              <label className="block text-sm font-medium text-gray-300">كلمة المرور</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1f2937] border border-gray-700 text-white pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 text-right transition-all"
              />
              <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'دخول إلى حسابك' : 'تسجيل حساب جديد'}</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <span className="relative bg-[#111827] px-3 text-xs text-gray-500">أو سجل دخول سريع عبر</span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 border border-gray-800 hover:border-gray-700 bg-[#111827] text-sm text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 border border-gray-800 hover:border-gray-700 bg-[#111827] text-sm text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {/* Apple Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"
              />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? (
              <>
                ليس لديك حساب؟ <span className="text-emerald-400 font-medium">سجل الآن مجاناً</span>
              </>
            ) : (
              <>
                لديك حساب بالفعل؟ <span className="text-emerald-400 font-medium">سجل الدخول</span>
              </>
            )}
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
          <ShieldCheck className="w-4 h-4" />
          <span>تشفير بيانات آمن ومدعوم ومحمي بالكامل</span>
        </div>
      </div>
    </div>
  );
}
