/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  X, 
  Download, 
  Loader2, 
  Award, 
  Calendar, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Clock,
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { User, FileData, Quiz, StudyPlan } from '../types';

interface ProgressReportModalProps {
  user: User;
  files: FileData[];
  quizzes: Quiz[];
  plans: StudyPlan[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ProgressReportModal({ user, files, quizzes, plans, isOpen, onClose }: ProgressReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute stats
  const totalFiles = files.length;
  const completedQuizzes = quizzes.filter(q => q.completed);
  const completedQuizzesCount = completedQuizzes.length;
  const averageQuizScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length) 
    : 0;
  
  const activePlansCount = plans.length;
  
  // High score quizzes
  const excellentQuizzesCount = quizzes.filter(q => q.completed && q.score >= 85).length;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      // Wait slightly to guarantee the DOM is rendered
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution scale for clear text
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Page 1
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      
      // Add more pages if content is taller than A4
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      
      pdf.save(`تقرير_التقدم_الدراسي_${user.name}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLocalDateString = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date().toLocaleDateString('ar-SA', options);
  };

  const getSubscriptionPlanLabel = (plan: string) => {
    switch(plan) {
      case 'yearly': return 'باقة بريميوم (Premium)';
      case 'monthly': return 'باقة برو (Pro)';
      default: return 'الباقة المجانية';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl animate-scale-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 text-right">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">مستند معتمد</span>
            <h2 className="text-xl font-bold text-white font-display">تقرير الأداء والتحصيل الدراسي</h2>
          </div>
        </div>

        {/* Modal Body / Scrollable Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <p className="text-sm text-gray-400 text-center">
            هذه معاينة لتقرير تقدمك الدراسي. سيتم تصديره بنفس الشكل كملف PDF عالي الجودة متوافق مع الطباعة.
          </p>

          {/* Action Button */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري توليد ملف الـ PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل التقرير كملف PDF</span>
                </>
              )}
            </button>
          </div>

          {/* REPORT SHEET TO BE PRINTED - LIGHT BACKGROUND FOR PROFESSIONAL LOOK & PRINT-FRIENDLINESS */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
            <div 
              ref={reportRef} 
              className="p-10 text-right text-gray-800 font-sans leading-relaxed bg-white" 
              style={{ direction: 'rtl' }}
            >
              {/* Report Header Logo & Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-emerald-600 pb-6 mb-8 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    <span className="text-lg font-bold font-display">المساعد الدراسي الذكي AI</span>
                  </div>
                  <p className="text-xs text-gray-500">منصة المذاكرة التفاعلية المتكاملة بالذكاء الاصطناعي</p>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <h1 className="text-2xl font-black text-gray-900 font-display">تقرير الحالة والتقدم الأكاديمي</h1>
                  <p className="text-xs text-gray-500">تاريخ الإصدار: {getLocalDateString()}</p>
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">اسم الطالب:</span>
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">البريد الإلكتروني:</span>
                    <span className="text-gray-900 font-mono">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-2 md:border-r md:border-gray-200 md:pr-6">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">باقة الاشتراك:</span>
                    <span className="text-emerald-700 font-bold">{getSubscriptionPlanLabel(user.planName)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">تاريخ الانضمام:</span>
                    <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>

              {/* Statistical Summary Grid */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>ملخص إحصائيات النشاط والتحصيل الدراسي</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-extrabold text-emerald-700 block font-mono">{totalFiles}</span>
                    <span className="text-xs text-gray-600 mt-1 block">المواد المرفوعة</span>
                  </div>
                  <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-extrabold text-blue-700 block font-mono">{completedQuizzesCount}</span>
                    <span className="text-xs text-gray-600 mt-1 block">الاختبارات المنجزة</span>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-extrabold text-amber-700 block font-mono">%{averageQuizScore}</span>
                    <span className="text-xs text-gray-600 mt-1 block">متوسط الدرجات</span>
                  </div>
                  <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-extrabold text-indigo-700 block font-mono">{activePlansCount}</span>
                    <span className="text-xs text-gray-600 mt-1 block">الخطط والجداول</span>
                  </div>
                </div>
              </div>

              {/* Self-Assessment & Quizzes Section */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>نتائج وتقييمات الاختبارات الذاتية</span>
                </h3>

                {quizzes.length === 0 ? (
                  <p className="text-sm text-gray-500 py-3 bg-gray-50 text-center rounded-lg border border-dashed border-gray-200">
                    لم يتم إجراء أي اختبارات ذاتية حتى الآن.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-750">
                          <th className="p-3 text-right">مسمى الاختبار</th>
                          <th className="p-3 text-center">عدد الأسئلة</th>
                          <th className="p-3 text-center">الدرجة الحاصل عليها</th>
                          <th className="p-3 text-center">حالة التقييم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {quizzes.map((quiz) => (
                          <tr key={quiz.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-semibold text-gray-900">{quiz.title}</td>
                            <td className="p-3 text-center text-gray-600 font-mono">{quiz.questions.length}</td>
                            <td className="p-3 text-center font-bold text-gray-900 font-mono">
                              {quiz.completed ? `%${quiz.score}` : '--'}
                            </td>
                            <td className="p-3 text-center">
                              {quiz.completed ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  quiz.score >= 85 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : quiz.score >= 60 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {quiz.score >= 85 ? 'ممتاز جداً' : quiz.score >= 60 ? 'ناجح' : 'يحتاج مراجعة'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">قيد الحل</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Study Plans & Schedules Section */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>خطط وجداول المذاكرة المخصصة بالذكاء الاصطناعي</span>
                </h3>

                {plans.length === 0 ? (
                  <p className="text-sm text-gray-500 py-3 bg-gray-50 text-center rounded-lg border border-dashed border-gray-200">
                    لا توجد خطط دراسية نشطة حالياً في حسابك.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => {
                      const totalTopics = plan.planData.reduce((sum, d) => sum + d.topics.length, 0);
                      const completedTopics = plan.planData.reduce((sum, d) => sum + d.topics.filter(t => t.completed).length, 0);
                      const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                      return (
                        <div key={plan.id} className="border border-gray-200 p-4 rounded-xl hover:border-emerald-200 transition-all bg-gray-50/30">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{plan.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">المادة الدراسية: {plan.subject}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                نسبة الإنجاز: %{progressPercent}
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
                            <div 
                              className="bg-emerald-600 h-full transition-all duration-300" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>المدة المحددة: {plan.planData.length} أيام</span>
                            </span>
                            <span>المهام المنجزة: {completedTopics} من أصل {totalTopics} موضوع</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Uploaded Materials Section */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>مستندات ومراجع التعلم المرتبطة بملفك</span>
                </h3>

                {files.length === 0 ? (
                  <p className="text-sm text-gray-500 py-3 bg-gray-50 text-center rounded-lg border border-dashed border-gray-200">
                    لا توجد مستندات مرفوعة حالياً.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-750">
                          <th className="p-3 text-right">اسم الملف الدراسي</th>
                          <th className="p-3 text-center">نوع الملف</th>
                          <th className="p-3 text-center">تاريخ الرفع</th>
                          <th className="p-3 text-center">الحجم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {files.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-semibold text-gray-900 truncate max-w-[250px]">{file.fileName}</td>
                            <td className="p-3 text-center text-gray-600 font-mono text-xs">{file.fileType.toUpperCase()}</td>
                            <td className="p-3 text-center text-gray-600 text-xs">
                              {new Date(file.uploadDate).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="p-3 text-center text-gray-600 font-mono text-xs">{file.fileSize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer Stamp / Certification info */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
                <div className="text-center sm:text-right">
                  <p>تم استخراج هذا التقرير الأكاديمي بواسطة الطالب {user.name}.</p>
                  <p className="mt-1">جميع الحقوق محفوظة للمساعد الأكاديمي الذكي © {new Date().getFullYear()}</p>
                </div>
                <div className="px-4 py-2 border-2 border-emerald-600/30 text-emerald-700 rounded-xl bg-emerald-50/20 font-bold tracking-wider text-center flex items-center gap-1.5 select-none">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>معتمد كلياً بنظام المتابعة الذكي</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800 bg-[#0c1017]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>تحميل PDF</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
