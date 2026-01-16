import { GoogleGenAI } from "@google/genai/web";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Debug: Log API key status in development (first 10 chars only for security)
if (import.meta.env.DEV) {
  console.log('[Gemini API Init]', {
    hasAPIKey: !!API_KEY,
    apiKeyLength: API_KEY.length,
    apiKeyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'none',
    hasGenAI: !!genAI,
    envVarValue: import.meta.env.VITE_GEMINI_API_KEY ? `${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10)}...` : 'not set'
  });
}

// Common Gemini model names to try (in order of preference)
// Note: Model availability depends on your API key, region, and billing tier
const DEFAULT_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-preview",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-pro"
];

// Rate limiting: Track last request time and implement throttling
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

// Helper function to wait/delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to try multiple models if one fails, with retry logic for rate limits
async function tryGenerateContent(prompt: string, models: string[] = DEFAULT_MODELS, retryCount = 0): Promise<any> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }
  
  // Rate limiting: Ensure minimum time between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
  
  let lastError: any = null;
  for (const modelName of models) {
    try {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt
      });
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Check for HTTP status codes (404, 400, etc.)
      const statusCode = error?.status || error?.response?.status || error?.code;
      const errorMessage = error?.message || String(error) || "";
      
      // Handle rate limiting (429) with exponential backoff retry
      if (statusCode === 429 || errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("too many requests") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        const maxRetries = 3;
        if (retryCount < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
          console.warn(`[Gemini API] Rate limit hit (429). Retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          await delay(backoffDelay);
          return tryGenerateContent(prompt, models, retryCount + 1);
        } else {
          console.error(`[Gemini API] Rate limit exceeded after ${maxRetries} retries. Please wait before making more requests.`);
          throw new Error("Rate limit exceeded. Please wait a few moments before trying again.");
        }
      }
      
      // Log detailed error for debugging
      console.error(`[Gemini API] Model ${modelName} failed:`, {
        statusCode,
        message: errorMessage,
        error: error
      });
      
      // If it's a model-specific error (404, MODEL_NOT_FOUND, or mentions model), try next model
      const isModelError = statusCode === 404 || 
                          errorMessage.includes("model") || 
                          errorMessage.includes("MODEL_NOT_FOUND") ||
                          errorMessage.includes("not found") ||
                          errorMessage.includes("Not Found");
      
      // If it's not a model-specific error (API key, quota, etc.), don't try other models
      if (!isModelError) {
        console.error(`[Gemini API] Non-model error detected, not trying other models:`, error);
        throw error;
      }
      
      console.warn(`[Gemini API] Model ${modelName} failed (likely not available), trying next...`);
      continue;
    }
  }
  
  // All models failed
  const errorMsg = lastError?.message || String(lastError) || "Unknown error";
  console.error(`[Gemini API] All models failed. Last error:`, lastError);
  throw new Error(`All Gemini models failed. Last error: ${errorMsg}`);
}

export interface ThreatAssessment {
  threatLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  recommendations: string[];
  correlatedAlerts: string[];
  patternAnalysis: string;
  estimatedRisk: string;
  confidence: number;
}

export interface AlertContext {
  alertType: string;
  nodeId: string;
  timestamp: Date;
  location?: string;
  sector?: string;
  severity?: string;
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  explanation: string;
  confidence: number;
  suggestedActions: string[];
}

/**
 * Analyze multiple alerts and provide threat assessment
 */
export async function analyzeThreatIntelligence(
  alerts: AlertContext[],
  nodes: Array<{ id: string; sector: string; location: { lat: number; lng: number } }>
): Promise<ThreatAssessment> {
  if (!genAI) {
    return getDefaultThreatAssessment();
  }

  const prompt = `You are an AI security analyst for an Indian Army perimeter defense system (Chakravyuh). 
Analyze the following alerts from sensor nodes and provide a comprehensive threat assessment.

ALERT DATA:
${alerts.map((alert, idx) => `
Alert ${idx + 1}:
- Type: ${alert.alertType}
- Node: ${alert.nodeId} (${alert.sector || 'Unknown Sector'})
- Time: ${alert.timestamp.toISOString()}
- Location: ${alert.location || 'N/A'}
- Severity: ${alert.severity || 'unknown'}
`).join('\n')}

NODE INFORMATION:
${nodes.map(node => `- ${node.id}: ${node.sector} at (${node.location.lat}, ${node.location.lng})`).join('\n')}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "threatLevel": "low|medium|high|critical",
  "summary": "Brief 2-3 sentence summary of the threat situation",
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "correlatedAlerts": ["Description of how alerts correlate"],
  "patternAnalysis": "Analysis of patterns across alerts",
  "estimatedRisk": "Risk assessment with reasoning",
  "confidence": 85
}

Consider:
1. Alert types and their severity (gun, fire, help are critical)
2. Geographic proximity of alerts
3. Temporal patterns (alerts happening close in time)
4. Potential coordinated attacks
5. False positive likelihood
6. Recommended immediate actions for army perimeter defense

Respond ONLY with valid JSON, no markdown formatting, no code blocks.`;

  try {
    const response = await tryGenerateContent(prompt);
    const text = response.text || "";
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ThreatAssessment;
      return parsed;
    }
    
    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error("[Gemini API] Threat Intelligence Error:", error);
    
    // Handle specific API errors with detailed logging
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    } else if (statusCode === 403 || errorMessage.includes("PERMISSION_DENIED")) {
      console.error("[Gemini API] Permission denied. Check API key permissions and billing status.");
    } else if (statusCode === 429 || errorMessage.includes("QUOTA_EXCEEDED") || errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
      console.error("[Gemini API] Rate limit exceeded (429). Too many requests. Please wait before trying again.");
    } else if (statusCode === 404 || errorMessage.includes("model") || errorMessage.includes("MODEL_NOT_FOUND")) {
      console.error("[Gemini API] Model not found (404). The model may not be available for your API key or region.");
      console.error("[Gemini API] Please check: 1) Model availability in Google AI Studio, 2) Billing enabled, 3) Correct model name");
    } else {
      console.error("[Gemini API] Unexpected error:", { statusCode, message: errorMessage, error });
    }
    
    return getDefaultThreatAssessment();
  }
}

/**
 * Generate natural language alert summary
 */
export async function generateAlertSummary(
  alert: AlertContext,
  nodeInfo: { sector: string; status: string; battery: number }
): Promise<string> {
  if (!genAI) {
    return `${alert.alertType} detected at ${alert.nodeId} in ${nodeInfo.sector}`;
  }

  const prompt = `Generate a concise, professional alert summary for an army security system.

Alert Type: ${alert.alertType}
Node: ${alert.nodeId}
Sector: ${nodeInfo.sector}
Node Status: ${nodeInfo.status}
Battery: ${nodeInfo.battery}%

Create a 2-3 sentence summary that:
- Describes the alert clearly
- Provides context about the location
- Indicates urgency level
- Uses professional military terminology

Keep it concise and actionable.`;

  try {
    const response = await tryGenerateContent(prompt);
    return response.text || `${alert.alertType} detected at ${alert.nodeId} in ${nodeInfo.sector}`;
  } catch (error: any) {
    console.error("[Gemini API] Alert Summary Error:", error);
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    }
    return `${alert.alertType} detected at ${alert.nodeId} in ${nodeInfo.sector}`;
  }
}

/**
 * Provide decision support recommendations
 */
export async function getDecisionSupport(
  currentAlerts: AlertContext[],
  networkStatus: { activeNodes: number; totalNodes: number },
  droneStatus: Array<{ id: string; status: string; battery: number }>
): Promise<string[]> {
  if (!genAI) {
    return ["Review alerts manually", "Check network status", "Assess drone availability"];
  }

  const prompt = `You are a tactical decision support system for an army ground control station.

CURRENT SITUATION:
- Active Alerts: ${currentAlerts.length}
- Alert Types: ${currentAlerts.map(a => a.alertType).join(', ')}
- Network Status: ${networkStatus.activeNodes}/${networkStatus.totalNodes} nodes active
- Available Drones: ${droneStatus.filter(d => d.status === 'on_station').length}
- Drone Status: ${droneStatus.map(d => `${d.id}: ${d.status} (${d.battery}% battery)`).join(', ')}

Provide 3-5 immediate action recommendations in priority order.
Consider:
1. Alert severity and patterns
2. Available resources (drones, nodes)
3. Standard operating procedures for perimeter defense
4. Resource allocation efficiency

Format as a numbered list of actionable recommendations.`;

  try {
    const response = await tryGenerateContent(prompt);
    const text = response.text || "";
    
    // Extract recommendations (numbered list)
    const recommendations = text
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()) || /^[-*]/.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);
    
    return recommendations.length > 0 ? recommendations : ["Review situation manually"];
  } catch (error: any) {
    console.error("[Gemini API] Decision Support Error:", error);
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    }
    return ["Review alerts manually", "Check network status", "Assess drone availability"];
  }
}

/**
 * Detect anomalies in alert patterns
 */
export async function detectAnomalies(
  recentAlerts: AlertContext[],
  historicalPattern: string
): Promise<AnomalyDetection> {
  if (!genAI) {
    return {
      isAnomaly: false,
      explanation: "Analysis unavailable",
      confidence: 0,
      suggestedActions: []
    };
  }

  const prompt = `Analyze if the following alert pattern is anomalous compared to normal operations.

RECENT ALERTS (Last 1 hour):
${recentAlerts.map(a => `- ${a.alertType} at ${a.nodeId} (${a.timestamp.toISOString()})`).join('\n')}

HISTORICAL PATTERN:
${historicalPattern || "Normal operations: 2-3 alerts per hour, mostly motion/footsteps"}

Determine if this is an anomaly. Consider:
- Alert frequency vs normal
- Alert types and combinations
- Geographic distribution
- Temporal clustering

Respond in JSON format (ONLY JSON, no markdown):
{
  "isAnomaly": true/false,
  "explanation": "Brief explanation",
  "confidence": 0-100,
  "suggestedActions": ["Action 1", "Action 2"]
}`;

  try {
    const response = await tryGenerateContent(prompt);
    const text = response.text || "";
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnomalyDetection;
    }
    
    return {
      isAnomaly: false,
      explanation: "Unable to analyze",
      confidence: 0,
      suggestedActions: []
    };
  } catch (error: any) {
    console.error("[Gemini API] Anomaly Detection Error:", error);
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    }
    return {
      isAnomaly: false,
      explanation: "Analysis unavailable",
      confidence: 0,
      suggestedActions: []
    };
  }
}

/**
 * Generate daily intelligence report
 */
export async function generateIntelligenceReport(
  alerts: AlertContext[],
  networkMetrics: {
    totalAlerts: number;
    criticalAlerts: number;
    nodesOnline: number;
    avgResponseTime: number;
  }
): Promise<string> {
  if (!genAI) {
    return "Report generation unavailable. Please configure Gemini API key.";
  }

  const prompt = `Generate a professional daily intelligence report for an army perimeter defense system.

STATISTICS:
- Total Alerts: ${networkMetrics.totalAlerts}
- Critical Alerts: ${networkMetrics.criticalAlerts}
- Nodes Online: ${networkMetrics.nodesOnline}
- Average Response Time: ${networkMetrics.avgResponseTime}ms

ALERT BREAKDOWN:
${alerts.slice(0, 20).map(a => `- ${a.alertType} at ${a.nodeId} (${a.sector || 'Unknown'})`).join('\n')}

Create a comprehensive report with:
1. Executive Summary
2. Alert Analysis
3. Threat Assessment
4. Recommendations
5. Network Status

Use professional military reporting format.`;

  try {
    const response = await tryGenerateContent(prompt);
    return response.text || "Report generation unavailable.";
  } catch (error: any) {
    console.error("[Gemini API] Intelligence Report Error:", error);
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    }
    return "Report generation unavailable.";
  }
}

/**
 * Analyze alert patterns and trends
 */
export async function analyzeAlertPatterns(
  alerts: AlertContext[],
  timeWindow: "hour" | "day" | "week" = "day"
): Promise<string> {
  if (!genAI) {
    return "Pattern analysis unavailable.";
  }

  const prompt = `Analyze alert patterns and trends for an army perimeter defense system.

ALERTS (Last ${timeWindow}):
${alerts.map(a => `- ${a.alertType} at ${a.nodeId} in ${a.sector || 'Unknown'} (${a.timestamp.toISOString()})`).join('\n')}

Provide analysis on:
1. Alert frequency trends
2. Most common alert types
3. Geographic hotspots
4. Temporal patterns
5. Potential security concerns

Format as a structured analysis report.`;

  try {
    const response = await tryGenerateContent(prompt);
    return response.text || "Pattern analysis unavailable.";
  } catch (error: any) {
    console.error("[Gemini API] Pattern Analysis Error:", error);
    const statusCode = error?.status || error?.response?.status || error?.code;
    const errorMessage = error?.message || String(error) || "";
    
    if (statusCode === 401 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key")) {
      console.error("[Gemini API] Invalid API key. Please check your VITE_GEMINI_API_KEY in .env");
    }
    return "Pattern analysis unavailable.";
  }
}

/**
 * Get default threat assessment when API is unavailable
 */
function getDefaultThreatAssessment(): ThreatAssessment {
  return {
    threatLevel: "medium",
    summary: "Unable to analyze threats at this time. Manual review recommended.",
    recommendations: ["Review alerts manually", "Check sensor node status", "Verify network connectivity"],
    correlatedAlerts: [],
    patternAnalysis: "Analysis unavailable - API not configured",
    estimatedRisk: "Unknown - requires manual assessment",
    confidence: 0
  };
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  // Debug: Log API key status (only in development)
  if (import.meta.env.DEV) {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    console.log('[Gemini Config Check]', {
      hasAPIKey: !!envKey,
      apiKeyLength: envKey.length,
      hasGenAI: !!genAI,
      configured: !!genAI && API_KEY.length > 0
    });
  }
  return !!genAI && API_KEY.length > 0;
}
