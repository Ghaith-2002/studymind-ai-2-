/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GraduationCap, 
  MessageSquare, 
  FileText, 
  Award, 
  Calendar, 
  CreditCard, 
  ShieldAlert, 
  CloudLightning, 
  LogOut, 
  Sparkles,
  User,
  Bell
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
  notificationCount: number;
  onShowNotifications: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  notificationCount,
  onShowNotifications 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: GraduationCap },
    { id: 'assistant', name: 'المساعد الذكي', icon: MessageSquare },
    { id: 'files', name: 'تحليل الملفات', icon: FileText },
    { id: 'quizzes', name: 'مولد الاختبارات', icon: Award },
    { id: 'planner', name: 'الخطة والجداول', icon: Calendar },
    { id: 'billing', name: 'الاشتراكات والمدفوعات', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-l border-gray-800 flex flex-col justify-between h-screen sticky top-0 font-sans select-none z-30">
      {/* Upper Brand / Logo */}
      <div>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-lg shadow-md shadow-emerald-950/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-display">StudyMind AI</h2>
              <span className="text-xs text-gray-400">بوابة التعليم الذكي</span>
            </div>
          </div>
          
          {/* Notifications Trigger */}
          <button 
            onClick={onShowNotifications}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-[#111827]" />
            )}
          </button>
        </div>

        {/* User Info Quick Card */}
        <div className="p-4 mx-4 my-4 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              {user.name ? user.name.charAt(0) : 'S'}
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-white truncate max-w-[100px]">{user.name}</h3>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  user.planName !== 'free' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {user.planName === 'free' ? 'حساب مجاني' : user.planName === 'monthly' ? 'باقة برو (Pro)' : 'باقة بريميوم (Premium)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-right group ${
                  isActive
                    ? 'bg-emerald-600/10 text-emerald-400 border-r-4 border-emerald-500'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lower Actions (Admin Console, Deployment Packages, Logout) */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        {/* Toggle to Admin Panel */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30'
              : 'text-gray-400 hover:bg-rose-500/10 hover:text-rose-300'
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>لوحة تحكم الإدارة</span>
        </button>

        {/* Toggle to Deployment Export */}
        <button
          onClick={() => setActiveTab('deploy')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'deploy'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-blue-500/10 hover:text-blue-300'
          }`}
        >
          <CloudLightning className="w-5 h-5 text-blue-400 animate-pulse" />
          <span>ملفات النشر والـ API</span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-rose-400 hover:bg-rose-950/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
