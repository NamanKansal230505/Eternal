import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, Node } from "@/lib/types";
import { generateIntelligenceReport } from "@/lib/gemini";
import { FileText, Loader2, Download } from "lucide-react";

interface IntelligenceReportProps {
  alerts: Alert[];
  nodes: Node[];
  networkStatus: { activeNodes: number; totalNodes: number };
}

const IntelligenceReport: React.FC<IntelligenceReportProps> = ({
  alerts,
  nodes,
  networkStatus
}) => {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const alertContexts = alerts.slice(0, 100).map(alert => {
        const node = nodes.find(n => n.id === alert.nodeId);
        return {
          alertType: alert.type,
          nodeId: alert.nodeId,
          timestamp: alert.timestamp,
          sector: node?.sector,
          severity: alert.severity
        };
      });

      const networkMetrics = {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        nodesOnline: networkStatus.activeNodes,
        avgResponseTime: 250 // This could be calculated from actual data
      };

      const generatedReport = await generateIntelligenceReport(
        alertContexts,
        networkMetrics
      );
      
      setReport(generatedReport);
      setGeneratedAt(new Date());
    } catch (error) {
      console.error("Error generating report:", error);
      setReport("Report generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligence-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-army-khaki" />
            Intelligence Report Generator
          </CardTitle>
          <div className="flex gap-2">
            {report && (
              <Button
                size="sm"
                variant="outline"
                onClick={downloadReport}
                className="border-army-khaki/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={generateReport}
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
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
        {generatedAt && (
          <p className="text-xs text-muted-foreground">
            Generated: {generatedAt.toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Statistics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-foreground">{alerts.length}</p>
            <p className="text-xs text-muted-foreground">Total Alerts</p>
          </div>
          <div className="p-2 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-red-500">
              {alerts.filter(a => a.severity === 'critical').length}
            </p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="p-2 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-foreground">{networkStatus.activeNodes}</p>
            <p className="text-xs text-muted-foreground">Active Nodes</p>
          </div>
          <div className="p-2 rounded-lg bg-card/50 border border-army-khaki/20 text-center">
            <p className="text-lg font-bold text-foreground">{nodes.length}</p>
            <p className="text-xs text-muted-foreground">Total Nodes</p>
          </div>
        </div>

        {/* Generated Report */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-army-khaki" />
              <p className="text-sm text-muted-foreground">Generating intelligence report...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        ) : report ? (
          <div className="p-4 rounded-lg bg-card/50 border border-army-khaki/20">
            <div className="prose prose-sm max-w-none text-foreground">
              <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-mono">
                {report}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-army-khaki/50" />
            <p className="text-sm">No report generated yet</p>
            <p className="text-xs mt-1">Click "Generate Report" to create an intelligence report</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligenceReport;

