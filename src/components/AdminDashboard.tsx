/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Activity, 
  Settings, 
  Database, 
  Cpu, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  Save, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface AdminDashboardProps {
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AdminDashboard({ onAddNotification }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'providers' | 'users'>('metrics');

  // AI Provider editing states
  const [editingProvider, setEditingProvider] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [enabledInput, setEnabledInput] = useState(false);

  // Search filter for mock users
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated list of total users for Admin management
  const [managedUsers, setManagedUsers] = useState([
    { id: 'u101', name: 'أحمد ياسين', email: 'ahmad@example.com', planName: 'monthly', status: 'active', createdAt: '2026-05-12' },
    { id: 'u123', name: 'سارة خالد', email: 'sara@example.com', planName: 'yearly', status: 'active', createdAt: '2026-04-10' },
    { id: 'u304', name: 'عبد الله عمر', email: 'abdallah@example.com', planName: 'free', status: 'active', createdAt: '2026-06-20' },
    { id: 'u402', name: 'ريما فهد', email: 'reema@example.com', planName: 'monthly', status: 'expired', createdAt: '2026-02-15' },
    { id: 'u506', name: 'خالد مصطفى', email: 'khaled@example.com', planName: 'free', status: 'blocked', createdAt: '2026-01-30' },
  ]);

  useEffect(() => {
    fetchStats();
    fetchProviders();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/providers');
      const data = await response.json();
      setProviders(data);
    } catch (err) {
      console.error('Error fetching admin providers:', err);
    }
  };

  const startEditProvider = (p: any) => {
    setEditingProvider(p.provider);
    setApiKeyInput(p.apiKey);
    setModelInput(p.modelName);
    setEnabledInput(p.enabled);
  };

  const saveProvider = async (providerName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerName,
          enabled: enabledInput,
          apiKey: apiKeyInput,
          modelName: modelInput
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setProviders(data.providers);
        setEditingProvider('');
        onAddNotification('تم تحديث مصفوفة مزودي الذكاء الاصطناعي بنجاح!', 'success');
      }
    } catch (err) {
      console.error(err);
      onAddNotification('حدث عطل في حفظ التغييرات للمزود.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setManagedUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    onAddNotification(`تم تحديث حالة المستخدم بنجاح إلى: ${nextStatus === 'blocked' ? 'محظور' : 'نشط'}`, 'info');
  };

  const upgradeUserPlan = (userId: string) => {
    setManagedUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, planName: 'yearly', status: 'active' };
      }
      return u;
    }));
    onAddNotification('تمت ترقية ترخيص الطالب يدوياً إلى الخطة السنوية العظمى!', 'success');
  };

  if (!stats) {
    return (
      <div className="p-12 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
        <p className="text-sm">جاري تحميل مصفوفة الإدارة والبيانات...</p>
      </div>
    );
  }

  // Filter users based on query
  const filteredUsers = managedUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="md:mr-auto text-right">
          <h1 className="text-3xl font-bold text-white font-display">لوحة تحكم الإدارة والمراقبة</h1>
          <p className="text-gray-400 text-sm mt-1">تابع إحصائيات الاستخدام اليومية، راقب استهلاك الذكاء الاصطناعي، وتحكم بالمستخدمين والمزودين</p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex justify-end border-b border-gray-800 gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          إدارة مستخدمي المنصة
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'providers' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          مزودي الذكاء الاصطناعي (AI Routing)
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'metrics' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          أرقام المبيعات والاستهلاك
        </button>
      </div>

      {/* Tab 1: Sales and Metrics Dashboard */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          
          {/* Main Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Profits Card */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/20 transition-all flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">إجمالي الإيرادات والأرباح</span>
                <span className="text-2xl font-bold text-white font-mono">${stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Subscriptions Card */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/20 transition-all flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">الاشتراكات النشطة جلياً</span>
                <span className="text-2xl font-bold text-white font-mono">{stats.activeSubscriptions}</span>
              </div>
            </div>

            {/* Total Users base */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/20 transition-all flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">قاعدة الطلاب الإجمالية</span>
                <span className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</span>
              </div>
            </div>

            {/* Token Consumption volume */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/20 transition-all flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">توكنز الذكاء الاصطناعي</span>
                <span className="text-2xl font-bold text-white font-mono">{stats.aiTokensUsed.gemini.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Revenue Performance Graph via CSS (Elegant Custom Bars) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-6 flex items-center justify-end gap-2">
                <span>رسم بياني: الإيرادات الشهرية للعام الجاري</span>
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </h3>

              {/* Vertical Bars for Revenue */}
              <div className="flex justify-between items-end h-48 px-4 border-b border-gray-800">
                {stats.revenueHistory.map((item: any, idx: number) => {
                  const maxAmt = Math.max(...stats.revenueHistory.map((h: any) => h.amount));
                  const percentageHeight = maxAmt > 0 ? (item.amount / maxAmt) * 100 : 0;

                  return (
                    <div key={idx} className="flex flex-col items-center w-12 group relative">
                      {/* Hover stats label */}
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-[10px] text-white transition-opacity font-mono">
                        ${item.amount}
                      </span>
                      {/* Bar Fill */}
                      <div 
                        className="w-8 bg-gradient-to-t from-emerald-600 to-blue-500 rounded-t group-hover:opacity-80 transition-all duration-300"
                        style={{ height: `${percentageHeight}%`, minHeight: '5px' }}
                      />
                      <span className="text-[10px] text-gray-500 mt-2 font-semibold">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Tokens consumption by models */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center justify-end gap-2">
                  <span>توزيع استهلاك الذكاء الاصطناعي بالموديلات</span>
                  <Activity className="w-5 h-5 text-blue-400" />
                </h3>
                
                <p className="text-xs text-gray-400 leading-relaxed">
                  توزيع نسبة استهلاك المستخدمين لتوكنز الذكاء الاصطناعي عبر بوابات الـ Routing النشطة على النظام.
                </p>

                {/* Gemini consumption bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">%100.0</span>
                    <span className="text-gray-300">Google Gemini (Active)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>
                </div>

                {/* OpenAI consumption bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-500">%0.0</span>
                    <span className="text-gray-500">OpenAI GPT-4 (Disabled)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gray-700 h-full w-0" />
                  </div>
                </div>

                {/* Claude consumption bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-500">%0.0</span>
                    <span className="text-gray-500">Anthropic Claude (Disabled)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gray-700 h-full w-0" />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 mt-4 border-t border-gray-800/80 pt-4 text-center">
                يتم حساب الاستهلاك بشكل تقريبي بناءً على عدد الحروف المستلمة والمصاغة.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: AI Provider Settings */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/10 border border-emerald-500/15 p-5 rounded-xl flex gap-3 text-right">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-300">ميزة تحويل المسارات (Multi-AI Routing)</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                تتيح لك البنية التحتية لـ StudyMind إضافة أي مزود ذكاء اصطناعي جديد أو التبديل التلقائي بين الموديلات في حال انقطاع الخدمة أو تعديل الأسعار، دون الحاجة كلياً لتعديل شفرة التطبيق المصدري.
              </p>
            </div>
            <Settings className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((p) => {
              const isEditing = editingProvider === p.provider;
              return (
                <div key={p.provider} className={`bg-[#111827] border rounded-2xl p-6 space-y-4 flex flex-col justify-between ${
                  p.enabled ? 'border-emerald-500/30 shadow-lg shadow-emerald-950/10' : 'border-gray-800'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {p.enabled ? 'نشط ومفعل' : 'موقف'}
                      </span>
                      <h3 className="text-base font-bold text-white capitalize">{p.provider}</h3>
                    </div>

                    <div className="w-full h-px bg-gray-800" />

                    {isEditing ? (
                      <div className="space-y-3 text-right">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">اسم الموديل المستهدف</label>
                          <input
                            type="text"
                            value={modelInput}
                            onChange={(e) => setModelInput(e.target.value)}
                            className="w-full bg-[#1f2937] border border-gray-700 text-xs rounded p-2 text-white text-right"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">مفتاح الـ API للوصول</label>
                          <input
                            type="password"
                            placeholder="••••••••••••••••••••"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            className="w-full bg-[#1f2937] border border-gray-700 text-xs rounded p-2 text-white font-mono"
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <input
                            type="checkbox"
                            checked={enabledInput}
                            onChange={(e) => setEnabledInput(e.target.checked)}
                            className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                          />
                          <label className="text-xs text-gray-300 font-medium">تفعيل هذا الموديل برمجياً</label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs text-gray-400 text-right">
                        <div className="flex justify-between">
                          <span className="font-mono text-white text-xs">{p.modelName}</span>
                          <span>اسم الموديل:</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-gray-500">
                            {p.apiKey ? '••••••••••••' : 'لم يتم الإدخال'}
                          </span>
                          <span>مفتاح الوصول:</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => saveProvider(p.provider)}
                        disabled={loading}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ</span>
                      </button>
                      <button
                        onClick={() => setEditingProvider('')}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 rounded cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditProvider(p)}
                      className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-300 rounded font-semibold cursor-pointer"
                    >
                      تهيئة وتعديل الخواص
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Platform Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filters and search box */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#111827] p-4 rounded-xl border border-gray-800">
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg flex items-center gap-2 border border-gray-700 cursor-pointer">
                <Filter className="w-3.5 h-3.5" />
                <span>الكل</span>
              </button>
            </div>
            
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الطالب أو البريد..."
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg pl-4 pr-10 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
              />
              <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden text-right shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider bg-gray-900/50">
                    <th className="p-4 text-left">التحكم والعمليات</th>
                    <th className="p-4 text-center">التسجيل</th>
                    <th className="p-4 text-center">نوع الترخيص</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-right">الاسم والبريد</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800/40 text-gray-300 hover:bg-gray-900/10">
                      
                      {/* Actions */}
                      <td className="p-4 text-left">
                        <div className="flex gap-2">
                          <button
                            onClick={() => upgradeUserPlan(user.id)}
                            disabled={user.planName === 'yearly'}
                            className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] rounded border border-emerald-500/20 cursor-pointer disabled:opacity-30"
                          >
                            ترقية سنوية
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            className={`px-2 py-1 text-[10px] rounded border cursor-pointer ${
                              user.status === 'active' 
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {user.status === 'active' ? 'حظر الطالب' : 'إلغاء الحظر'}
                          </button>
                        </div>
                      </td>

                      {/* Date Joined */}
                      <td className="p-4 text-center text-xs text-gray-500 font-mono">
                        {user.createdAt}
                      </td>

                      {/* License */}
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          user.planName !== 'free' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {user.planName === 'free' ? 'حساب مجاني' : user.planName === 'monthly' ? 'برو (Pro)' : 'بريميوم (Premium)'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : user.status === 'blocked'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {user.status === 'active' ? 'نشط ومفعل' : user.status === 'blocked' ? 'محظور' : 'منتهي'}
                        </span>
                      </td>

                      {/* Name/Email */}
                      <td className="p-4 text-right">
                        <div>
                          <h4 className="text-xs font-bold text-white">{user.name}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">{user.email}</span>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
