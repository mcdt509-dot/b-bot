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

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}
