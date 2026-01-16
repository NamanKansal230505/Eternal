import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, Node } from "@/lib/types";
import { getDecisionSupport } from "@/lib/gemini";
import { Lightbulb, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

interface DecisionSupportProps {
  alerts: Alert[];
  nodes: Node[];
  networkStatus: { activeNodes: number; totalNodes: number };
  droneStatus: Array<{ id: string; status: string; battery: number }>;
}

const DecisionSupport: React.FC<DecisionSupportProps> = ({
  alerts,
  nodes,
  networkStatus,
  droneStatus
}) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recentAlerts = alerts
        .filter(alert => {
          const alertTime = new Date(alert.timestamp);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          return alertTime > oneHourAgo;
        })
        .slice(0, 10);

      const alertContexts = recentAlerts.map(alert => {
        const node = nodes.find(n => n.id === alert.nodeId);
        return {
          alertType: alert.type,
          nodeId: alert.nodeId,
          timestamp: alert.timestamp,
          sector: node?.sector,
          severity: alert.severity
        };
      });

      const recommendations = await getDecisionSupport(
        alertContexts,
        networkStatus,
        droneStatus
      );
      
      setRecommendations(recommendations);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations(["Review alerts manually", "Check network status"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce: Only fetch recommendations after 3 seconds of no changes
    // This prevents too many API calls when alerts are rapidly changing
    if (alerts.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchRecommendations();
      }, 3000); // Wait 3 seconds before making API call
      
      return () => clearTimeout(timeoutId);
    }
  }, [alerts.length, networkStatus.activeNodes]);

  const getSystemStatus = () => {
    const activeDrones = droneStatus.filter(d => d.status === 'on_station').length;
    const networkHealth = (networkStatus.activeNodes / networkStatus.totalNodes) * 100;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

    return {
      activeDrones,
      networkHealth,
      criticalAlerts,
      overallStatus: criticalAlerts > 0 ? 'alert' : networkHealth > 75 ? 'good' : 'degraded'
    };
  };

  const status = getSystemStatus();

  return (
    <Card className="border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-army-khaki" />
            AI Decision Support
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchRecommendations}
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
                Refresh
              </>
            )}
          </Button>
        </div>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-foreground">{status.activeDrones}</p>
            <p className="text-xs text-muted-foreground">Drones Ready</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-foreground">{status.networkHealth.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Network Health</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className={`text-lg font-bold ${
              status.criticalAlerts > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {status.criticalAlerts}
            </p>
            <p className="text-xs text-muted-foreground">Critical Alerts</p>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`p-3 rounded-lg border-2 ${
          status.overallStatus === 'alert' ? 'bg-red-500/10 border-red-500/30' :
          status.overallStatus === 'good' ? 'bg-green-500/10 border-green-500/30' :
          'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">System Status:</span>
            <Badge 
              variant="outline"
              className={
                status.overallStatus === 'alert' ? 'border-red-500 text-red-500' :
                status.overallStatus === 'good' ? 'border-green-500 text-green-500' :
                'border-yellow-500 text-yellow-500'
              }
            >
              {status.overallStatus === 'alert' ? 'ALERT' :
               status.overallStatus === 'good' ? 'OPERATIONAL' : 'DEGRADED'}
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-army-khaki" />
            Recommended Actions
          </h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-army-khaki" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-army-khaki/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-army-khaki/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-army-khaki">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No specific recommendations at this time.</p>
              <p className="text-xs mt-1">System operating normally.</p>
            </div>
          )}
        </div>

        {/* Resource Availability */}
        <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
          <h4 className="font-semibold mb-3">Resource Availability</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Sensor Nodes</span>
              <Badge variant="outline" className="border-army-khaki/30">
                {networkStatus.activeNodes} / {networkStatus.totalNodes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available Drones</span>
              <Badge variant="outline" className="border-army-khaki/30">
                {status.activeDrones} / {droneStatus.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Alerts (24h)</span>
              <Badge variant="outline" className="border-army-khaki/30">
                {alerts.length}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionSupport;

