export type Language = 
  | 'kinyarwanda' 
  | 'swahili' 
  | 'luganda' 
  | 'amharic' 
  | 'yoruba' 
  | 'french' 
  | 'english';

export type DataMode = 'standard' | 'datasaver'; // 2G Data Saver Mode

export interface QAMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isCached?: boolean;
  language: Language;
  topicCategory?: string;
  suggestedFollowUps?: string[];
}

export interface OfflineTopic {
  id: string;
  category: 'agriculture' | 'mobile_money' | 'business' | 'health' | 'market_prices' | 'community';
  title: Record<Language, string>;
  content: Record<Language, string>;
  quickQuestions: Record<Language, string[]>;
  iconName: string;
}

export interface MobileTransaction {
  id: string;
  date: string;
  type: 'income' | 'payment' | 'airtime' | 'utility' | 'peer_transfer';
  amount: number;
  currency: string;
  counterparty: string;
  status: 'completed' | 'flagged' | 'pending';
  reference: string;
}

export interface CommunityReference {
  id: string;
  name: string;
  role: 'cooperative_leader' | 'local_elder' | 'market_chair' | 'fellow_trader' | 'landlord';
  phone: string;
  relationshipMonths: number;
  vouchAmount: number;
  trustRating: 1 | 2 | 3 | 4 | 5;
  verificationStatus: 'verified' | 'pending' | 'vouched';
  notes: string;
}

export interface ScoreFactor {
  label: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
  points: number;
}

export interface CreditAssessment {
  score: number; // 300 - 850
  tier: string;
  maxLoanAmount: number;
  currency: string;
  recommendedInterestRate: number;
  turnoverMonthly: number;
  consistencyScore: number; // 0 - 100
  communityVouchScore: number; // 0 - 100
  repaymentReliability: number; // 0 - 100
  factors: ScoreFactor[];
  improvementTips: string[];
}

export interface WorkerProfile {
  name: string;
  occupation: string;
  location: string;
  phone: string;
  currency: string;
  experienceYears: number;
  cooperativeName?: string;
}
