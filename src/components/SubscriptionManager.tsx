/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Wallet,
  Clock,
  History
} from 'lucide-react';
import { User, Payment } from '../types';

interface SubscriptionManagerProps {
  user: User;
  payments: Payment[];
  onUpgradeSuccess: (updatedUser: any, newPayment: Payment) => void;
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function SubscriptionManager({ 
  user, 
  payments, 
  onUpgradeSuccess,
  onAddNotification 
}: SubscriptionManagerProps) {
  
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Credit card mockup inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('321');

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onAddNotification('جاري فحص وتأمين المعاملة المالية عبر البوابة...', 'info');

    try {
      const response = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: selectedPlan, paymentMethod }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل معالجة عملية الدفع');
      }

      onUpgradeSuccess(data.user, data.payment);
      setShowCheckout(false);
      onAddNotification(`تهانينا! تم تفعيل اشتراكك بالخطة الممتازة (${selectedPlan === 'monthly' ? 'باقة برو (Pro)' : 'باقة بريميوم (Premium)'}) بنجاح!`, 'success');
    } catch (err: any) {
      console.error('Charge failed:', err);
      onAddNotification('حدث تعثر في تفويض عملية الدفع التجريبية.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: 'free', paymentMethod: 'stripe' }),
      });
      const data = await response.json();
      if (response.ok) {
        onUpgradeSuccess(data.user, null as any);
        onAddNotification('تم إلغاء الاشتراك المدفوع والرجوع إلى الحساب المجاني.', 'info');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Header Titles */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-white font-display">العضويات والاشتراكات المتاحة</h1>
        <p className="text-gray-400 text-sm mt-1">اشترك في باقاتنا الممتازة لفتح حدود الاستخدام والحصول على وصول كامل لموديلات الذكاء الاصطناعي الفائقة</p>
      </div>

      {!showCheckout ? (
        // Plan Selection Grid
        <div className="space-y-12">
          
          {/* Main 3 Tiers cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free Tier */}
            <div className={`bg-[#111827] border rounded-2xl p-6 flex flex-col justify-between ${
              user.planName === 'free' ? 'border-emerald-500 bg-emerald-500/[0.02]' : 'border-gray-800'
            }`}>
              <div className="space-y-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">الباقة الأساسية</span>
                <h3 className="text-2xl font-bold text-white">العضوية المجانية</h3>
                <p className="text-gray-400 text-xs">مناسبة للمذاكرة البسيطة وتجربة البوابة التعليمية.</p>
                
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-xs text-gray-500"> / مجاناً دائماً</span>
                </div>

                <div className="w-full h-px bg-gray-800" />

                <ul className="space-y-3 text-xs text-gray-300">
                  <li className="flex items-center justify-end gap-2">
                    <span>10 أسئلة ذكاء اصطناعي يومياً</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>تحليل 2 ملفات دراسية شهرياً</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2 text-gray-500">
                    <span>بطاقات Flashcards مقتضبة</span>
                    <Check className="w-4 h-4 text-gray-600" />
                  </li>
                </ul>
              </div>

              {user.planName === 'free' ? (
                <div className="mt-8 text-center py-2.5 bg-gray-800/80 text-xs text-gray-300 rounded-lg font-semibold border border-gray-700">
                  باقة حسابك النشط حالياً
                </div>
              ) : (
                <button
                  onClick={handleDowngrade}
                  disabled={loading}
                  className="mt-8 w-full py-2.5 bg-gray-950 border border-gray-800 hover:bg-gray-900 text-xs text-gray-400 hover:text-white rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  الرجوع للباقة المجانية
                </button>
              )}
            </div>

            {/* Monthly Premium Tier */}
            <div className={`bg-[#111827] border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden ${
              user.planName === 'monthly' ? 'border-emerald-500 bg-emerald-500/[0.02]' : 'border-emerald-600/30 shadow-lg shadow-emerald-950/20'
            }`}>
              {/* Popular badge */}
              <div className="absolute top-3 left-3 bg-emerald-600 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full text-white">
                الأكثر طلباً 🌟
              </div>

              <div className="space-y-4">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">الباقة الاحترافية</span>
                <h3 className="text-2xl font-bold text-white">باقة برو (Pro)</h3>
                <p className="text-gray-400 text-xs">أفضل باقة للطلاب والمذاكرة اليومية وتوليد الاختبارات.</p>
                
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-white font-mono">$2.99</span>
                  <span className="text-xs text-gray-500"> / شهرياً</span>
                </div>

                <div className="w-full h-px bg-gray-800" />

                <ul className="space-y-3 text-xs text-gray-300">
                  <li className="flex items-center justify-end gap-2">
                    <span>محادثات ذكاء اصطناعي غير محدودة</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>رفع وتحليل ملفات لا محدود (PDF, الصور)</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>توليد وتصحيح اختبارات آلي فوري</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>استضافة وتصدير كود وجداول الدراسة</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                </ul>
              </div>

              {user.planName === 'monthly' ? (
                <div className="mt-8 text-center py-2.5 bg-emerald-600/10 text-xs text-emerald-400 rounded-lg font-semibold border border-emerald-500/20">
                  عضويتك النشطة حالياً
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlan('monthly');
                    setShowCheckout(true);
                  }}
                  className="mt-8 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-lg shadow-emerald-950/20"
                >
                  الترقية لباقة برو
                </button>
              )}
            </div>

            {/* Annual Premium Tier */}
            <div className={`bg-[#111827] border rounded-2xl p-6 flex flex-col justify-between ${
              user.planName === 'yearly' ? 'border-emerald-500 bg-emerald-500/[0.02]' : 'border-gray-800'
            }`}>
              <div className="space-y-4">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">باقة الفئة الفائقة</span>
                <h3 className="text-2xl font-bold text-white">باقة بريميوم (Premium)</h3>
                <p className="text-gray-400 text-xs">سرعة معالجة فائقة، وأولوية الصياغة والتحميل بضغطة زر.</p>
                
                <div className="my-4">
                  <span className="text-3xl font-extrabold text-white font-mono">$9.99</span>
                  <span className="text-xs text-gray-500"> / شهرياً</span>
                </div>

                <div className="w-full h-px bg-gray-800" />

                <ul className="space-y-3 text-xs text-gray-300">
                  <li className="flex items-center justify-end gap-2">
                    <span>كل ميزات الاشتراك برو (Pro)</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>سيرفرات فائقة السرعة وأولوية الصياغة</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                  <li className="flex items-center justify-end gap-2">
                    <span>تحميل كود وتطبيقات الجوال بضغطة زر</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </li>
                </ul>
              </div>

              {user.planName === 'yearly' ? (
                <div className="mt-8 text-center py-2.5 bg-emerald-600/10 text-xs text-emerald-400 rounded-lg font-semibold border border-emerald-500/20">
                  عضويتك النشطة حالياً
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlan('yearly');
                    setShowCheckout(true);
                  }}
                  className="mt-8 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-lg"
                >
                  الترقية لباقة بريميوم
                </button>
              )}
            </div>

          </div>

          {/* Secure gateway trust badges */}
          <div className="bg-gray-900/40 border border-gray-800/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>معتمد من Stripe</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>تشفير 256 بت</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed text-right">
              بوابة الدفع لدينا مؤمنة بالكامل ومتوافقة مع المعايير البنكية العالمية الصارمة. لا يتم تخزين أي بيانات سرية على خوادمنا نهائياً.
            </p>
          </div>

          {/* Payments Logs History (1/3 height) */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-end gap-2">
              <span>تاريخ مدفوعاتك السابقة</span>
              <History className="w-5 h-5 text-gray-400" />
            </h2>

            {payments.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لم تسجل أي مدفوعات مسبقة.</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-right">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500">
                      <th className="pb-3 text-left">الحالة</th>
                      <th className="pb-3 text-center">طريقة الدفع</th>
                      <th className="pb-3 text-center">المبلغ</th>
                      <th className="pb-3 text-right">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-800/40 text-gray-300">
                        <td className="py-3 text-left">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full">
                            ناجحة
                          </span>
                        </td>
                        <td className="py-3 text-center uppercase text-xs font-semibold">{p.paymentMethod}</td>
                        <td className="py-3 text-center font-bold font-mono">${p.amount.toFixed(2)}</td>
                        <td className="py-3 text-right text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      ) : (
        // Checkout Gateway Form (Stripe/PayPal Visual Mock)
        <div className="max-w-md mx-auto bg-[#111827] border border-gray-800 p-8 rounded-2xl space-y-6 relative">
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white font-display">تأمين حجز العضوية الممتازة</h2>
            <p className="text-gray-400 text-xs mt-1">
              الخطة المختارة: <span className="text-emerald-400 font-bold">{selectedPlan === 'monthly' ? 'برو ($2.99)' : 'بريميوم ($9.99)'}</span>
            </p>
          </div>

          {/* Payment selector toggle */}
          <div className="grid grid-cols-2 gap-3 bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMethod === 'paypal' ? 'bg-[#1f2937] text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>PayPal</span>
            </button>
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMethod === 'stripe' ? 'bg-[#1f2937] text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Stripe</span>
            </button>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-right">
            {paymentMethod === 'stripe' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">رقم بطاقة الائتمان</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">الرمز السري (CVC)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-center font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-center font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // PayPal quick authentication mock fields
              <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl space-y-3">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">بوابة PayPal ساندبوكس</span>
                <p className="text-xs text-gray-400">سيتم فتح نافذة PayPal آمنة لتسجيل دخولك وتأكيد حجز العضوية.</p>
                <div className="bg-[#ffc439] hover:bg-[#f2ba36] text-blue-950 font-bold py-2 text-center rounded-lg text-xs cursor-pointer shadow">
                  PayPal Checkout 💳
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-md shadow-emerald-950/20 disabled:opacity-50"
            >
              {loading ? 'يجري الترخيص والتحقق آمن...' : `تأكيد الدفع والاستمرار`}
            </button>

            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="w-full py-2 bg-transparent text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              إلغاء المعاملة والرجوع
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
