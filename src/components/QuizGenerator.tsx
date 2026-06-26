/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  HelpCircle, 
  RefreshCw, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';

interface QuizGeneratorProps {
  quizzes: Quiz[];
  onQuizGenerated: (newQuiz: Quiz) => void;
  onQuizSubmitted: (updatedQuiz: Quiz) => void;
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function QuizGenerator({ 
  quizzes, 
  onQuizGenerated, 
  onQuizSubmitted,
  onAddNotification 
}: QuizGeneratorProps) {
  
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string>('');
  
  // Staged Question Index for Active Test
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    onAddNotification('يقوم الذكاء الاصطناعي بصياغة أسئلة اختبار تنافسية مخصصة...', 'info');

    try {
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل توليد الأسئلة');
      }

      onQuizGenerated(data);
      setActiveQuizId(data.id);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTopic('');
      onAddNotification('تم توليد كراسة الاختبار بنجاح!', 'success');
    } catch (err: any) {
      console.error('Quiz generate error:', err);
      onAddNotification('حدث خطأ أثناء الاتصال بمولد الأسئلة.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async () => {
    if (!activeQuizId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: activeQuizId, answers: selectedAnswers }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تصحيح الاختبار');
      }

      onQuizSubmitted(data);
      onAddNotification(`اكتمل تصحيح اختبارك! النتيجة المكتسبة: %${data.score}`, 'success');
    } catch (err) {
      console.error('Submit quiz error:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeQuiz = quizzes.find(q => q.id === activeQuizId);

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {activeQuizId && (
          <button
            onClick={() => {
              setActiveQuizId('');
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg flex items-center gap-2 cursor-pointer border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span>العودة للاختبارات السابقة</span>
          </button>
        )}
        <div className="md:mr-auto text-right">
          <h1 className="text-3xl font-bold text-white font-display">منصة توليد وتقييم الاختبارات</h1>
          <p className="text-gray-400 text-sm mt-1">اكتب أي موضوع علمي وسيقوم محرك الذكاء الاصطناعي بصياغة وتصحيح اختبارك ذاتياً</p>
        </div>
      </div>

      {!activeQuizId ? (
        // 1. Initial Choice / Topic Page & Previous Results list
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Quiz Panel (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center justify-end gap-2">
                <span>توليد اختبار ذكي جديد</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h2>

              <form onSubmit={handleGenerateQuiz} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">موضوع الاختبار أو النص المنهجي</label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="اكتب عنوان الدرس أو المادة (مثال: المصفوفات في لغة C++، أو الصق شرح قاعدة كان وأخواتها)..."
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>صياغة الاختبار</span>
                      <Award className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick tips */}
            <div className="bg-emerald-950/10 border border-emerald-500/15 p-4 rounded-xl flex gap-3 text-right">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-emerald-300">نصيحة المذاكرة الذكية</h4>
                <p className="text-xs text-gray-400 mt-1">توليد الاختبارات بعد قراءة الدروس يزيد من كفاءة الاسترجاع وقوة تذكر الدماغ بأكثر من 150%.</p>
              </div>
              <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            </div>
          </div>

          {/* Previous Completed Tests (1/3 width) */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4">أرشيف نتائجك السابقة</h2>

            {quizzes.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا تتوفر نتائج اختبارات منجزة.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuizId(q.id)}
                    className="p-4 bg-gray-900/40 border border-gray-800/80 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer flex justify-between items-center text-right"
                  >
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      q.score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : q.score >= 50 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      %{q.score}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h4 className="text-xs font-bold text-white truncate max-w-[140px]">{q.title}</h4>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{q.questions.length} أسئلة • {new Date(q.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="p-2 bg-emerald-500/5 text-emerald-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        // 2. Active Testing Room
        <div className="max-w-3xl mx-auto">
          {!activeQuiz.completed ? (
            // Staged Question Slides
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-6">
              
              {/* Question progress and tracker */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-emerald-400 font-mono">
                  السؤال {currentQuestionIndex + 1} من {activeQuiz.questions.length}
                </span>
                <span className="text-sm text-gray-400">{activeQuiz.title}</span>
              </div>

              {/* Progress Bar indicator */}
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Active Slide question */}
              {activeQuiz.questions.map((q, idx) => {
                if (idx !== currentQuestionIndex) return null;

                return (
                  <div key={q.id} className="space-y-6">
                    <h3 className="text-lg font-bold text-white leading-relaxed">{q.question}</h3>
                    
                    {/* Render inputs according to question types */}
                    {q.type === 'mcq' && q.options && (
                      <div className="grid grid-cols-1 gap-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className={`w-full p-4 rounded-xl border text-right text-sm transition-all cursor-pointer font-medium ${
                                isSelected 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/20' 
                                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'tf' && (
                      <div className="grid grid-cols-2 gap-4">
                        {['صح', 'خطأ'].map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className={`w-full py-4 rounded-xl border text-center text-sm transition-all cursor-pointer font-bold ${
                                isSelected 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/20' 
                                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'essay' && (
                      <div>
                        <textarea
                          rows={6}
                          value={selectedAnswers[q.id] || ''}
                          onChange={(e) => setSelectedAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="اكتب إجابتك المقالية المفصلة هنا ليقوم المعلم بتصحيحها..."
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Navigation and Submission actions */}
              <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                
                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={!selectedAnswers[activeQuiz.questions[currentQuestionIndex].id]}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    السؤال التالي
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAnswers}
                    disabled={loading || !selectedAnswers[activeQuiz.questions[currentQuestionIndex].id]}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-lg text-sm transition-all cursor-pointer shadow-lg shadow-emerald-950/20"
                  >
                    {loading ? 'يجري التصحيح والتقييم...' : 'تقديم ورقة الإجابة'}
                  </button>
                )}

                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:text-gray-700 border border-gray-800 rounded-lg text-sm text-gray-400 transition-colors cursor-pointer"
                >
                  السؤال السابق
                </button>
              </div>

            </div>
          ) : (
            // Results Report Card Page
            <div className="space-y-6">
              
              {/* Score visual Gauge */}
              <div className="bg-[#111827] border border-gray-800 p-8 rounded-2xl text-center space-y-4">
                <Award className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <h2 className="text-2xl font-bold text-white">تقرير النتيجة والاكتساب المنهجي</h2>
                <div className="text-5xl font-extrabold text-white my-4 font-mono">%{activeQuiz.score}</div>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {activeQuiz.score >= 80 
                    ? 'أداء مذهل وممتاز جداً! لديك فهم عميق وتام للنقاط الجوهرية ومستعد كلياً للامتحانات الرسمية.' 
                    : activeQuiz.score >= 50 
                    ? 'أداء جيد ومقبول، ننصحك بمراجعة بطاقات الـ Flashcards وإعادة مراجعة النقاط الصعبة لتثبيت الأسس.' 
                    : 'تحصيل متدني. لا تقلق، التعلم عملية مستمرة، قم بتلخيص المستند مرة أخرى واسأل المساعد الذكي في المواضع المبهمة.'}
                </p>
                
                <button
                  onClick={() => {
                    setActiveQuizId('');
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-md transition-colors"
                >
                  العودة لقسم الاختبارات
                </button>
              </div>

              {/* Step by Step reviews */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">مراجعة الأسئلة وتصحيح المدرس</h3>
                {activeQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="p-6 bg-[#111827] border border-gray-800 rounded-xl space-y-3 text-right">
                    <div className="flex justify-between items-start">
                      {q.isCorrect ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <span>إجابة صحيحة</span>
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <span>إجابة غير دقيقة</span>
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white">س{idx + 1}: {q.question}</h4>
                    </div>

                    <div className="p-3 bg-gray-900/60 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-medium">{q.userAnswer || 'لم يتم الإجابة'}</span>
                        <span className="text-gray-500">إجابتك:</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-800/80">
                        <span className="text-emerald-400 font-bold">{q.answer}</span>
                        <span className="text-gray-500">الإجابة المثالية:</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed pt-1">
                      <span className="font-bold text-gray-300">توجيه المصحح: </span>
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
