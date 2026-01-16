
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove, update } from "firebase/database";
import { Node, Alert, NetworkConnection, NetworkStatus } from "./types";

// Firebase configuration (using the provided database URL)
const firebaseConfig = {
  apiKey: "AIzaSyAq9oeMQ4cXZcB5um7yF9AUXGl9YBaND9w", // This is a public demo API key
  authDomain: "shadow-alert-network.firebaseapp.com",
  databaseURL: "https://saarthi-84622-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "saarthi-84622",
  storageBucket: "saarthi-84622.appspot.com",
  messagingSenderId: "765432109",
  appId: "1:765432109:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// References to database paths
const nodesRef = ref(database, "nodes");
const alertHistoryRef = ref(database, "alertHistory");
const connectionsRef = ref(database, "connections");
const networkStatusRef = ref(database, "networkStatus");

// Function to get a specific node reference
export const getNodeRef = (nodeId: string) => {
  return ref(database, `nodes/${nodeId}`);
};

// Functions to interact with Firebase
export const subscribeToNodes = (callback: (nodes: Node[]) => void) => {
  const unsubscribe = onValue(nodesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const nodesList: Node[] = [];
    
    // Convert object to array and process nodes
    Object.entries(data).forEach(([nodeId, nodeData]: [string, any]) => {
      const node: Node = {
        id: nodeId,
        name: nodeData.name || `Node #${nodeId.replace('node', '')}`,
        sector: nodeData.sector || 'Unknown Sector',
        status: nodeData.status || 'online',
        battery: nodeData.battery || 100,
        signalStrength: nodeData.signalStrength || 100,
        lastActivity: nodeData.lastActivity ? new Date(nodeData.lastActivity) : new Date(),
        location: nodeData.location || { lat: 21.15, lng: 79.08 },
        type: nodeData.type || 'standard',
        alerts: nodeData.alerts || {
          gun: false,
          footsteps: false,
          motion: false,
          whisper: false,
          suspicious_activity: false,
          drone: false,
          help: false,
          fire: false
        }
      };
      
      // Check for fire alert from Firebase path nodes/node1/alerts/fire
      if (nodeId === 'node1' && nodeData.alerts && nodeData.alerts.fire === 1) {
        node.alerts.fire = true;
        // Trigger fire alert event
        const fireAlertEvent = new CustomEvent('fireAlertTriggered', {
          detail: {
            nodeId: 'node1',
            alertType: 'fire',
            description: 'Fire Detected',
            severity: 'critical'
          }
        });
        window.dispatchEvent(fireAlertEvent);
      }
      
      nodesList.push(node);
    });
    
    callback(nodesList);
  });
  
  return unsubscribe;
};

export const subscribeToAlerts = (callback: (alerts: Alert[]) => void) => {
  // Subscribe to alert history from Firebase
  const unsubscribe = onValue(alertHistoryRef, (snapshot) => {
    const data = snapshot.val() || {};
    const alertsList: Alert[] = [];
    
    // Convert object to array and process alerts
    Object.entries(data).forEach(([alertId, alertData]: [string, any]) => {
      const alert: Alert = {
        id: alertId,
        type: alertData.type,
        nodeId: alertData.nodeId,
        timestamp: alertData.timestamp ? new Date(alertData.timestamp) : new Date(),
        description: alertData.description || `${alertData.type} detected`,
        severity: alertData.severity || 'info',
        acknowledged: alertData.acknowledged || false
      };
      alertsList.push(alert);
    });
    
    // Sort by timestamp (newest first)
    alertsList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    callback(alertsList);
  });
  
  return unsubscribe;
};

// Function to save an alert to Firebase history
export const saveAlertToHistory = async (alert: Alert) => {
  try {
    const alertRef = ref(database, `alertHistory/${alert.id}`);
    await set(alertRef, {
      type: alert.type,
      nodeId: alert.nodeId,
      timestamp: alert.timestamp.toISOString(),
      description: alert.description,
      severity: alert.severity,
      acknowledged: alert.acknowledged
    });
  } catch (error) {
    console.error("Error saving alert to history:", error);
  }
};

export const subscribeToConnections = (callback: (connections: NetworkConnection[]) => void) => {
  const unsubscribe = onValue(connectionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const connectionsList = Object.values(data) as NetworkConnection[];
    callback(connectionsList);
  });
  
  return unsubscribe;
};

export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
  const unsubscribe = onValue(networkStatusRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data as NetworkStatus);
  });
  
  return unsubscribe;
};

export const subscribeToSpecificNode = (nodeId: string, callback: (node: Node | null) => void) => {
  const nodeRef = ref(database, `nodes/${nodeId}`);
  const unsubscribe = onValue(nodeRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Create a properly formatted node object
      const node: Node = {
        id: nodeId,
        name: data.name || `Node #${nodeId.replace('node', '')}`,
        sector: data.sector || 'Unknown Sector',
        status: data.status || 'online',
        battery: data.battery || 100,
        signalStrength: data.signalStrength || 100,
        lastActivity: data.lastActivity ? new Date(data.lastActivity) : new Date(),
        location: data.location || { lat: 21.15, lng: 79.08 },
        type: data.type || 'standard',
        alerts: data.alerts || {
          gun: false,
          footsteps: false,
          motion: false,
          whisper: false,
          suspicious_activity: false,
          drone: false,
          help: false
        }
      };
      
      callback(node);
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
};

let nextNodeId = 1;

export const addNewNode = async (node: Node) => {
  // If node id is not provided, generate one
  if (!node.id) {
    // Get the highest number suffix from existing nodes to ensure uniqueness
    const snapshot = await new Promise<any>((resolve) => {
      onValue(nodesRef, (snapshot) => {
        resolve(snapshot.val() || {});
      }, { onlyOnce: true });
    });
    
    const existingNodes = snapshot as Record<string, any>;
    const nodeNumbers = Object.keys(existingNodes)
      .map(id => id.replace('node', ''))
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
    
    nextNodeId = nodeNumbers.length > 0 ? Math.max(...nodeNumbers) + 1 : 1;
    node.id = `node${nextNodeId}`;
  }
  
  const nodeRef = ref(database, `nodes/${node.id}`);
  await set(nodeRef, {
    name: node.name,
    sector: node.sector,
    status: node.status,
    battery: node.battery,
    signalStrength: node.signalStrength,
    lastActivity: node.lastActivity.toISOString(),
    location: node.location,
    type: node.type,
    alerts: {
      gun: false,
      footsteps: false,
      motion: false,
      whisper: false,
      suspicious_activity: false,
      drone: false,
      help: false
    }
  });
  
  // Update network status
  const networkStatusSnapshot = await new Promise<any>((resolve) => {
    onValue(networkStatusRef, (snapshot) => {
      resolve(snapshot.val() || {});
    }, { onlyOnce: true });
  });
  
  const currentStatus = networkStatusSnapshot as NetworkStatus;
  
  await set(networkStatusRef, {
    ...currentStatus,
    activeNodes: (currentStatus.activeNodes || 0) + 1,
    totalNodes: (currentStatus.totalNodes || 0) + 1
  });
  
  return node;
};

// Update node alert status - just store true/false without timestamps or other data
export const updateNodeAlert = async (nodeId: string, alertType: string, isActive: boolean) => {
  const nodeAlertRef = ref(database, `nodes/${nodeId}/alerts/${alertType}`);
  await set(nodeAlertRef, isActive);
  return { nodeId, alertType, isActive };
};

export const addConnection = async (connection: NetworkConnection) => {
  const newConnectionRef = push(connectionsRef);
  await set(newConnectionRef, connection);
  return connection;
};

export const seedInitialData = async () => {
  try {
    // Import mock data
    const { mockNodes, mockAlerts, mockConnections, mockNetworkStatus } = await import('./mockData');
    
    // Seed nodes with alert properties - all alerts set to false initially
    for (const node of mockNodes) {
      // Add alerts property to each node
      const nodeWithAlerts = {
        ...node,
        lastActivity: node.lastActivity.toISOString(),
        alerts: {
          gun: false,
          footsteps: false,
          motion: false,
          whisper: false,
          suspicious_activity: false,
          drone: false,
          help: false
        }
      };
      
      await set(ref(database, `nodes/${node.id}`), nodeWithAlerts);
    }
    
    // Seed alert history with mock alerts
    for (const alert of mockAlerts) {
      await set(ref(database, `alertHistory/${alert.id}`), {
        type: alert.type,
        nodeId: alert.nodeId,
        timestamp: alert.timestamp.toISOString(),
        description: alert.description,
        severity: alert.severity,
        acknowledged: alert.acknowledged
      });
    }
    
    // Seed connections
    for (const connection of mockConnections) {
      const newConnectionRef = push(connectionsRef);
      await set(newConnectionRef, connection);
    }
    
    // Seed network status
    await set(networkStatusRef, mockNetworkStatus);
    
    console.log("Initial data seeded successfully");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
};

// Update drone deployment status in Firebase
export const updateDroneDeploymentStatus = async (deploymentData: {
  droneId: string;
  status: string;
  deploymentTime: string;
  alertSeverity: string;
  location: string;
}) => {
  try {
    // Simply set /activate to 1 in Firebase
    const activateRef = ref(database, 'activate');
    await set(activateRef, 1);

    console.log('Activate value set to 1 in Firebase');
    return { success: true };
  } catch (error) {
    console.error('Error setting activate value:', error);
    throw error;
  }
};

export { database };
