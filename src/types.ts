/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionId: string;
  planName: SubscriptionPlan;
  status: SubscriptionStatus;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FileData {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  fileSize: string;
  summary: string;
  points: string[];
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'essay';
  question: string;
  options?: string[]; // for MCQ
  answer: string; // for MCQ/TF
  explanation?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  questions: QuizQuestion[];
  score: number; // percentage
  completed: boolean;
  createdAt: string;
}

export interface StudyPlanDay {
  day: string;
  topics: {
    title: string;
    description: string;
    duration: string;
    completed: boolean;
  }[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  subject: string;
  goals: string;
  planData: StudyPlanDay[];
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
  status: 'succeeded' | 'failed' | 'pending';
  createdAt: string;
}

export interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'claude';
  apiKey: string;
  enabled: boolean;
  modelName: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalChats: number;
  totalFilesProcessed: number;
  totalQuizzesGenerated: number;
  aiTokensUsed: {
    gemini: number;
    openai: number;
    claude: number;
  };
  revenueHistory: { month: string; amount: number }[];
  aiUsageHistory: { date: string; gemini: number; openai: number; claude: number }[];
}
