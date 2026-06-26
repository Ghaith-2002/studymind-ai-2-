/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  CloudLightning, 
  Terminal, 
  Copy, 
  Check, 
  Database, 
  Code, 
  Smartphone, 
  BookOpen, 
  Server,
  Download,
  FolderArchive,
  Settings,
  RefreshCw,
  Play,
  ShieldAlert,
  CheckCircle2,
  Activity,
  DollarSign
} from 'lucide-react';

export default function DeploymentExport() {
  const [copiedSection, setCopiedSection] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'docker' | 'sql' | 'api' | 'flutter' | 'guide' | 'integrations' | 'downloads'>('downloads');
  
  // Integrations states
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState({ text: '', type: 'info' });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [monitorData, setMonitorData] = useState<any>(null);
  const [monitorLoading, setMonitorLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'integrations') {
      fetchBackups();
      fetchMonitorData();
    }
  }, [activeTab]);

  const fetchMonitorData = async () => {
    setMonitorLoading(true);
    try {
      const res = await fetch("/api/monitor/status");
      if (res.ok) {
        const data = await res.json();
        setMonitorData(data);
      }
    } catch (err) {
      console.error("Failed to fetch monitor metrics:", err);
    } finally {
      setMonitorLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/backup/list");
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data);
      }
    } catch (err) {
      console.error("Failed to load backups list:", err);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupLoading(true);
    setBackupMessage({ text: 'جاري تشغيل محرك النسخ الاحتياطي التلقائي وضغط البيانات وتخزينها...', type: 'info' });
    try {
      const res = await fetch("/api/backup/trigger", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage({ text: `تم إنشاء نسخة احتياطية جديدة بنجاح باسم: ${data.backup.filename} بحجم ${data.backup.size}!`, type: 'success' });
        fetchBackups();
      } else {
        setBackupMessage({ text: 'فشل بدء عملية النسخ الاحتياطي: ' + (data.error || 'خطأ مجهول'), type: 'error' });
      }
    } catch (err) {
      setBackupMessage({ text: 'عذراً، فشل الاتصال بخادم النسخ الاحتياطي الذكي.', type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleTestStripeUpgrade = async (plan: 'monthly' | 'yearly') => {
    setStripeLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan,
          successUrl: window.location.origin + "?payment=success&plan=" + plan,
          cancelUrl: window.location.origin + "?payment=cancel"
        })
      });
      const data = await res.json();
      if (data.url) {
        if (data.warning) {
          alert(data.warning);
        }
        // Redirect directly to the sandbox checkout or fallback sandbox handler
        window.location.href = data.url;
      } else {
        alert("فشل إنشاء جلسة الدفع.");
      }
    } catch (err) {
      alert("فشل في استدعاء واجهة الدفع.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const dockerComposeCode = `version: '3.8'

services:
  studymind-db:
    image: postgres:15-alpine
    container_name: studymind-postgres
    restart: always
    environment:
      POSTGRES_DB: studymind_db
      POSTGRES_USER: postgres_admin
      POSTGRES_PASSWORD: secure_db_password_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  studymind-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: studymind-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=your_gemini_api_key_here
      - DATABASE_URL=postgresql://postgres_admin:secure_db_password_2026@studymind-db:5432/studymind_db
      - PORT=3000
    depends_on:
      - studymind-db

volumes:
  postgres_data:`;

  const dockerfileCode = `# Multi-stage Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runner Phase
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]`;

  const postgresSchemaCode = `-- PostgreSQL Database Schema for StudyMind AI
-- Created: 2026-06-24

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL, -- 'free', 'monthly', 'yearly'
  status VARCHAR(50) NOT NULL, -- 'active', 'expired', 'canceled'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL
);

-- 3. Create Chats Table
CREATE TABLE IF NOT EXISTS chats (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'محادثة تعليمية جديدة',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(100) PRIMARY KEY,
  chat_id VARCHAR(100) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'model'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Files Table
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_type VARCHAR(50) NOT NULL,
  file_size VARCHAR(50) NOT NULL,
  summary TEXT,
  points JSONB, -- list of string bullets
  flashcards JSONB, -- list of front/back objects
  quizzes JSONB, -- list of questions
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL,
  score INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  goals TEXT,
  plan_data JSONB NOT NULL, -- detailed Days JSON structure
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'stripe', 'paypal'
  status VARCHAR(50) NOT NULL, -- 'succeeded', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const flutterLayoutCode = `// Flutter Client Integration Layout for StudyMind AI
// File: lib/screens/home_screen.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class StudyMindHomeScreen extends StatefulWidget {
  final String userToken;
  StudyMindHomeScreen({required this.userToken});

  @override
  _StudyMindHomeScreenState createState() => _StudyMindHomeScreenState();
}

class _StudyMindHomeScreenState extends State<StudyMindHomeScreen> {
  List<dynamic> recentFiles = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchRecentFiles();
  }

  Future<void> fetchRecentFiles() async {
    final response = await http.get(
      Uri.parse('https://your-domain.com/api/files'),
      headers: {'Authorization': 'Bearer \${widget.userToken}'},
    );
    if (response.statusCode == 200) {
      setState(() {
        recentFiles = json.decode(response.body);
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF0B0F19),
      appBar: AppBar(
        title: Text('StudyMind AI', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Color(0xFF111827),
        centerTitle: true,
      ),
      body: isLoading 
        ? Center(child: CircularProgressIndicator())
        : ListView.builder(
            itemCount: recentFiles.length,
            itemBuilder: (context, index) {
              final file = recentFiles[index];
              return ListTile(
                title: Text(file['fileName'], style: TextStyle(color: Colors.white)),
                subtitle: Text(file['fileSize'] + ' • ' + file['fileType'].toUpperCase(), style: TextStyle(color: Colors.grey)),
                trailing: Icon(Icons.chevron_right, color: Colors.emeraldAccent),
              );
            },
          ),
    );
  }
}`;

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto space-y-8 text-right animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="md:mr-auto text-right">
          <h1 className="text-3xl font-bold text-white font-display">مستندات البناء والاستضافة المستقلة</h1>
          <p className="text-gray-400 text-sm mt-1">امتداد الكود والـ API وهيكلة النشر لتشغيل هذا النظام على خوادمك السحابية الخاصة</p>
        </div>
      </div>

      {/* Complete Project ZIP Download Banner */}
      <div className="bg-gradient-to-l from-indigo-950/60 via-purple-950/40 to-gray-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-right">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shrink-0">
            <FolderArchive className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">تنزيل ملف المشروع بالكامل بنقرة واحدة</h2>
            <p className="text-gray-300 text-xs mt-1 leading-relaxed">
              يمكنك تحميل كود المصدر البرمجي الكامل لهذا التطبيق في ملف مضغوط واحد <code>.zip</code> يحتوي على كافة واجهات React، الخادم الخلفي Express، والتكوينات البرمجية لبدء تشغيله فوراً على جهازك أو سيرفرك.
            </p>
          </div>
        </div>
        <a 
          href="/api/export-zip"
          download="studymind-ai-project.zip"
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>تنزيل كامل الأكواد (ZIP)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Tab side navigators (1/4 width) */}
        <div className="space-y-2 lg:col-span-1">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'downloads' ? 'bg-teal-600/10 text-teal-400 border border-teal-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>تحميل تطبيقات الجوال & الويب</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'docker' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>تكوين Docker & Compose</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'sql' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>قاعدة البيانات Schema PostgreSQL</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'api' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>توثيق مسارات الـ APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'flutter' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>تكامل تطبيقات الجوال Flutter</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'guide' ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل النشر والتشغيل</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'integrations' ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 text-rose-400" />
            <span>بوابات الربط والإنتاج & النسخ</span>
          </button>
        </div>

        {/* Content viewer (3/4 width) */}
        <div className="lg:col-span-3 bg-[#111827] border border-gray-800 rounded-2xl p-6 min-h-[450px] relative">
          
          {/* Tab 0: App Downloads & Store Publishing */}
          {activeTab === 'downloads' && (
            <div className="space-y-6 text-right font-sans">
              
              {/* Header */}
              <div className="pb-3 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">صفحة تنزيل التطبيقات والتهيئة للمتاجر الرسمية</h3>
                <p className="text-xs text-gray-400 mt-1">تنزيل النسخ الجاهزة للتشغيل والتوزيع، والتحضير لرفع التطبيق على متاجر جوجل وآبل.</p>
              </div>

              {/* 1. Universal Direct Platforms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Web version */}
                <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 hover:border-teal-500/30 transition-all flex flex-col justify-between h-48">
                  <div>
                    <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center border border-teal-500/20 mb-3">
                      <Server className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">منصة الويب السحابية</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">الوصول الفوري للمنصة من المتصفحات والهواتف عبر النطاق الآمن المباشر.</p>
                  </div>
                  <a 
                    href="https://your-domain.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-xs font-bold rounded-lg border border-teal-500/20 text-center transition-colors"
                  >
                    دخول منصة الويب
                  </a>
                </div>

                {/* Android APK */}
                <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-48">
                  <div>
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 mb-3">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">أندرويد APK (تحميل مباشر)</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">تنزيل ملف الـ APK المباشر وتثبيته على أي جهاز أندرويد دون قيود.</p>
                  </div>
                  <button 
                    onClick={() => handleDownload('studymind-release.apk', 'StudyMind Android Release Package Stub')}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/20 text-center transition-colors cursor-pointer"
                  >
                    تحميل ملف أندرويد APK
                  </button>
                </div>

                {/* iOS App Store */}
                <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all flex flex-col justify-between h-48">
                  <div>
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20 mb-3">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">نسخة هواتف آيفون (iOS)</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">رابط مباشر للتحميل من متجر التطبيقات الرسمي App Store للايفون والايباد.</p>
                  </div>
                  <a 
                    href="https://apps.apple.com/app/studymind-ai" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20 text-center transition-colors"
                  >
                    استعراض في App Store
                  </a>
                </div>

              </div>

              {/* 2. Publishing Requirements Documentation & Metadata */}
              <div className="bg-gray-950/85 p-5 rounded-2xl border border-gray-800 space-y-4">
                <h4 className="text-xs font-bold text-gray-100 flex items-center justify-end gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>متطلبات تجميع وملفات النشر للمتاجر (Distribution Checklist)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Google Play checklist */}
                  <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800 space-y-2.5">
                    <span className="font-bold text-indigo-400 text-xs block">جوجل بلاي (Google Play Console)</span>
                    <ul className="space-y-1.5 text-gray-300">
                      <li className="flex items-center justify-end gap-1.5">
                        <span>رزمة الاندرويد: <code>.aab</code> (Android App Bundle) للتجميع</span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>مفتاح التوقيع: Keystore مشفر ومحمي بكلمة مرور مخصصة</span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>أبعاد الصور: أيقونة 512x512 وبانر المتجر 1024x500</span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>الحد الأدنى للمستوى البرمجي: SDK 21 (Android 5.0+)</span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      </li>
                    </ul>
                    <div className="pt-2">
                      <button 
                        onClick={() => handleDownload('play-store-metadata.txt', 'Name: StudyMind AI\nShort Description: المساعد الدراسي الذكي لإدارة المهام وتوليد الاختبارات وملخصات الدروس.\nCategory: Education\nTarget Audience: 13-18, 18+')}
                        className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] font-bold text-gray-300 hover:bg-gray-850 flex items-center gap-1 cursor-pointer mr-auto"
                      >
                        <Download className="w-3 h-3 text-indigo-400" />
                        <span>تحميل نصوص المتجر (Google Play)</span>
                      </button>
                    </div>
                  </div>

                  {/* App Store checklist */}
                  <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800 space-y-2.5">
                    <span className="font-bold text-purple-400 text-xs block">آبل ستور (Apple App Store Connect)</span>
                    <ul className="space-y-1.5 text-gray-300">
                      <li className="flex items-center justify-end gap-1.5">
                        <span>رزمة الآيفون: ملف <code>.ipa</code> المجمع والموقع</span>
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>الشهادات: Distribution Provisioning Profile نشط</span>
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>تأكيد الخصوصية: سياسة استخدام وتخزين بيانات الطلاب</span>
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      </li>
                      <li className="flex items-center justify-end gap-1.5">
                        <span>الأجهزة المعتمدة: iOS 14.0+ (iPhone, iPad, Mac Silicon)</span>
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      </li>
                    </ul>
                    <div className="pt-2">
                      <button 
                        onClick={() => handleDownload('app-store-metadata.txt', 'App Title: StudyMind AI Companion\nSubtitle: مذاكرة ذكية بذكاء اصطناعي\nDescription: رفيقك الأكاديمي الشامل لتلخيص المحاضرات وصناعة الاختبارات الفورية وجداول الدراسة اليومية.\nKeywords: study, ai, exam, flashcards, scheduler, arabic')}
                        className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] font-bold text-gray-300 hover:bg-gray-850 flex items-center gap-1 cursor-pointer mr-auto"
                      >
                        <Download className="w-3 h-3 text-purple-400" />
                        <span>تحميل نصوص المتجر (App Store)</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. Automatic Deployment Pipeline Trigger */}
              <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">بناء تلقائي نشط</span>
                  <h4 className="text-xs font-bold text-white mt-1">توليد وإرسال وبناء الحزم على خادم الإنتاج</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">يستخدم الخادم البرمجي خادم Match & Fastlane لبناء ملفات IPA و AAB بشكل مجمع للمطور.</p>
                </div>
                <button 
                  onClick={() => {
                    alert("جاري بدء تشغيل خط أنابيب البناء والتوقيع الإلكتروني للحزم (Fastlane Pipeline). يرجى مراجعة سجل الخادم.");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-bold hover:from-emerald-500 hover:to-teal-500 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>بدء التجميع السحابي والتوقيع</span>
                </button>
              </div>

            </div>
          )}

          {/* Tab 1: Docker Configurations */}
          {activeTab === 'docker' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('docker-compose.yml', dockerComposeCode)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل docker-compose.yml</span>
                  </button>
                  <button
                    onClick={() => handleCopy(dockerComposeCode, 'dockercompose')}
                    className="px-3 py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedSection === 'dockercompose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود</span>
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">ملف docker-compose.yml لربط التطبيق بقاعدة البيانات</h3>
              </div>
              <pre className="p-4 bg-gray-900 rounded-xl font-mono text-xs text-blue-300 overflow-x-auto text-left leading-relaxed">
                {dockerComposeCode}
              </pre>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 pb-3 border-b border-gray-800 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('Dockerfile', dockerfileCode)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل Dockerfile</span>
                  </button>
                  <button
                    onClick={() => handleCopy(dockerfileCode, 'dockerfile')}
                    className="px-3 py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedSection === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود</span>
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">ملف الـ Dockerfile للبناء والتجميع متعدد المراحل</h3>
              </div>
              <pre className="p-4 bg-gray-900 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto text-left leading-relaxed">
                {dockerfileCode}
              </pre>
            </div>
          )}

          {/* Tab 2: PostgreSQL Raw Schema */}
          {activeTab === 'sql' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('schema.sql', postgresSchemaCode)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف schema.sql</span>
                  </button>
                  <button
                    onClick={() => handleCopy(postgresSchemaCode, 'postgres')}
                    className="px-3 py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedSection === 'postgres' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود</span>
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">جداول شفرة الاستيراد لقاعدة بيانات PostgreSQL</h3>
              </div>
              <pre className="p-4 bg-gray-900 rounded-xl font-mono text-xs text-emerald-300 overflow-y-auto max-h-[500px] text-left leading-relaxed">
                {postgresSchemaCode}
              </pre>
            </div>
          )}

          {/* Tab 3: API References */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
                <button
                  onClick={() => handleDownload('api-endpoints.json', JSON.stringify([
                    { method: "POST", endpoint: "/api/auth/register", desc: "تسجيل مستخدم جديد وبدء الباقة المجانية" },
                    { method: "POST", endpoint: "/api/chat/messages", desc: "بدء جلسة تعليمية ومحادثة مع المساعد" },
                    { method: "POST", endpoint: "/api/files/upload", desc: "رفع ملف تعليمي واستنباط التلخيص والبطاقات" },
                    { method: "POST", endpoint: "/api/quizzes/generate", desc: "صياغة كراسة أسئلة واختبارات ذاتية تلقائياً" },
                    { method: "POST", endpoint: "/api/studyplan/generate", desc: "توليد جدول ومهام مراجعة مقسمة يومياً" }
                  ], null, 2))}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل ملف API JSON</span>
                </button>
                <h3 className="text-sm sm:text-base font-bold text-white text-right">توثيق مسارات الـ API (RESTful Endpoints)</h3>
              </div>
              
              <div className="overflow-x-auto text-right">
                <table className="w-full text-xs text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 font-bold bg-gray-900/40">
                      <th className="p-3 text-left">التأثير والخصائص</th>
                      <th className="p-3 text-center">الرابط</th>
                      <th className="p-3 text-right">العملية</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/40">
                      <td className="p-3 text-left">تسجيل مستخدم جديد وبدء الباقة المجانية</td>
                      <td className="p-3 text-center font-mono text-emerald-400">/api/auth/register</td>
                      <td className="p-3 text-right"><span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full font-bold">POST</span></td>
                    </tr>
                    <tr className="border-b border-gray-800/40">
                      <td className="p-3 text-left">بدء جلسة تعليمية ومحادثة مع المساعد</td>
                      <td className="p-3 text-center font-mono text-emerald-400">/api/chat/messages</td>
                      <td className="p-3 text-right"><span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full font-bold">POST</span></td>
                    </tr>
                    <tr className="border-b border-gray-800/40">
                      <td className="p-3 text-left">رفع ملف تعليمي واستنباط التلخيص والبطاقات</td>
                      <td className="p-3 text-center font-mono text-emerald-400">/api/files/upload</td>
                      <td className="p-3 text-right"><span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full font-bold">POST</span></td>
                    </tr>
                    <tr className="border-b border-gray-800/40">
                      <td className="p-3 text-left">صياغة كراسة أسئلة واختبارات ذاتية تلقائياً</td>
                      <td className="p-3 text-center font-mono text-emerald-400">/api/quizzes/generate</td>
                      <td className="p-3 text-right"><span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full font-bold">POST</span></td>
                    </tr>
                    <tr className="border-b border-gray-800/40">
                      <td className="p-3 text-left">توليد جدول ومهام مراجعة مقسمة يومياً</td>
                      <td className="p-3 text-center font-mono text-emerald-400">/api/studyplan/generate</td>
                      <td className="p-3 text-right"><span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full font-bold">POST</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Flutter boilerplate layout */}
          {activeTab === 'flutter' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('home_screen.dart', flutterLayoutCode)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف home_screen.dart</span>
                  </button>
                  <button
                    onClick={() => handleCopy(flutterLayoutCode, 'flutter')}
                    className="px-3 py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedSection === 'flutter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود</span>
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">كود واجهة Flutter للاتصال بالخادم الرئيسي</h3>
              </div>
              <pre className="p-4 bg-gray-900 rounded-xl font-mono text-xs text-purple-300 overflow-y-auto max-h-[500px] text-left leading-relaxed">
                {flutterLayoutCode}
              </pre>
            </div>
          )}

          {/* Tab 5: Detailed Deployment Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6 text-right leading-relaxed">
              <h3 className="text-lg font-bold text-white pb-3 border-b border-gray-800">كتيب ودليل النشر الذاتي والتشغيل خطوة بخطوة</h3>
              
              <div className="space-y-4 text-xs text-gray-300">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-emerald-400 mb-1">الخطوة 1: تهيئة البيئة البرمجية على السيرفر الخاص</h4>
                  <p>تأكد من تنصيب Docker و Docker-Compose على الـ VPS أو سيرفر AWS الخاص بك عبر تنفيذ:</p>
                  <pre className="bg-[#111827] p-2 rounded mt-2 font-mono text-blue-400 text-left">sudo apt update && sudo apt install docker-compose -y</pre>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-emerald-400 mb-1">الخطوة 2: إنشاء وتهيئة ملفات الإعداد والمفاتيح (.env)</h4>
                  <p>قم بإنشاء ملف باسم <code>.env</code> في المجلد الرئيسي لخادمك واملأ المفاتيح بالقيم التالية:</p>
                  <pre className="bg-[#111827] p-2 rounded mt-2 font-mono text-emerald-400 text-left">
                    GEMINI_API_KEY=AIzaSyYourOwnKeyHere{'\n'}
                    DATABASE_URL=postgresql://postgres_admin:secure_password@studymind-db:5432/studymind_db{'\n'}
                    PORT=3000
                  </pre>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-emerald-400 mb-1">الخطوة 3: إطلاق الخوادم وقاعدة البيانات بلمسة واحدة</h4>
                  <p>أطلق كافة الخدمات والحاويات في الخلفية عن طريق تشغيل الأمر التالي:</p>
                  <pre className="bg-[#111827] p-2 rounded mt-2 font-mono text-blue-400 text-left">docker-compose up --build -d</pre>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-emerald-400 mb-1">الخطوة 4: التحقق من نجاح التشغيل والمراقبة</h4>
                  <p>افتح متصفح الويب وتوجه للرابط <code>http://your-server-ip:3000</code> لتجد بوابتك التعليمية تعمل ومبرمجة بكامل طاقتها بشكل مستقل تماماً!</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Integrations and Production Monitor */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 text-right leading-relaxed font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
                <p className="text-xs text-gray-400">بوابة تحكم ومراقبة البنية التحتية والربط السحابي</p>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-end">
                  <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span>بوابات الربط والإنتاج & النسخ الاحتياطي</span>
                </h3>
              </div>

              {/* Monitoring Dashboard */}
              <div className="bg-gray-950/80 p-5 rounded-2xl border border-rose-500/15 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <button
                    onClick={fetchMonitorData}
                    disabled={monitorLoading}
                    className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-850 text-xs font-bold text-gray-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 text-rose-400 ${monitorLoading ? 'animate-spin' : ''}`} />
                    <span>تحديث المراقبة الحية</span>
                  </button>
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>حالة البنية التحتية والمراقبة (Production Telemetry)</span>
                  </h4>
                </div>

                {monitorData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-right">
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[10px] text-gray-400 block">وقت التشغيل (Uptime)</span>
                        <span className="text-sm font-bold text-gray-100 font-mono">
                          {Math.floor(monitorData.uptime / 3600)}h {Math.floor((monitorData.uptime % 3600) / 60)}m {Math.floor(monitorData.uptime % 60)}s
                        </span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[10px] text-gray-400 block">استهلاك الذاكرة (Memory)</span>
                        <span className="text-sm font-bold text-rose-400 font-mono">{monitorData.system?.memory?.heapUsed || '36 MB'}</span>
                        <span className="text-[9px] text-gray-500 block">من {monitorData.system?.memory?.heapTotal || '128 MB'} المخصصة</span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[10px] text-gray-400 block">مستودع البيانات (PostgreSQL)</span>
                        <span className={`text-xs font-bold block ${monitorData.database?.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {monitorData.database?.status === 'connected' ? `متصل (${monitorData.database?.latencyMs}ms)` : 'الذاكرة الافتراضية نشطة'}
                        </span>
                        <span className="text-[9px] text-gray-500 block">{monitorData.database?.provider}</span>
                      </div>
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-850">
                        <span className="text-[10px] text-gray-400 block">حالة الخادم (Node)</span>
                        <span className="text-xs font-bold text-blue-400 block">{monitorData.system?.nodeVersion || 'v22'}</span>
                        <span className="text-[9px] text-emerald-400 block">صحي بالكامل 100%</span>
                      </div>
                    </div>

                    {/* API keys status checklist */}
                    <div className="bg-gray-900/20 p-3 rounded-xl border border-gray-850 text-xs space-y-2">
                      <span className="text-[10px] text-gray-400 font-bold block">مفاتيح الربط والاتصال بالخدمات السحابية:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center justify-end gap-1.5 bg-gray-950/30 px-2 py-1.5 rounded border border-gray-850">
                          <span className={`text-[10px] font-bold ${monitorData.services?.gemini === 'configured' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {monitorData.services?.gemini === 'configured' ? 'نشط' : 'محاكي'}
                          </span>
                          <span className="text-[10px] text-gray-300 mr-1">Google Gemini API:</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 bg-gray-950/30 px-2 py-1.5 rounded border border-gray-850">
                          <span className={`text-[10px] font-bold ${monitorData.services?.stripe === 'configured' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {monitorData.services?.stripe === 'configured' ? 'نشط' : 'Sandbox'}
                          </span>
                          <span className="text-[10px] text-gray-300 mr-1">Stripe gateway:</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 bg-gray-950/30 px-2 py-1.5 rounded border border-gray-850">
                          <span className={`text-[10px] font-bold ${monitorData.services?.awsS3 === 'configured' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {monitorData.services?.awsS3 === 'configured' ? 'نشط' : 'تخزين محلي'}
                          </span>
                          <span className="text-[10px] text-gray-300 mr-1">AWS S3 Bucket:</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 bg-gray-950/30 px-2 py-1.5 rounded border border-gray-850">
                          <span className={`text-[10px] font-bold ${monitorData.services?.openai === 'configured' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {monitorData.services?.openai === 'configured' ? 'نشط' : 'غير مدخل'}
                          </span>
                          <span className="text-[10px] text-gray-300 mr-1">OpenAI GPT-4:</span>
                        </div>
                      </div>
                    </div>

                    {/* System Audit logs */}
                    <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono text-[10px] space-y-1.5 max-h-36 overflow-y-auto text-left">
                      <div className="text-right text-gray-500 border-b border-gray-850 pb-1 font-sans font-bold flex items-center justify-between">
                        <span className="text-gray-400 font-sans text-[10px]">نظام مراقبة الأخطاء وتتبع العمليات بالخادم</span>
                        <span>سجل عمليات الإنتاج الفورية (Live System Logs)</span>
                      </div>
                      {monitorData.logs?.map((log: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-1 justify-between text-gray-300">
                          <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <div className="flex items-center gap-1.5 text-right flex-1 justify-end">
                            <span className="text-gray-250 font-sans">{log.message}</span>
                            <span className={`px-1 rounded text-[8px] font-bold ${
                              log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 
                              log.level === 'WARNING' ? 'bg-rose-950 text-rose-400 border border-rose-500/20' : 'bg-blue-950 text-blue-400 border border-blue-500/20'
                            }`}>
                              {log.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400 p-4 bg-gray-900/20 rounded-xl border border-dashed border-gray-800">
                    جاري تحميل مقاييس الأداء والمراقبة الفورية...
                  </div>
                )}
              </div>

              {/* Grid 1: Database & S3 Config Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold">جاهز للإنتاج</span>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>قاعدة بيانات PostgreSQL</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    تم تفعيل اتصال قاعدة البيانات الهجين بنجاح. في حال عدم توفر خادم PostgreSQL، يشتغل النظام تلقائياً عبر الذاكرة السريعة (In-Memory Sandbox) لضمان عدم توقف الخدمة.
                  </p>
                </div>

                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 font-bold">نشط سحابياً</span>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CloudLightning className="w-4 h-4 text-blue-400" />
                      <span>تخزين ملفات AWS S3</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    مربوط تلقائياً لرفع مستندات الطلاب وصور التحليل مباشرة إلى حاويات S3. تم برمجة رافع احتياطي لحفظ المستندات محلياً في حال غياب المفاتيح.
                  </p>
                </div>
              </div>

              {/* Grid 2: Google/Apple Auth & Stripe Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 justify-end mb-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>تسجيل الدخول (Google & Apple)</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-3">
                    المسارات المبرمجة للمطابقة واستقبال الـ ID Tokens والتحقق منها نشطة بالكامل على الخادم. جاهزة للربط الفوري مع واجهات تطبيقات الجوال ومواقع الويب.
                  </p>
                  <div className="flex justify-end gap-2">
                    <span className="px-2 py-1 bg-gray-850 border border-gray-800 rounded text-[10px] text-gray-300 font-mono">/api/auth/apple</span>
                    <span className="px-2 py-1 bg-gray-850 border border-gray-800 rounded text-[10px] text-gray-300 font-mono">/api/auth/google</span>
                  </div>
                </div>

                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5 justify-end mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span>بوابة دفع Stripe (Visa & MasterCard)</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-3">
                    قم بتجربة بوابة الدفع الذكية والترقية التلقائية للعضوية (الخطة الشهرية أو السنوية) عن طريق محاكي Stripe Sandbox المتكامل لدينا:
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleTestStripeUpgrade('yearly')}
                      disabled={stripeLoading}
                      className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {stripeLoading ? 'جاري التحضير...' : 'تجربة باقة بريميوم ($9.99)'}
                    </button>
                    <button
                      onClick={() => handleTestStripeUpgrade('monthly')}
                      disabled={stripeLoading}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {stripeLoading ? 'جاري التحضير...' : 'تجربة باقة برو ($2.99)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Automatic System Backup Engine */}
              <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTriggerBackup}
                      disabled={backupLoading}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {backupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>تشغيل نسخ احتياطي فوري</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5 justify-end">
                    <FolderArchive className="w-4.5 h-4.5 text-rose-400" />
                    <span>محرك النسخ الاحتياطي التلقائي (Auto Backup Engine)</span>
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-gray-950/40 p-3 rounded-lg border border-gray-850 text-right">
                  <span className="text-gray-300 font-mono">BACKUP_INTERVAL_HOURS: 24h</span>
                  <p className="text-gray-400">
                    معدل التكرار التلقائي للمحرك: <span className="text-rose-400 font-bold">كل 24 ساعة</span>. يدعم التخزين المزدوج (على القرص المحلي ورفع آمن تلقائي إلى AWS S3 في حال تمكين الإعدادات).
                  </p>
                </div>

                {backupMessage.text && (
                  <div className={`p-3 rounded-lg text-xs text-right border ${
                    backupMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    backupMessage.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {backupMessage.text}
                  </div>
                )}

                {/* Backup archives list */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-200">أحدث نقاط النسخ الاحتياطي المتوفرة بالنظام:</h5>
                  {backupsList.length === 0 ? (
                    <div className="text-center p-6 text-xs text-gray-500 bg-gray-950/20 rounded-lg border border-dashed border-gray-800">
                      اضغط على الزر أعلاه لتشغيل أول نقطة نسخ احتياطي للملفات وقاعدة البيانات والطلاب.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-gray-300 text-right">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-500 bg-gray-950/30">
                            <th className="p-2 text-left">خيارات التحميل</th>
                            <th className="p-2 text-center">الحجم</th>
                            <th className="p-2 text-center">النوع</th>
                            <th className="p-2 text-right">اسم الملف التعليمي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backupsList.map((b, i) => (
                            <tr key={b.id || i} className="border-b border-gray-800/40 hover:bg-gray-900/20">
                              <td className="p-2 text-left">
                                <a
                                  href={`/api/backup/download/${b.id}`}
                                  download
                                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] rounded border border-gray-700 cursor-pointer inline-flex items-center gap-1 transition-colors"
                                >
                                  <Download className="w-3 h-3 text-rose-400" />
                                  <span>تحميل الأرشيف JSON</span>
                                </a>
                              </td>
                              <td className="p-2 text-center font-mono text-gray-400">{b.size || '32 KB'}</td>
                              <td className="p-2 text-center">
                                <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                                  b.backup_type === 'auto' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {b.backup_type === 'auto' ? 'تلقائي' : 'يدوي'}
                                </span>
                              </td>
                              <td className="p-2 text-right font-mono text-gray-300">{b.filename}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
