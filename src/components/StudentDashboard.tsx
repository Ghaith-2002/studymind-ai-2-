/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, FileCheck, HelpCircle, Trophy, Play, Plus, Clock, FileText, Compass, Download } from 'lucide-react';
import { User, FileData, Quiz, StudyPlan } from '../types';
import ProgressReportModal from './ProgressReportModal';

interface StudentDashboardProps {
  user: User;
  files: FileData[];
  quizzes: Quiz[];
  plans: StudyPlan[];
  onNavigate: (tab: string) => void;
}

export default function StudentDashboard({ user, files, quizzes, plans, onNavigate }: StudentDashboardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Compute some dashboard statistics
  const totalFiles = files.length;
  const completedQuizzesCount = quizzes.filter(q => q.completed).length;
  const averageQuizScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length) 
    : 0;
  
  const activePlansCount = plans.length;

  return (
    <div className="p-8 text-right font-sans max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-900/40 via-blue-950/20 to-transparent p-8 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white font-display">مرحباً بك مجدداً، {user.name} 👋</h1>
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
            محرك الذكاء الاصطناعي جاهز لتحليل كتبك ومقالاتك الدراسية، وصياغة خطط وجداول مخصصة لك في ثوانٍ معدودة. لنبدأ رحلة التعلم معاً!
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-indigo-950/40 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل تقرير الأداء (PDF)</span>
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>ابدأ المذاكرة الآن</span>
          </button>
          <button
            onClick={() => onNavigate('files')}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg text-sm border border-gray-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ارفع مستند تعليمي</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">الملفات المرفوعة</span>
            <span className="text-2xl font-bold text-white">{totalFiles}</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">الاختبارات المجتازة</span>
            <span className="text-2xl font-bold text-white">{completedQuizzesCount}</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">معدل الدرجات العام</span>
            <span className="text-2xl font-bold text-white">%{averageQuizScore}</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">الخطط والجدولة النشطة</span>
            <span className="text-2xl font-bold text-white">{activePlansCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Split Progress & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Circular Progress Chart (1/3 width) */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-between min-h-[380px]">
          <h2 className="text-lg font-bold text-white font-display self-start mb-4">التحصيل والجهوزية العامة</h2>
          
          {/* Circular SVG Progress */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Back track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                stroke="#1f2937"
                fill="transparent"
              />
              {/* Active Progress */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                stroke="url(#progressGradient)"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * averageQuizScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Value in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono">%{averageQuizScore}</span>
              <span className="text-xs text-gray-400 mt-1">متوسط النجاح</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed mt-4">
            النسبة تمثل متوسط الدرجات الحاصل عليها الطالب في الاختبارات التلقائية المنجزة والجهوزية لحل الاختبارات الحقيقية.
          </p>

          <button
            onClick={() => onNavigate('quizzes')}
            className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg font-medium transition-colors cursor-pointer"
          >
            افتح مولد ومراجع الاختبارات
          </button>
        </div>

        {/* Right Side: Quick History Feed & Action Hub (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Files Panel */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => onNavigate('files')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                عرض الكل
              </button>
              <h2 className="text-lg font-bold text-white font-display">المواد والمستندات المرفوعة حديثاً</h2>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد مواد دراسية مرفوعة حالياً.</p>
                <button
                  onClick={() => onNavigate('files')}
                  className="mt-2 text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  ارفع أول مستند الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {files.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                    <button
                      onClick={() => onNavigate('files')}
                      className="px-3 py-1 bg-gray-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-gray-400 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      مراجعة وتلخيص
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h4 className="text-sm font-semibold text-white truncate max-w-[200px]">{file.fileName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">{file.fileSize}</span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-1 rounded">تم التحليل</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Study Schedules Panel */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => onNavigate('planner')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                عرض جداولك
              </button>
              <h2 className="text-lg font-bold text-white font-display">الخطط والجداول الجارية</h2>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <Compass className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد خطط دراسية نشطة حالياً.</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="mt-2 text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  أنشئ أول جدول دراسة مخصص
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.slice(0, 2).map((plan) => {
                  const totalTopics = plan.planData.reduce((sum, d) => sum + d.topics.length, 0);
                  const completedTopics = plan.planData.reduce((sum, d) => sum + d.topics.filter(t => t.completed).length, 0);
                  const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                  return (
                    <div key={plan.id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-emerald-400 font-mono">%{completionPercentage} منجز</span>
                        <h4 className="text-sm font-semibold text-white">{plan.title}</h4>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{plan.planData.length} أيام دراسة مبرمجة</span>
                        </div>
                        <span>مادة: {plan.subject}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Progress Report PDF Export Modal */}
      <ProgressReportModal
        user={user}
        files={files}
        quizzes={quizzes}
        plans={plans}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
