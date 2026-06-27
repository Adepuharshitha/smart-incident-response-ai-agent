export interface User {
  email: string;
  name: string;
  avatar: string;
  role: string;
  preferences: {
    routingStrategy: "budget" | "balanced" | "accuracy";
    autoRemember: boolean;
    defaultTags: string[];
  };
}

export interface IncidentMemory {
  id: string;
  title: string;
  description: string;
  errorSignature: string;
  rootCause: string;
  resolution: string;
  tags: string[];
  confidence: number;
  engineerFeedback?: "correct" | "helpful" | "needs_improvement";
  feedbackNote?: string;
  timestamp: string;
  isCustom?: boolean;
}

export interface IncidentHistoryItem {
  id: string;
  title: string;
  description: string;
  logContent?: string;
  stackTrace?: string;
  rootCause: string;
  resolution: string;
  tags: string[];
  confidence: number;
  isMemoryHit: boolean;
  matchedMemoryId?: string;
  modelUsed: string;
  cost: number;
  latency: number;
  timestamp: string;
  userEmail: string;
  feedback?: "correct" | "helpful" | "needs_improvement";
  feedbackNote?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  incidentTitle: string;
  inputType: "manual" | "stacktrace" | "log_file";
  inputSize: number;
  selectedModel: string;
  routingReason: string;
  cost: number;
  latency: number;
  escalated: boolean;
  escalationReason?: string;
  budgetCap: number;
  cumulativeCostAfter: number;
}

export interface DashboardMetrics {
  totalIncidentsAnalyzed: number;
  memoryHits: number;
  totalCostSaved: number;
  averageLatency: number;
  budgetLimit: number;
  budgetConsumed: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentIncidents: IncidentHistoryItem[];
  modelStats: {
    "gemini-3.1-flash-lite": number;
    "gemini-3.5-flash": number;
    "gemini-3.1-pro-preview": number;
  };
  memoriesCount: number;
  auditsCount: number;
}
