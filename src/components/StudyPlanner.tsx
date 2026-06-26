/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckSquare, 
  Square, 
  Clock, 
  Trash2, 
  Compass,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { StudyPlan } from '../types';

interface StudyPlannerProps {
  plans: StudyPlan[];
  onPlanGenerated: (newPlan: StudyPlan) => void;
  onPlanDeleted: (planId: string) => void;
  onPlanToggled: (updatedPlan: StudyPlan) => void;
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function StudyPlanner({ 
  plans, 
  onPlanGenerated, 
  onPlanDeleted, 
  onPlanToggled,
  onAddNotification 
}: StudyPlannerProps) {
  
  const [subject, setSubject] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>('');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || loading) return;

    setLoading(true);
    onAddNotification('يرجى الانتظار، يقوم الذكاء الاصطناعي برسم الخطة والجدولة الذكية للدراسة...', 'info');

    try {
      const response = await fetch('/api/studyplan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, goals }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل توليد الخطة');
      }

      onPlanGenerated(data);
      setActivePlanId(data.id);
      setSubject('');
      setGoals('');
      onAddNotification('تم صياغة خطتك الدراسية بنجاح!', 'success');
    } catch (err) {
      console.error('Error generating plan:', err);
      onAddNotification('فشل الاتصال بخدمة الجدولة الذكية.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (planId: string, dayIdx: number, topicIdx: number) => {
    try {
      const response = await fetch(`/api/studyplan/${planId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayIndex: dayIdx, topicIndex: topicIdx }),
      });

      const data = await response.json();
      if (response.ok) {
        onPlanToggled(data.plan);
        onAddNotification('تم تحديث حالة إنجاز المهمة بنجاح!', 'success');
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeletePlan = (id: string) => {
    onPlanDeleted(id);
    if (activePlanId === id) setActivePlanId('');
    onAddNotification('تم إزالة الخطة الدراسية', 'info');
  };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Header Titles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {activePlanId && (
          <button
            onClick={() => setActivePlanId('')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg flex items-center gap-2 cursor-pointer border border-gray-700"
          >
            <span>عرض كل الخطط والبرامج</span>
          </button>
        )}
        <div className="md:mr-auto text-right">
          <h1 className="text-3xl font-bold text-white font-display">مولد الجداول والخطط التعليمية</h1>
          <p className="text-gray-400 text-sm mt-1">أنشئ برامج مراجعة مخصصة ومقسمة يومياً بناءً على أهدافك وأوقات فراغك</p>
        </div>
      </div>

      {!activePlanId ? (
        // 1. Initial creation forms and plans list
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creation Form Panel (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center justify-end gap-2">
                <span>تأسيس خطة دراسة جديدة</span>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </h2>

              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">أهداف وخلفية الدراسة</label>
                    <input
                      type="text"
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      placeholder="مثال: مراجعة كاملة للامتحان النهائي، أو إنجاز تطبيق ويب"
                      className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">المادة المنهجية أو الكورس</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: لغة البرمجة بايثون، أو هندسة التحليل"
                      className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !subject.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>هندسة وتوليد الخطة</span>
                      <Calendar className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick stats and instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111827] border border-gray-800 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-end gap-2">
                  <span>تقسيم يومي منطقي</span>
                  <Compass className="w-4 h-4 text-emerald-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">يقوم الذكاء الاصطناعي بدراسة حجم المنهج وتقسيمه على خطة منظمة ذاتياً لعدم شعور الطالب بالتراكم.</p>
              </div>
              <div className="p-4 bg-[#111827] border border-gray-800 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-end gap-2">
                  <span>تقدير زمن الدراسة</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">توقع زمن الجلوس وتقدير مدة المذاكرة لكل موضوع لدعم تكتيك الإنتاجية Pomodoro.</p>
              </div>
            </div>
          </div>

          {/* List of generated study tables (1/3 width) */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4">جداول دراستك الحالية</h2>

            {plans.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لم تقم بصياغة جداول دراسية بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {plans.map((p) => {
                  const totalTopics = p.planData.reduce((sum, d) => sum + d.topics.length, 0);
                  const completedTopics = p.planData.reduce((sum, d) => sum + d.topics.filter(t => t.completed).length, 0);
                  const score = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setActivePlanId(p.id)}
                      className="p-4 bg-gray-900/40 border border-gray-800/80 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer flex flex-col gap-2 text-right group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(p.id);
                        }}
                        className="absolute left-3 top-3 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 p-1 rounded transition-opacity"
                        title="إزالة البرنامج الدراسي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs font-bold text-emerald-400 font-mono">%{score} منجز</span>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px] pr-4">{p.title}</h4>
                      <span className="text-[10px] text-gray-500">{p.planData.length} أيام مبرمجة • مادة {p.subject}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        // 2. Active Study Plan Progression Dashboard
        <div className="space-y-6">
          
          {/* Core Plan Details & Summary */}
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              {/* Overall Completion Percentage bar */}
              {(() => {
                const totalTopics = activePlan.planData.reduce((sum, d) => sum + d.topics.length, 0);
                const completedTopics = activePlan.planData.reduce((sum, d) => sum + d.topics.filter(t => t.completed).length, 0);
                const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
                return (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 font-mono">التقدم العام: %{progress}</span>
                    <div className="w-40 bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="text-right">
              <h2 className="text-xl font-bold text-white font-display">{activePlan.title}</h2>
              <p className="text-xs text-gray-400 mt-1">المادة المستهدفة: {activePlan.subject} • الأهداف: {activePlan.goals}</p>
            </div>
          </div>

          {/* Daily breakdowns of study plans */}
          <div className="space-y-6">
            {activePlan.planData.map((day, dIdx) => (
              <div key={dIdx} className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden text-right shadow-lg">
                <div className="p-4 bg-gray-900/60 border-b border-gray-800 flex justify-between items-center">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <span>{day.topics.length} موضوع دراسة</span>
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-white">{day.day}</h3>
                </div>

                <div className="p-4 space-y-3">
                  {day.topics.map((topic, tIdx) => {
                    const isDone = topic.completed;
                    return (
                      <div
                        key={tIdx}
                        onClick={() => handleToggleTask(activePlan.id, dIdx, tIdx)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isDone 
                            ? 'bg-emerald-950/5 border-emerald-500/20 text-gray-400' 
                            : 'bg-gray-900/40 border-gray-800/60 hover:border-gray-700 text-gray-200'
                        }`}
                      >
                        {/* Task duration info */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-gray-800 rounded-full text-[10px] text-gray-400">{topic.duration}</span>
                        </div>

                        {/* Text and checkbox */}
                        <div className="flex items-start gap-3 flex-1 justify-end">
                          <div className="text-right pr-2">
                            <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>{topic.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{topic.description}</p>
                          </div>
                          
                          {/* Checked Box element */}
                          <div className="mt-1">
                            {isDone ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-md border border-gray-700 flex-shrink-0 hover:border-emerald-500 transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Complete encouragement message if all done */}
          {(() => {
            const total = activePlan.planData.reduce((sum, d) => sum + d.topics.length, 0);
            const done = activePlan.planData.reduce((sum, d) => sum + d.topics.filter(t => t.completed).length, 0);
            if (total > 0 && done === total) {
              return (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-xl flex items-center justify-between">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                  <div className="text-right">
                    <h3 className="text-base font-bold text-white">يا لك من بطل دراسي! 🎉</h3>
                    <p className="text-xs text-gray-400 mt-1">لقد أنجزت كافة الحصص والدروس في هذا البرنامج بنسبة 100%. واصل هذا الشغف الرائع!</p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

        </div>
      )}

    </div>
  );
}
