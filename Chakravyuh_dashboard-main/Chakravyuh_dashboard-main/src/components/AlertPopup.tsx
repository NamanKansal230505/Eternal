import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDroneDeploymentStatus } from "@/lib/firebase";

interface AlertPopupProps {
  open: boolean;
  severity: 'critical' | 'warning' | 'info';
  alertType?: string; // Add alertType prop to customize messages
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ open, severity, alertType, onClose }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  
  // Customize dialog message based on alert type
  const getDialogMessage = () => {
    if (alertType === 'fire') {
      return "Fire detected in perimeter. Deploy surveillance drone for immediate assessment?";
    }
    if (alertType === 'help') {
      return "Someone is asking for help. Deploy surveillance drone for immediate assessment?";
    }
    return "Perimeter breach detected. Deploy surveillance drone for immediate assessment?";
  };

  // Customize dialog title based on alert type
  const getDialogTitle = () => {
    if (alertType === 'fire') {
      return "Fire Alert";
    }
    if (alertType === 'help') {
      return "Help Alert";
    }
    return "Critical Alert"; // All alerts are now critical
  };

  const handleDeployDrone = async () => {
    setIsDeploying(true);
    
    try {
      // Update Firebase with drone deployment status
      await updateDroneDeploymentStatus({
        droneId: 'drone1', // Eagle Eye Alpha
        status: 'on_mission', // Changed from 'deployed' to 'on_mission'
        deploymentTime: new Date().toISOString(),
        alertSeverity: severity,
        location: 'Perimeter Sector A'
      });

      // Update local drone status to "on_mission"
      // This will trigger a re-render in the DroneStatus component
      const droneStatusEvent = new CustomEvent('droneStatusChanged', {
        detail: {
          droneId: 'drone1',
          newStatus: 'on_mission'
        }
      });
      window.dispatchEvent(droneStatusEvent);

      // Simulate drone deployment
      setTimeout(() => {
        setIsDeploying(false);
        
        // Smooth scroll to drone section
        const droneSection = document.querySelector('[data-drone-section]');
        if (droneSection) {
          droneSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
        
        // Close the dialog
        onClose();
        
        // Show success toast
        toast({
          title: "🚁 Drone Deployed Successfully!",
          description: "Eagle Eye Alpha is now on mission. Monitoring perimeter for threats.",
          variant: "default",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error deploying drone:', error);
      setIsDeploying(false);
      
      toast({
        title: "❌ Deployment Failed",
        description: "Failed to deploy drone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent className="border-2 border-red-500 bg-red-950/20 animate-pulse-slow">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="text-red-500" />
            {getDialogTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {getDialogMessage()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleDismiss}
            className="bg-muted/30 hover:bg-muted/50"
          >
            Dismiss
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeployDrone}
            disabled={isDeploying}
            className="bg-gradient-to-r from-army-red to-army-red/90 hover:from-army-red/90 hover:to-army-red flex items-center gap-2"
          >
            {isDeploying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Arm Surveillance Drone
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertPopup;