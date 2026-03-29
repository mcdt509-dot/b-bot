import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
      const errorMessage = error.message || '';
      const errorCode = error.code || error.status || (error.error && error.error.code);
      
      // Check for rate limit error (429) or quota exhausted
      if (
        errorCode === 429 || 
        errorMessage.includes('429') || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED')
      ) {
        const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const analyzeVulnerability = async (code: string, context: string): Promise<AnalysisResult[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the following code/context for security vulnerabilities. 
      Code: ${code}
      Context: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vulnerability: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
              cvss: { type: Type.NUMBER, description: "Estimated CVSS 3.1 score from 0.0 to 10.0" },
              description: { type: Type.STRING },
              remediation: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ['vulnerability', 'severity', 'cvss', 'description', 'remediation', 'confidence']
          }
        },
        systemInstruction: "You are a world-class security researcher and bug bounty hunter. Analyze code for OWASP Top 10 and other critical vulnerabilities. Be precise and provide actionable remediation steps."
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return [];
    }
  });
};

export const analyzeDiscordServer = async (serverId: string, config: string): Promise<AnalysisResult[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the following Discord server configuration for security vulnerabilities. 
      Server ID: ${serverId}
      Configuration Data: ${config}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vulnerability: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
              cvss: { type: Type.NUMBER, description: "Estimated CVSS 3.1 score from 0.0 to 10.0" },
              description: { type: Type.STRING },
              remediation: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ['vulnerability', 'severity', 'cvss', 'description', 'remediation', 'confidence']
          }
        },
        systemInstruction: "You are a specialized Discord security auditor. Analyze server configurations, permissions, webhook setups, and bot integrations for potential security risks. Focus on misconfigurations that could lead to unauthorized access, data leaks, or server takeovers."
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse Discord analysis", e);
      return [];
    }
  });
};

export const draftReport = async (analysis: AnalysisResult, programName: string, platform: string): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Draft a professional bug bounty report for the following vulnerability:
      Program: ${programName}
      Platform: ${platform}
      Vulnerability: ${analysis.vulnerability}
      Severity: ${analysis.severity}
      Description: ${analysis.description}
      Remediation: ${analysis.remediation}`,
      config: {
        systemInstruction: `Draft a report in Markdown format specifically formatted for the ${platform} platform. 
        Include sections for Summary, Steps to Reproduce, Impact, and Remediation. 
        If the platform is HackerOne, use their common report structure. 
        If Bugcrowd, follow their conventions. 
        Use a professional, technical tone.`
      }
    });

    return response.text || "";
  });
};

export interface SecurityInsight {
  id: string;
  type: 'threat' | 'anomaly' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  recommendation: string;
}

export const analyzeSystemLogs = async (logs: { timestamp: string, message: string, type: string }[]): Promise<SecurityInsight[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the following system logs for security threats or anomalies. 
      Logs: ${JSON.stringify(logs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['threat', 'anomaly', 'info'] },
              severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ['id', 'type', 'severity', 'title', 'description', 'timestamp', 'recommendation']
          }
        },
        systemInstruction: "You are a specialized AI security analyst. Analyze system logs to identify potential security threats, unusual patterns (anomalies), and provide clear, actionable recommendations. Categorize findings by severity and type."
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse security insights", e);
      return [];
    }
  });
};
