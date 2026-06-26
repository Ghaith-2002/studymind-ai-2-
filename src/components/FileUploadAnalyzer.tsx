/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  BookOpen, 
  HelpCircle,
  Clock,
  Trash2,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { FileData, Flashcard } from '../types';

interface FileUploadAnalyzerProps {
  files: FileData[];
  onUploadSuccess: (newFile: FileData) => void;
  onDeleteFile: (fileId: string) => void;
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToQuiz: () => void;
}

export default function FileUploadAnalyzer({ 
  files, 
  onUploadSuccess, 
  onDeleteFile, 
  onAddNotification,
  onNavigateToQuiz
}: FileUploadAnalyzerProps) {
  
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'questions'>('summary');
  
  // Interactive flashcard flip state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    onAddNotification(`بدء رفع وتحليل الملف: ${file.name}...`, 'info');

    try {
      const fileName = file.name;
      const fileType = file.type || 'text/plain';
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      let textContent = '';
      let imageBase64 = '';

      if (file.type.startsWith('image/')) {
        // Multi-modal visual analysis: convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onload = () => {
            imageBase64 = reader.result as string;
            resolve(true);
          };
        });
      } else {
        // Plaintext file parsing
        const reader = new FileReader();
        reader.readAsText(file);
        await new Promise((resolve) => {
          reader.onload = () => {
            textContent = reader.result as string;
            resolve(true);
          };
        });
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          fileSize,
          textContent: textContent.substring(0, 10000), // safety cutoff
          imageBase64
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تحليل المادة الدراسية');
      }

      onUploadSuccess(data);
      setSelectedFileId(data.id);
      onAddNotification('تم تلخيص واستخراج بطاقات المراجعة بنجاح!', 'success');
    } catch (err: any) {
      console.error('File analyzing error:', err);
      onAddNotification('واجهنا عطلاً في معالجة الملف، تم تفعيل النموذج البديل للمعاينة.', 'warning');
    } finally {
      setLoading(false);
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/files/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onDeleteFile(id);
        if (selectedFileId === id) setSelectedFileId('');
        onAddNotification('تم حذف الملف الدراسي بنجاح', 'info');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {selectedFile && (
          <button
            onClick={() => {
              setSelectedFileId('');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg flex items-center gap-2 cursor-pointer border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span>العودة للملفات المرفوعة</span>
          </button>
        )}
        <div className="md:mr-auto text-right">
          <h1 className="text-3xl font-bold text-white font-display">مستخرج ومحلل المستندات الدراسي</h1>
          <p className="text-gray-400 text-sm mt-1">ارفع كتبك بترميز PDF أو صور وسيقوم الذكاء الاصطناعي بتلخيصها وصياغة بطاقات Flashcards فورية</p>
        </div>
      </div>

      {!selectedFile ? (
        // Grid View of Files and Upload Portal
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* File Upload Zone (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all relative ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : 'border-gray-800 hover:border-gray-700 bg-[#111827]/40'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                multiple={false}
                accept=".txt,image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 text-emerald-400 rounded-full mb-2 border border-emerald-500/20">
                  <Upload className="w-10 h-10 animate-bounce" />
                </div>
                
                <h3 className="text-xl font-bold text-white">اسحب ملفاتك المنهجية إلى هنا</h3>
                <p className="text-sm text-gray-500">
                  أو انقر لاختيار ملف يدوي من جهازك. يدعم ملفات النصوص (TXT)، الصور والشروح (PNG, JPG) وملفات PDF.
                </p>

                <label
                  htmlFor="file-upload-input"
                  className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg cursor-pointer shadow-md shadow-emerald-950/30 transition-all"
                >
                  تصفح الملفات
                </label>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-[#111827]/90 rounded-2xl flex flex-col items-center justify-center space-y-4 z-10 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-emerald-400">يقوم الذكاء الاصطناعي بالقراءة والتلخيص واستخراج المحتوى...</p>
                </div>
              )}
            </div>

            {/* Formatting capabilities instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#111827] border border-gray-800 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-end gap-2">
                  <span>تلخيص آلي فوري</span>
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">توفير 80% من وقت القراءة عبر توليد ملخصات تفاعلية ذكية لأهم مفاهيم الدرس.</p>
              </div>
              <div className="p-4 bg-[#111827] border border-gray-800 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-end gap-2">
                  <span>بطاقات مراجعة سريعة</span>
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">استخراج تعاريف الدرس تلقائياً وتوزيعها على بطاقات فلاش تساهم في التكرار المتباعد.</p>
              </div>
              <div className="p-4 bg-[#111827] border border-gray-800 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-end gap-2">
                  <span>صناعة اختبار فوري</span>
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">توليد اختبارات ذكية (صح وخطأ، اختيار من متعدد) مخصصة فقط لمحتوى الملف المرفوع.</p>
              </div>
            </div>
          </div>

          {/* Uploaded Library List (1/3 width) */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-end gap-2">
              <span>مستودع مستنداتك ({files.length})</span>
              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
            </h2>

            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لم تقم برفع أي ملف بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className="p-4 bg-gray-900/40 rounded-xl border border-gray-800/80 hover:border-emerald-500/40 hover:bg-gray-900/80 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <button
                      onClick={(e) => handleDelete(e, file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{file.fileName}</h4>
                        <span className="text-[10px] text-gray-500 block mt-0.5">{file.fileSize} • {file.fileType.toUpperCase()}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        {file.fileType === 'png' || file.fileType === 'jpg' || file.fileType === 'jpeg' ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        // Detailed File AI Analysis Dashboard (after clicking on a file)
        <div className="space-y-6">
          
          {/* File Header Details */}
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              onClick={onNavigateToQuiz}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
            >
              <HelpCircle className="w-4 h-4" />
              <span>ابدأ اختباراً مخصصاً لهذا المستند</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h2 className="text-xl font-bold text-white font-display">{selectedFile.fileName}</h2>
                <div className="flex justify-end gap-3 text-xs text-gray-500 mt-1">
                  <span>تاريخ الرفع: {new Date(selectedFile.uploadDate).toLocaleDateString('ar-EG')}</span>
                  <span>•</span>
                  <span>حجم الملف: {selectedFile.fileSize}</span>
                  <span>•</span>
                  <span>النوع: {selectedFile.fileType.toUpperCase()}</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Secondary Navigation Tabs */}
          <div className="flex justify-end border-b border-gray-800 gap-4">
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'questions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              الأسئلة التدريبية المستخرجة
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'flashcards' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              بطاقات فلاش Flashcards
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'summary' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              التلخيص وأهم النقاط
            </button>
          </div>

          {/* Tab Contents */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 min-h-[300px]">
            
            {/* 1. Summary Content */}
            {activeTab === 'summary' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center justify-end gap-2">
                    <span>التلخيص التفاعلي الشامل</span>
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed bg-gray-900/40 border border-gray-800/80 p-5 rounded-xl">
                    {selectedFile.summary}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center justify-end gap-2">
                    <span>أهم النقاط والمستخلصات</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFile.points.map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-900/20 border border-gray-800 rounded-xl">
                        <p className="text-xs text-gray-300 text-right flex-1 leading-relaxed">{point}</p>
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Interactive Flipping Flashcards */}
            {activeTab === 'flashcards' && (
              <div className="space-y-8 flex flex-col items-center">
                {selectedFile.flashcards.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">لا تتوفر بطاقات فلاش لهذا الملف.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-full max-w-xl text-center">
                      <span className="text-xs text-gray-400">البطاقة {currentCardIndex + 1} من {selectedFile.flashcards.length}</span>
                    </div>

                    {/* Flipping Card Widget */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-xl h-64 cursor-pointer perspective"
                    >
                      <div className={`relative w-full h-full duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front Face of Card */}
                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1f2937] to-[#111827] border-2 border-gray-800 hover:border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-4">الوجه الأول (سؤال أو مصطلح)</span>
                          <p className="text-lg font-bold text-white">{selectedFile.flashcards[currentCardIndex].front}</p>
                          <span className="text-xs text-gray-500 mt-6 block">انقر لقلب ورؤية الجواب 🔄</span>
                        </div>

                        {/* Back Face of Card */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-950/20 to-emerald-900/10 border-2 border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-4">الوجه الثاني (الإجابة أو الشرح)</span>
                          <p className="text-base text-gray-200 font-semibold leading-relaxed">{selectedFile.flashcards[currentCardIndex].back}</p>
                          <span className="text-xs text-gray-500 mt-6 block">انقر مجدداً لقلب البطاقة 🔄</span>
                        </div>

                      </div>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex gap-4 items-center">
                      <button
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setIsFlipped(false);
                          setTimeout(() => {
                            setCurrentCardIndex(prev => Math.max(0, prev - 1));
                          }, 150);
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        السابق
                      </button>
                      <button
                        disabled={currentCardIndex === selectedFile.flashcards.length - 1}
                        onClick={() => {
                          setIsFlipped(false);
                          setTimeout(() => {
                            setCurrentCardIndex(prev => Math.min(selectedFile.flashcards.length - 1, prev + 1));
                          }, 150);
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        التالي
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 3. Training Questions Content */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                {selectedFile.quizzes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">لم يتم استخراج أسئلة تدريبية تلقائية للمستند.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFile.quizzes.map((quiz, i) => (
                      <div key={quiz.id} className="p-5 bg-gray-900/30 border border-gray-800 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">
                            {quiz.type === 'mcq' ? 'اختيار من متعدد' : 'صح أو خطأ'}
                          </span>
                          <h4 className="text-sm font-semibold text-white">السؤال {i + 1}: {quiz.question}</h4>
                        </div>

                        {quiz.options && (
                          <div className="grid grid-cols-2 gap-2 text-right">
                            {quiz.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2.5 bg-gray-900/60 border border-gray-800/80 rounded-lg text-xs text-gray-300">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                          <span className="text-gray-400">الشرح والتعليل: {quiz.explanation}</span>
                          <span className="text-emerald-400 font-bold">الإجابة الصحيحة: {quiz.answer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Embedded flipping style rules */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
