export interface Program {
  id: string;
  name: string;
  platform: 'HackerOne' | 'Bugcrowd' | 'Intigriti' | 'Private';
  rewardRange: [number, number];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  program: string;
  status: 'Draft' | 'Submitted' | 'Triaged' | 'Resolved' | 'Informative' | 'Duplicate';
  bounty?: number;
  severity: string;
  createdAt: string;
}

export interface AnalysisResult {
  vulnerability: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cvss: number;
  description: string;
  remediation: string;
  confidence: number;
}

export interface BotSecurityReport {
  botName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  excessivePermissions: string[];
  vulnerabilities: string[];
  recommendation: string;
  reputationScore: number;
  isVerified: boolean;
  developerName: string;
  developerReputation: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

export interface ActiveJob {
  id: string;
  programId: string;
  programName: string;
  status: 'Initializing' | 'Scanning' | 'Analyzing' | 'Exploiting' | 'Completed' | 'Failed';
  progress: number;
  startedAt: string;
  vulnerabilityFound?: string;
  severity?: string;
  cvss?: number;
  rewardAmount?: number;
  claimed?: boolean;
}
