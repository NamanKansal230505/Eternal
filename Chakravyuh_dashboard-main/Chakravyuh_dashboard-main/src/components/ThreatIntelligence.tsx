import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, Node } from "@/lib/types";
import { 
  analyzeThreatIntelligence, 
  ThreatAssessment 
} from "@/lib/gemini";
import { Brain, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface ThreatIntelligenceProps {
  alerts: Alert[];
  nodes: Node[];
}

const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({
  alerts,
  nodes
}) => {
  const [assessment, setAssessment] = useState<ThreatAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeThreats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get recent alerts (last 30 minutes), or fall back to all alerts if none are recent
      let recentAlerts = alerts
        .filter(alert => {
          const alertTime = new Date(alert.timestamp);
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
          return alertTime > thirtyMinutesAgo;
        })
        .slice(0, 15); // Limit to 15 most recent

      // If no recent alerts, use all available alerts (up to 20)
      if (recentAlerts.length === 0) {
        recentAlerts = alerts.slice(0, 20);
      }

      if (recentAlerts.length === 0) {
        setError("No alerts available to analyze. Alerts are generated when sensor nodes detect activity.");
        setLoading(false);
        return;
      }

      // Prepare alert context
      const alertContexts = recentAlerts.map(alert => {
        const node = nodes.find(n => n.id === alert.nodeId);
        return {
          alertType: alert.type,
          nodeId: alert.nodeId,
          timestamp: alert.timestamp,
          location: node?.location ? `${node.location.lat.toFixed(4)}, ${node.location.lng.toFixed(4)}` : undefined,
          sector: node?.sector,
          severity: alert.severity
        };
      });

      // Get threat assessment
      const threatAssessment = await analyzeThreatIntelligence(
        alertContexts,
        nodes.map(n => ({
          id: n.id,
          sector: n.sector,
          location: n.location
        }))
      );
      setAssessment(threatAssessment);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error("Error analyzing threats:", error);
      setError("Failed to analyze threats. Please check API configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when component mounts if there are alerts
  useEffect(() => {
    if (alerts.length > 0 && !assessment && !loading) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        analyzeThreats();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600 text-white border-red-700";
      case "high":
        return "bg-orange-600 text-white border-orange-700";
      case "medium":
        return "bg-yellow-600 text-white border-yellow-700";
      default:
        return "bg-green-600 text-white border-green-700";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <Card className="border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-army-khaki" />
            AI Threat Intelligence
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeThreats}
            disabled={loading}
            className="border-army-khaki/30"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
        {lastAnalysis && (
          <p className="text-xs text-muted-foreground">
            Last analyzed: {lastAnalysis.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {assessment ? (
          <>
            {/* Alert Count Info */}
            {alerts.length > 0 && (
              <div className="p-2 rounded-lg bg-muted/20 border border-army-khaki/10 text-center">
                <p className="text-xs text-muted-foreground">
                  Analyzing {alerts.filter(a => {
                    const alertTime = new Date(a.timestamp);
                    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
                    return alertTime > thirtyMinutesAgo;
                  }).length || alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Threat Level */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border-2 border-army-khaki/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-6 w-6 ${
                  assessment.threatLevel === 'critical' ? 'text-red-500' :
                  assessment.threatLevel === 'high' ? 'text-orange-500' :
                  assessment.threatLevel === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <div>
                  <span className="text-sm text-muted-foreground">Threat Level</span>
                  <Badge className={`${getThreatColor(assessment.threatLevel)} text-base px-3 py-1 mt-1`}>
                    {assessment.threatLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <p className={`text-lg font-bold ${getConfidenceColor(assessment.confidence)}`}>
                  {assessment.confidence}%
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-army-khaki" />
                Situation Summary
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{assessment.summary}</p>
            </div>

            {/* Pattern Analysis */}
            {assessment.patternAnalysis && (
              <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
                <h4 className="font-semibold mb-2">Pattern Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{assessment.patternAnalysis}</p>
              </div>
            )}

            {/* Correlated Alerts */}
            {assessment.correlatedAlerts && assessment.correlatedAlerts.length > 0 && (
              <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
                <h4 className="font-semibold mb-2">Alert Correlation</h4>
                <ul className="space-y-1">
                  {assessment.correlatedAlerts.map((correlation, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-army-khaki mt-1">•</span>
                      <span>{correlation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-army-khaki" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {assessment.recommendations.length > 0 ? (
                  assessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Badge variant="outline" className="border-army-khaki/30 text-xs px-2 py-0">
                        {idx + 1}
                      </Badge>
                      <span className="flex-1">{rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">No specific recommendations</li>
                )}
              </ul>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
              <h4 className="font-semibold mb-2">Risk Assessment</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{assessment.estimatedRisk}</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-army-khaki" />
                <p>Analyzing threat intelligence...</p>
                <p className="text-xs">This may take a few seconds</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Brain className="h-12 w-12 mx-auto text-army-khaki/50" />
                <p>No threat analysis available</p>
                <p className="text-xs">
                  {alerts.length === 0 
                    ? "No alerts available. Alerts are generated when sensor nodes detect activity."
                    : `Found ${alerts.length} alert${alerts.length !== 1 ? 's' : ''}. Click "Analyze" to assess current situation.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatIntelligence;

