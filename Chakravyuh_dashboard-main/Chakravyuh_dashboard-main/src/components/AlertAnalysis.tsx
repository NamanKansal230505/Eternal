import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, Node } from "@/lib/types";
import { generateAlertSummary, analyzeAlertPatterns } from "@/lib/gemini";
import { BarChart3, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface AlertAnalysisProps {
  alerts: Alert[];
  nodes: Node[];
}

const AlertAnalysis: React.FC<AlertAnalysisProps> = ({ alerts, nodes }) => {
  const [summaries, setSummaries] = useState<Map<string, string>>(new Map());
  const [patternAnalysis, setPatternAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);

  const generateSummaries = async () => {
    setLoading(true);
    const newSummaries = new Map<string, string>();
    
    try {
      // Generate summaries for recent alerts
      const recentAlerts = alerts.slice(0, 10);
      
      for (const alert of recentAlerts) {
        const node = nodes.find(n => n.id === alert.nodeId);
        if (node) {
          try {
            const summary = await generateAlertSummary(
              {
                alertType: alert.type,
                nodeId: alert.nodeId,
                timestamp: alert.timestamp,
                sector: node.sector,
                severity: alert.severity
              },
              {
                sector: node.sector,
                status: node.status,
                battery: node.battery
              }
            );
            newSummaries.set(alert.id, summary);
          } catch (error) {
            console.error(`Error generating summary for ${alert.id}:`, error);
            newSummaries.set(alert.id, `${alert.type} detected at ${alert.nodeId}`);
          }
        }
      }
      
      setSummaries(newSummaries);
    } catch (error) {
      console.error("Error generating summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = async () => {
    setAnalyzingPatterns(true);
    try {
      const alertContexts = alerts.slice(0, 50).map(alert => {
        const node = nodes.find(n => n.id === alert.nodeId);
        return {
          alertType: alert.type,
          nodeId: alert.nodeId,
          timestamp: alert.timestamp,
          sector: node?.sector,
          severity: alert.severity
        };
      });

      const analysis = await analyzeAlertPatterns(alertContexts, "day");
      setPatternAnalysis(analysis);
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      setPatternAnalysis("Pattern analysis unavailable.");
    } finally {
      setAnalyzingPatterns(false);
    }
  };

  useEffect(() => {
    if (alerts.length > 0) {
      generateSummaries();
    }
  }, [alerts.length]);

  const getAlertTypeCount = () => {
    const counts = new Map<string, number>();
    alerts.forEach(alert => {
      counts.set(alert.type, (counts.get(alert.type) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  };

  const getSeverityCount = () => {
    const counts = { critical: 0, warning: 0, info: 0 };
    alerts.forEach(alert => {
      counts[alert.severity] = (counts[alert.severity] || 0) + 1;
    });
    return counts;
  };

  return (
    <Card className="border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-army-khaki" />
            Alert Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={generateSummaries}
              disabled={loading}
              className="border-army-khaki/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={analyzePatterns}
              disabled={analyzingPatterns}
              className="border-army-khaki/30"
            >
              {analyzingPatterns ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Patterns
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
            <p className="text-xs text-muted-foreground">Total Alerts</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-2xl font-bold text-red-500">{getSeverityCount().critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-2xl font-bold text-orange-500">{getSeverityCount().warning}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
        </div>

        {/* Alert Type Distribution */}
        <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
          <h4 className="font-semibold mb-3">Alert Type Distribution</h4>
          <div className="space-y-2">
            {getAlertTypeCount().map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-army-khaki/30">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-army-khaki rounded-full"
                      style={{ width: `${(count / alerts.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Analysis */}
        {patternAnalysis && (
          <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
            <h4 className="font-semibold mb-2">Pattern Analysis</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {patternAnalysis}
            </div>
          </div>
        )}

        {/* Enhanced Alert Summaries */}
        <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
          <h4 className="font-semibold mb-3">AI-Enhanced Alert Summaries</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.slice(0, 10).map(alert => {
              const node = nodes.find(n => n.id === alert.nodeId);
              const summary = summaries.get(alert.id);
              
              return (
                <div key={alert.id} className="p-3 rounded-lg bg-muted/20 border border-army-khaki/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`border-${
                          alert.severity === 'critical' ? 'red' :
                          alert.severity === 'warning' ? 'orange' : 'blue'
                        }-500/30 text-${
                          alert.severity === 'critical' ? 'red' :
                          alert.severity === 'warning' ? 'orange' : 'blue'
                        }-500`}
                      >
                        {alert.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {node?.sector || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {summary ? (
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3 w-3 text-army-khaki mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{summary}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {alert.description || `${alert.type} detected`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertAnalysis;

