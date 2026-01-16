import React, { useState, useEffect } from "react";
import NetworkStatus from "@/components/NetworkStatus";
import { AddNodeButton, AddNodeModal } from "@/components/AddNodeModal";
import AlertsList from "@/components/AlertsList";
import ActivityLog from "@/components/ActivityLog";
import DeploymentMap from "@/components/DeploymentMap";
import NodeDetails from "@/components/NodeDetails";
import AlertSound from "@/components/AlertSound";
import AlertPopup from "@/components/AlertPopup";
import DroneStatus from "@/components/DroneStatus";
import { toast } from "@/components/ui/use-toast";
import { Node } from "@/lib/types";
import { useFirebase } from "@/hooks/useFirebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  
  // Use Auth0 hook for authentication
  const { user, logout } = useAuth();
  
  // Use our Firebase hook
  const {
    nodes,
    alerts,
    connections,
    networkStatus,
    loading,
    error,
    handleAddNode,
    shouldPlayAlertSound,
    alertSeverity,
    handleSoundPlayed
  } = useFirebase({
    seedDataIfEmpty: true
  });

  // Handle node selection
  const handleSelectNode = (node: Node) => {
    setSelectedNode(node);
    
    // Display node selection toast
    toast({
      title: `Selected ${node.name}`,
      description: `${node.sector} - ${node.status}`,
      duration: 3000,
    });
  };

  // Show temporary alert popup when alerts appear
  useEffect(() => {
    if (alerts.length > 0) {
      // Show popup for ALL alerts, not just critical ones
      setShowAlertPopup(true);
      // Remove auto-close timer - popup stays open until button is clicked
    }
  }, [alerts]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-4 z-10">
          <div className="text-xl font-bold gradient-heading">Loading Chakravyuh</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-t-army-khaki border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-4 max-w-md p-6 bg-red-500/10 rounded-lg z-10">
          <div className="text-xl font-bold text-red-500">Error Loading Data</div>
          <div className="text-muted-foreground">{error.message}</div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-army-red to-army-red/90 text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-army-olive/80 to-army-green/90">
      {/* Alert sound component */}
      <AlertSound 
        playSound={shouldPlayAlertSound} 
        severity={alertSeverity} 
        onSoundPlayed={handleSoundPlayed}
      />
      
      {/* Alert popup for drone surveillance */}
      {showAlertPopup && (
        <AlertPopup 
          open={showAlertPopup}
          severity={alertSeverity}
          alertType={alerts.length > 0 ? alerts[0].type : undefined}
          onClose={() => setShowAlertPopup(false)}
        />
      )}
      
      {/* Main content */}
      <div className="container py-6 space-y-6 relative z-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-heading">Chakravyuh</h1>
            <p className="text-muted-foreground">Army Perimeter Defense System</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/ai-intelligence")}
              className="bg-gradient-to-r from-army-khaki to-army-olive hover:from-army-khaki/90 hover:to-army-olive/90 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Intelligence
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="border-army-red text-army-red hover:bg-army-red hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout {user?.email && `(${user.email.split('@')[0]})`}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NetworkStatus status={networkStatus} />
          <AddNodeButton onClick={() => setIsAddNodeModalOpen(true)} />
          <AlertsList alerts={alerts} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <DeploymentMap
              nodes={nodes}
              connections={connections}
              onSelectNode={handleSelectNode}
              selectedNodeId={selectedNode?.id || null}
            />
          </div>
          <div className="md:col-span-1">
            <NodeDetails node={selectedNode} />
          </div>
        </div>

        <div>
          <ActivityLog alerts={alerts} />
        </div>

        <div>
          <DroneStatus />
        </div>
      </div>

      <AddNodeModal
        open={isAddNodeModalOpen}
        onClose={() => setIsAddNodeModalOpen(false)}
        onAddNode={handleAddNode}
      />
    </div>
  );
};

export default Index;
