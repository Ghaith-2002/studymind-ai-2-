/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, ShieldCheck, X } from 'lucide-react';
import { User, FileData, Quiz, StudyPlan, Payment } from './types';

// Importing components
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import AIAssistant from './components/AIAssistant';
import FileUploadAnalyzer from './components/FileUploadAnalyzer';
import QuizGenerator from './components/QuizGenerator';
import StudyPlanner from './components/StudyPlanner';
import SubscriptionManager from './components/SubscriptionManager';
import AdminDashboard from './components/AdminDashboard';
import DeploymentExport from './components/DeploymentExport';
import NotificationSystem, { NotificationItem } from './components/NotificationSystem';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Shared database arrays
  const [files, setFiles] = useState<FileData[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Notifications central states
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', title: 'تنبيه دراسة يومي', message: 'حان موعد مراجعة درس البرمجة كائنية التوجه OOP بحسب جدولك الدراسي المقترح.', type: 'info', time: 'منذ ساعة واحدة' },
    { id: 'n2', title: 'تم فتح العضوية', message: 'مرحباً بك في StudyMind AI! لقد تم تفعيل باقتك التعليمية المجانية بنجاح.', type: 'success', time: 'منذ يومين' }
  ]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Load user profile on mount if exists
  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchQuizzes();
      fetchPlans();
      fetchPayments();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/studyplan');
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab('dashboard');
    addNotification(`أهلاً بك مجدداً، تم تسجيل دخولك بنجاح كـ ${authenticatedUser.name}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setFiles([]);
    setQuizzes([]);
    setPlans([]);
    setPayments([]);
  };

  // Notification helper
  const addNotification = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      title: type === 'success' ? 'عملية ناجحة' : type === 'warning' ? 'تنبيه فني' : 'إشعار دراسي',
      message: msg,
      type,
      time: 'الآن'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex bg-[#0b0f19] min-h-screen text-gray-200 font-sans antialiased overflow-x-hidden">
      
      {/* 1. Interactive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        notificationCount={notifications.length}
        onShowNotifications={() => setShowNotificationPanel(!showNotificationPanel)}
      />

      {/* 2. Main Content viewport */}
      <main className="flex-1 overflow-y-auto h-screen pb-12 relative">
        
        {/* Render pages depending on current selection */}
        {activeTab === 'dashboard' && (
          <StudentDashboard 
            user={user} 
            files={files} 
            quizzes={quizzes} 
            plans={plans} 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistant 
            onAddNotification={(msg, type) => addNotification(msg, type)} 
          />
        )}

        {activeTab === 'files' && (
          <FileUploadAnalyzer 
            files={files} 
            onUploadSuccess={(newFile) => {
              setFiles(prev => [newFile, ...prev]);
            }}
            onDeleteFile={(id) => {
              setFiles(prev => prev.filter(f => f.id !== id));
            }}
            onAddNotification={(msg, type) => addNotification(msg, type)}
            onNavigateToQuiz={() => setActiveTab('quizzes')}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizGenerator 
            quizzes={quizzes} 
            onQuizGenerated={(newQuiz) => {
              setQuizzes(prev => [newQuiz, ...prev]);
            }}
            onQuizSubmitted={(updatedQuiz) => {
              setQuizzes(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
            }}
            onAddNotification={(msg, type) => addNotification(msg, type)}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner 
            plans={plans} 
            onPlanGenerated={(newPlan) => {
              setPlans(prev => [newPlan, ...prev]);
            }}
            onPlanDeleted={(id) => {
              setPlans(prev => prev.filter(p => p.id !== id));
            }}
            onPlanToggled={(updatedPlan) => {
              setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
            }}
            onAddNotification={(msg, type) => addNotification(msg, type)}
          />
        )}

        {activeTab === 'billing' && (
          <SubscriptionManager 
            user={user} 
            payments={payments} 
            onUpgradeSuccess={(updatedUser, newPayment) => {
              setUser(updatedUser);
              if (newPayment) {
                setPayments(prev => [newPayment, ...prev]);
              }
            }}
            onAddNotification={(msg, type) => addNotification(msg, type)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard 
            onAddNotification={(msg, type) => addNotification(msg, type)} 
          />
        )}

        {activeTab === 'deploy' && (
          <DeploymentExport />
        )}

      </main>

      {/* 3. Notification system overlay */}
      {showNotificationPanel && (
        <NotificationSystem 
          notifications={notifications}
          onClose={() => setShowNotificationPanel(false)}
          onClearAll={() => {
            setNotifications([]);
            addNotification('تم مسح وقراءة كافة التنبيهات السابقة', 'info');
          }}
          onRemoveItem={(id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }}
        />
      )}

    </div>
  );
}
