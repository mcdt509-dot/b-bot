import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, BotSecurityReport } from "../types";

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
      model: "gemini-1.5-pro",
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
      model: "gemini-1.5-pro",
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

export const analyzeDiscordBots = async (serverId: string, botData: string): Promise<BotSecurityReport[]> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Analyze the following Discord bots for security risks and reputation. 
      Server ID: ${serverId}
      Bot Data: ${botData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              botName: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
              excessivePermissions: { type: Type.ARRAY, items: { type: Type.STRING } },
              vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING },
              reputationScore: { type: Type.NUMBER, description: "Neural reputation score from 0 to 100 based on known bot history, developer reputation, and community trust." },
              isVerified: { type: Type.BOOLEAN, description: "Whether the bot is officially verified by Discord." },
              developerName: { type: Type.STRING, description: "The name of the bot developer or development team." },
              developerReputation: { type: Type.STRING, description: "A summary of the developer's reputation in the security and Discord communities." }
            },
            required: ['botName', 'riskLevel', 'excessivePermissions', 'vulnerabilities', 'recommendation', 'reputationScore', 'isVerified', 'developerName', 'developerReputation']
          }
        },
        systemInstruction: "You are a specialized Discord bot security auditor. Analyze integrated bots for excessive permissions, known vulnerabilities, and potential malicious behavior. Additionally, provide a neural reputation score (0-100), verification status, and a detailed developer reputation analysis based on your knowledge of the bot's developer, history, and community reputation."
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse Bot analysis", e);
      return [];
    }
  });
};

export const draftReport = async (
  analysis: AnalysisResult, 
  programName: string, 
  platform: string, 
  vulnerabilityType?: string,
  customFields?: { key: string, value: string }[]
): Promise<string> => {
  return withRetry(async () => {
    const customFieldsText = customFields && customFields.length > 0 
      ? `\nCustom Fields:\n${customFields.map(f => `- ${f.key}: ${f.value}`).join('\n')}`
      : '';

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Draft a professional bug bounty report for the following vulnerability:
      Program: ${programName}
      Platform: ${platform}
      Vulnerability Type: ${vulnerabilityType || 'General'}
      Vulnerability: ${analysis.vulnerability}
      Severity: ${analysis.severity}
      Description: ${analysis.description}
      Remediation: ${analysis.remediation}${customFieldsText}`,
      config: {
        systemInstruction: `Draft a report in Markdown format specifically formatted for the ${platform} platform. 
        Include sections for Summary, Steps to Reproduce, Impact, and Remediation. 
        If the platform is HackerOne, use their common report structure (e.g., Summary, Steps To Reproduce, Supporting Material/References, Impact). 
        If Bugcrowd, follow their conventions (e.g., Description, Steps to Reproduce, Impact, Recommended Fix). 
        If Intigriti, follow their structure.
        Incorporate any provided Custom Fields into the relevant sections or a dedicated "Additional Information" section.
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
      model: "gemini-1.5-pro",
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
