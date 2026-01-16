import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Use Gemini Pro model
const getModel = () => {
  if (!genAI) {
    throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file");
  }
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ThreatAssessment;
      return parsed;
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini API Error:", error);
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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract recommendations (numbered list)
    const recommendations = text
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()) || /^[-*]/.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);
    
    return recommendations.length > 0 ? recommendations : ["Review situation manually"];
  } catch (error) {
    console.error("Gemini API Error:", error);
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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
  } catch (error) {
    console.error("Gemini API Error:", error);
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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
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
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
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
  return !!genAI && API_KEY.length > 0;
}

