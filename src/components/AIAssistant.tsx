/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  BrainCircuit, 
  Code, 
  Binary, 
  Sparkles, 
  Languages, 
  Terminal,
  Clock,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';

interface AIAssistantProps {
  onAddNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AIAssistant({ onAddNotification }: AIAssistantProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string>('');
  const [tutorLanguage, setTutorLanguage] = useState<'ar' | 'en'>('ar');
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial chat sessions from server
  useEffect(() => {
    fetchSessions();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      const data = await response.json();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const startNewSession = async (titleText?: string) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleText || 'محادثة تعليمية جديدة' }),
      });
      const data = await response.json();
      setSessions(prev => [data, ...prev]);
      setActiveSessionId(data.id);
      onAddNotification('تم فتح جلسة تعليمية جديدة', 'info');
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      // Auto create session if none active
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: textToSend.substring(0, 30) }),
        });
        const data = await response.json();
        setSessions(prev => [data, ...prev]);
        targetSessionId = data.id;
        setActiveSessionId(data.id);
      } catch (err) {
        console.error('Error creating auto-session:', err);
        return;
      }
    }

    // Optimistic UI update: user message
    const tempUserMsg: ChatMessage = {
      id: 'temp_user_' + Date.now(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return { ...s, messages: [...s.messages, tempUserMsg] };
      }
      return s;
    }));

    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: targetSessionId, content: textToSend, provider: selectedProvider }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل توليد الرد من الذكاء الاصطناعي');
      }

      // Update session with correct messages and potentially updated title
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          // Replace temp message with server messages
          return {
            ...s,
            title: data.sessionTitle,
            messages: [...s.messages.filter(m => m.id !== tempUserMsg.id), data.userMessage, data.aiMessage],
          };
        }
        return s;
      }));
    } catch (err: any) {
      console.error('Error sending message:', err);
      onAddNotification('فشل الاتصال بمزود الذكاء الاصطناعي', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onAddNotification('تم نسخ النص الحواري بنجاح', 'success');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handlePresetTrigger = (promptType: 'simplify' | 'math' | 'code' | 'exam') => {
    const isAr = tutorLanguage === 'ar';
    let prompt = '';
    
    if (promptType === 'simplify') {
      prompt = isAr 
        ? 'الرجاء تبسيط وشرح هذا المفهوم لي بأبسط لغة ممكنة مع أمثلة من حياتنا اليومية: [اكتب مفهومك هنا]' 
        : 'Please simplify and explain this concept to me using the simplest possible language, with real-world examples: [write your concept here]';
    } else if (promptType === 'math') {
      prompt = isAr 
        ? 'لدي هذه المسألة الرياضية أو العلمية، أحتاج إلى حلها خطوة بخطوة مع شرح القانون المستخدم في الحل بالتفصيل: [اكتب المسألة هنا]' 
        : 'I have this mathematical/scientific problem. I need you to solve it step-by-step with a detailed explanation of the formulas used: [write your problem here]';
    } else if (promptType === 'code') {
      prompt = isAr 
        ? 'أريد شرح الكود البرمجي التالي، توضيح وظيفة الأسطر والمساعدة في تتبع الأخطاء أو تحسينه: [الصق الكود هنا]' 
        : 'I want an explanation of the following source code, detailing how it works and recommending optimizations or bug fixes: [paste your code here]';
    } else if (promptType === 'exam') {
      prompt = isAr 
        ? 'الرجاء مراجعة هذا الموضوع معي، وتوقع 3 أسئلة مهمة قد تأتي في الامتحان وصياغة إجاباتها النموذجية: [اكتب موضوعك هنا]' 
        : 'Please review this topic with me, anticipate 3 high-probability exam questions, and generate their ideal answers: [write your topic here]';
    }

    setInputText(prompt);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-[calc(100vh-1px)] font-sans bg-[#0b0f19] text-gray-200">
      
      {/* 1. Chat Area (Main Area - Full width remaining) */}
      <div className="flex-1 flex flex-col justify-between h-full relative">
        
        {/* Tutor Top Banner */}
        <div className="p-4 border-b border-gray-800 bg-[#111827]/60 flex items-center justify-between text-right">
          
          {/* Quick Language Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newLang = tutorLanguage === 'ar' ? 'en' : 'ar';
                setTutorLanguage(newLang);
                onAddNotification(`تم تحويل لغة المساعد إلى ${newLang === 'ar' ? 'العربية' : 'الإنجليزية'}`, 'info');
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded-lg flex items-center gap-2 border border-gray-700 cursor-pointer transition-colors"
            >
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{tutorLanguage === 'ar' ? 'العربية' : 'English'}</span>
            </button>

            {/* AI Provider brain selection */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/60 rounded-lg px-2 py-1">
              <span className="text-[10px] text-gray-400 hidden md:inline">الذكاء:</span>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  const prov = e.target.value;
                  setSelectedProvider(prov);
                  onAddNotification(`تم تفعيل العقل الذكي: ${prov === 'gemini' ? 'Google Gemini' : prov === 'openai' ? 'OpenAI GPT-4' : 'Anthropic Claude'}`, 'info');
                }}
                className="bg-transparent border-none text-xs text-gray-200 outline-none cursor-pointer font-medium"
              >
                <option value="gemini" className="bg-gray-900 text-gray-100">Google Gemini</option>
                <option value="openai" className="bg-gray-900 text-gray-100">OpenAI GPT-4o</option>
                <option value="claude" className="bg-gray-900 text-gray-100">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>

          {/* Active Tutor Title */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h2 className="text-sm font-semibold text-white">معلم المذاكرة الذكي</h2>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>عبر {selectedProvider === 'gemini' ? 'Gemini 2.5' : selectedProvider === 'openai' ? 'GPT-4o' : 'Claude 3.5'}</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-emerald-500/30">
              <BrainCircuit className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6">
              <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">مرحباً بك في مساعد المذاكرة الذكي!</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                اسألني أي سؤال دراسي، أو اطلب شرح الدروس الصعبة، أو الصق الأكواد البرمجية والمسائل الرياضية لحلها فوراً.
              </p>

              {/* Learning presets */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <button
                  onClick={() => handlePresetTrigger('simplify')}
                  className="p-4 bg-[#111827] border border-gray-800 hover:border-emerald-500/40 rounded-xl text-right transition-all cursor-pointer hover:bg-gray-900/60 group"
                >
                  <Terminal className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-semibold text-white">تبسيط المفاهيم</h4>
                  <p className="text-xs text-gray-500 mt-1">شرح المصطلحات الصعبة بأمثلة من واقعنا.</p>
                </button>

                <button
                  onClick={() => handlePresetTrigger('math')}
                  className="p-4 bg-[#111827] border border-gray-800 hover:border-blue-500/40 rounded-xl text-right transition-all cursor-pointer hover:bg-gray-900/60 group"
                >
                  <Binary className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-semibold text-white">حل المسائل العلمية</h4>
                  <p className="text-xs text-gray-500 mt-1">حلول خطوة بخطوة للرياضيات والفيزياء.</p>
                </button>

                <button
                  onClick={() => handlePresetTrigger('code')}
                  className="p-4 bg-[#111827] border border-gray-800 hover:border-indigo-500/40 rounded-xl text-right transition-all cursor-pointer hover:bg-gray-900/60 group"
                >
                  <Code className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-semibold text-white">مرشد البرمجة</h4>
                  <p className="text-xs text-gray-500 mt-1">تتبع أخطاء الأكواد وفهم منطق البرمجة.</p>
                </button>

                <button
                  onClick={() => handlePresetTrigger('exam')}
                  className="p-4 bg-[#111827] border border-gray-800 hover:border-amber-500/40 rounded-xl text-right transition-all cursor-pointer hover:bg-gray-900/60 group"
                >
                  <MessageSquare className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-semibold text-white">توقع أسئلة الامتحانات</h4>
                  <p className="text-xs text-gray-500 mt-1">اقتراح وتوقع أسئلة هامة للدروس.</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {activeSession.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 p-4 rounded-xl border ${
                      isUser 
                        ? 'bg-[#1f2937]/55 border-gray-800 text-gray-200' 
                        : 'bg-emerald-950/5 border-emerald-500/10 text-gray-100'
                    }`}
                  >
                    {/* Message Avatar */}
                    <div className="flex-shrink-0">
                      {isUser ? (
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-sm">
                          U
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 space-y-1 text-right">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                          title="نسخ محتوى الرسالة"
                        >
                          {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <span className="text-xs font-semibold text-gray-400">
                          {isUser ? 'أنت' : 'StudyMind Assistant'}
                        </span>
                      </div>
                      
                      {/* Markdown representation - clean breaks */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-emerald-500/30">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-4 p-4 rounded-xl bg-emerald-950/5 border border-emerald-500/10 text-gray-100 max-w-4xl mr-auto">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <BrainCircuit className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex-1 space-y-2 text-right">
                    <span className="text-xs font-semibold text-gray-400">يجري التفكير والصياغة...</span>
                    <div className="flex gap-1 justify-end pt-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Floating action presets inside typing pane if we have text */}
        {inputText.length > 0 && inputText.length < 150 && (
          <div className="px-6 py-2 bg-[#0b0f19] border-t border-gray-800/40 flex justify-end gap-2 max-w-4xl mx-auto w-full">
            <span className="text-xs text-gray-500 mr-auto flex items-center gap-1">
              {inputText.length} حرفاً
            </span>
            <button
              onClick={() => handlePresetTrigger('simplify')}
              className="px-2 py-1 bg-gray-900 border border-gray-800 text-[10px] text-gray-400 hover:text-emerald-400 rounded cursor-pointer"
            >
              تبسيط المفهوم
            </button>
            <button
              onClick={() => handlePresetTrigger('math')}
              className="px-2 py-1 bg-gray-900 border border-gray-800 text-[10px] text-gray-400 hover:text-blue-400 rounded cursor-pointer"
            >
              حل المسألة
            </button>
          </div>
        )}

        {/* Input Text Box */}
        <div className="p-4 border-t border-gray-800 bg-[#111827]/40">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اطلب تبسيط أي درس، حل مسألة فيزياء، أو كود برمجي..."
              className="flex-1 bg-[#1f2937] border border-gray-700 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-right"
            />
          </form>
        </div>
      </div>

      {/* 2. Left Session Sidebar (1/4 width - Desktop only) */}
      <div className="w-80 border-r border-gray-800 bg-[#111827]/30 flex flex-col justify-between p-4 h-full select-none">
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => startNewSession()}
              className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-emerald-500/20"
              title="محادثة جديدة"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-semibold">درس جديد</span>
            </button>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">سجل المذاكرات</h3>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">لا يوجد حوارات سابقة</p>
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`w-full p-3 rounded-lg flex items-center justify-between text-right cursor-pointer group transition-all border ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                        : 'border-transparent text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                    }`}
                  >
                    {/* Delete Session Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        // Delete session locally
                        setSessions(prev => prev.filter(item => item.id !== s.id));
                        if (activeSessionId === s.id) {
                          setActiveSessionId('');
                        }
                        onAddNotification('تم إزالة جلسة المذاكرة السابقة', 'info');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <span className="text-xs truncate">{s.title}</span>
                      <MessageSquare className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
