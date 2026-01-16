import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ThreatIntelligence from "@/components/ThreatIntelligence";
import AlertAnalysis from "@/components/AlertAnalysis";
import DecisionSupport from "@/components/DecisionSupport";
import IntelligenceReport from "@/components/IntelligenceReport";
import { useFirebase } from "@/hooks/useFirebase";
import { Brain, ArrowLeft, AlertCircle } from "lucide-react";
import { isGeminiConfigured } from "@/lib/gemini";

const AIIntelligence = () => {
  const navigate = useNavigate();
  
  // Use Firebase hook to get data
  const {
    nodes,
    alerts,
    connections,
    networkStatus,
    loading,
    error
  } = useFirebase({
    seedDataIfEmpty: true  // Enable seed data so we have alerts to analyze
  });

  // Mock drone status - in production, this would come from your drone management system
  const droneStatus = [
    { id: "drone1", status: "on_station", battery: 95 },
    { id: "drone2", status: "maintenance", battery: 45 },
    { id: "drone3", status: "maintenance", battery: 32 },
    { id: "drone4", status: "maintenance", battery: 18 }
  ];

  const geminiConfigured = isGeminiConfigured();

  // Debug: Log current state
  React.useEffect(() => {
    console.log('AI Intelligence Page State:', { loading, error, alertsCount: alerts.length, nodesCount: nodes.length });
  }, [loading, error, alerts.length, nodes.length]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-army-olive/80 to-army-green/90">
        <div className="text-center space-y-4 z-10">
          <div className="text-xl font-bold gradient-heading">Loading AI Intelligence</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-army-khaki border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-army-olive/80 to-army-green/90">
        <div className="text-center space-y-4 max-w-md p-6 bg-red-500/10 rounded-lg z-10">
          <div className="text-xl font-bold text-red-500">Error Loading Data</div>
          <div className="text-muted-foreground">{error.message}</div>
          <Button
            className="px-4 py-2 bg-gradient-to-r from-army-red to-army-red/90 text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-army-olive/80 to-army-green/90">
      {/* Header */}
      <div className="container mx-auto px-4 py-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-army-khaki/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold gradient-heading flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Intelligence Center
              </h1>
              <p className="text-muted-foreground">Powered by Google Gemini AI</p>
            </div>
          </div>
        </div>

        {/* API Configuration Warning */}
        {!geminiConfigured && (
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-600 mb-1">Gemini API Not Configured</h3>
                  <p className="text-sm text-muted-foreground">
                    To use AI features, please set your <code className="bg-muted px-1 rounded">VITE_GEMINI_API_KEY</code> in your <code className="bg-muted px-1 rounded">.env</code> file.
                    Get your API key from{" "}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-army-khaki hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert Status Info */}
        <Card className="border-army-khaki/30 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alert Status</p>
                <p className="text-xs text-muted-foreground">
                  {alerts.length > 0 
                    ? `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} available for analysis (last 24 hours)`
                    : "No alerts available. Alerts are generated when sensor nodes detect activity."
                  }
                </p>
              </div>
              {alerts.length > 0 && (
                <Badge variant="outline" className="border-army-khaki/30">
                  {alerts.filter(a => a.severity === 'critical').length} Critical
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main AI Features Grid */}
        {nodes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Intelligence - Full Width */}
            <div className="lg:col-span-2">
              <ThreatIntelligence alerts={alerts} nodes={nodes} />
            </div>

            {/* Alert Analysis */}
            <div>
              <AlertAnalysis alerts={alerts} nodes={nodes} />
            </div>

            {/* Decision Support */}
            <div>
              <DecisionSupport
                alerts={alerts}
                nodes={nodes}
                networkStatus={networkStatus}
                droneStatus={droneStatus}
              />
            </div>

            {/* Intelligence Report - Full Width */}
            <div className="lg:col-span-2">
              <IntelligenceReport
                alerts={alerts}
                nodes={nodes}
                networkStatus={networkStatus}
              />
            </div>
          </div>
        ) : (
          <Card className="border-army-khaki/30 bg-card/50">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-army-khaki/50" />
              <h3 className="text-lg font-semibold mb-2">Waiting for Data</h3>
              <p className="text-sm text-muted-foreground">
                Loading sensor nodes and alerts from Firebase...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIIntelligence;

