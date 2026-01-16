
import { Node, Alert, NetworkConnection, AlertType } from "./types";

// Mock node data (5 nodes - 4 in rectangle + 1 at center)
export const mockNodes: Node[] = [
  {
    id: "node1",
    name: "Node #01",
    sector: "Sector A",
    status: "online",
    battery: 85,
    signalStrength: Math.floor(Math.random() * 51) + 50, // Dynamic: 50-100
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
    location: { lat: 28.5500, lng: 77.1850 }, // Top-left of rectangle
    type: "standard"
  },
  {
    id: "node2",
    name: "Node #02",
    sector: "Sector B",
    status: "offline",
    battery: 0,
    signalStrength: 0,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    location: { lat: 28.5500, lng: 77.2000 }, // Top-right of rectangle
    type: "standard"
  },
  {
    id: "node3",
    name: "Node #03",
    sector: "Sector C",
    status: "offline",
    battery: 0,
    signalStrength: 0,
    lastActivity: new Date(Date.now() - 20 * 60 * 1000),
    location: { lat: 28.5350, lng: 77.1850 }, // Bottom-left of rectangle
    type: "standard"
  },
  {
    id: "node4",
    name: "Node #04",
    sector: "Sector D",
    status: "offline",
    battery: 0,
    signalStrength: 0,
    lastActivity: new Date(Date.now() - 25 * 60 * 1000),
    location: { lat: 28.5350, lng: 77.2000 }, // Bottom-right of rectangle
    type: "standard"
  },
  {
    id: "node5",
    name: "Node #05",
    sector: "Sector E",
    status: "online",
    battery: 95,
    signalStrength: Math.floor(Math.random() * 51) + 50, // Dynamic: 50-100
    lastActivity: new Date(Date.now() - 1 * 60 * 1000),
    location: { lat: 28.5425, lng: 77.1925 }, // Center of the rectangle
    type: "gateway"
  }
];

// Alert descriptions by type
const alertDescriptions: Record<AlertType, string[]> = {
  gun: ["Gun Reload Detected", "Gunshot Detected", "Multiple Gunshots Detected"],
  footsteps: ["Footsteps Detected", "Multiple Footsteps", "Heavy Footsteps Detected"],
  motion: ["Movement Detected", "Fast Movement Detected", "Motion Alert"],
  whisper: ["Whispers Detected", "Quiet Speech Detected", "Low Voice Conversation"],
  suspicious_activity: ["Suspicious Activity", "Unusual Pattern Detected", "Unidentified Activity"],
  drone: ["Drone Detected", "UAV Activity", "Aerial Vehicle Detected"],
  help: ["Help Call Detected", "Distress Signal", "Emergency Request"],
  fire: ["Fire Detected", "Smoke Detected", "Flame Detected"]
};

// Alert severities by type - All alerts are now critical
const alertSeverities: Record<AlertType, "critical" | "warning" | "info"> = {
  gun: "critical",
  footsteps: "critical",
  motion: "critical",
  whisper: "critical",
  suspicious_activity: "critical",
  drone: "critical",
  help: "critical",
  fire: "critical"
};

// Generate mock alerts (for all 5 nodes)
export const mockAlerts: Alert[] = [
  // Recent alerts for node1
  {
    id: "alert1",
    type: "gun",
    nodeId: "node1",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    description: "Gun Reload Detected",
    severity: "critical",
    acknowledged: false
  },
  // Recent alerts for node2
  {
    id: "alert2",
    type: "footsteps",
    nodeId: "node2",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    description: "Multiple Footsteps",
    severity: "critical",
    acknowledged: false
  },
  // Recent alerts for node3
  {
    id: "alert3",
    type: "motion",
    nodeId: "node3",
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    description: "Motion Alert",
    severity: "critical",
    acknowledged: false
  },
  // Recent alerts for node4
  {
    id: "alert4",
    type: "suspicious_activity",
    nodeId: "node4",
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    description: "Suspicious Activity",
    severity: "critical",
    acknowledged: false
  },
  // Recent alerts for node5
  {
    id: "alert5",
    type: "drone",
    nodeId: "node5",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    description: "Drone Detected",
    severity: "critical",
    acknowledged: false
  },
  // Fire alert for node1
  {
    id: "alert6",
    type: "fire",
    nodeId: "node1",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    description: "Fire Detected",
    severity: "critical",
    acknowledged: false
  }
];

// Mock network connections between the 5 nodes (4 in rectangle + 1 above)
export const mockConnections: NetworkConnection[] = [
  { source: "node1", target: "node2", strength: 88 }, // Top horizontal
  { source: "node2", target: "node4", strength: 92 }, // Right vertical
  { source: "node4", target: "node3", strength: 90 }, // Bottom horizontal
  { source: "node3", target: "node1", strength: 87 }, // Left vertical
  { source: "node1", target: "node4", strength: 85 }, // Diagonal
  { source: "node2", target: "node3", strength: 89 }, // Diagonal
  { source: "node5", target: "node1", strength: 82 }, // 5th node to top-left
  { source: "node5", target: "node2", strength: 84 }, // 5th node to top-right
  { source: "node5", target: "node3", strength: 80 }, // 5th node to bottom-left
  { source: "node5", target: "node4", strength: 83 }, // 5th node to bottom-right
];

// Mock network status - Only counting the 4 standard nodes (excluding command center)
export const mockNetworkStatus = {
  activeNodes: 1, // Only Node 1 (online) - excluding command center Node 5
  totalNodes: 4, // Only the 4 standard nodes, excluding command center
  networkHealth: 25 // 1 out of 4 nodes active = 25%
};

// Function to generate a new mock alert
export function generateMockAlert(): Alert {
  const alertTypeKeys = Object.keys(alertDescriptions) as AlertType[];
  const randomType = alertTypeKeys[Math.floor(Math.random() * alertTypeKeys.length)];
  
  const nodeIndex = Math.floor(Math.random() * mockNodes.length);
  const node = mockNodes[nodeIndex];
  
  const descriptionsForType = alertDescriptions[randomType];
  const randomDescription = descriptionsForType[Math.floor(Math.random() * descriptionsForType.length)];
  
  return {
    id: `alert${Date.now()}`,
    type: randomType,
    nodeId: node.id,
    timestamp: new Date(),
    description: randomDescription,
    severity: alertSeverities[randomType],
    acknowledged: false
  };
}

// Function to generate a new node
export function generateNewNode(name: string, sector: string, location: { lat: number; lng: number }): Node {
  return {
    id: `node${Date.now()}`,
    name,
    sector,
    status: "online",
    battery: 100,
    signalStrength: 95,
    lastActivity: new Date(),
    location,
    type: "standard"
  };
}

// Function to update dynamic signal strength for online nodes
export function updateDynamicSignalStrength(): void {
  // Update Node 1 signal strength (50-100)
  const node1 = mockNodes.find(n => n.id === "node1");
  if (node1 && node1.status === "online") {
    node1.signalStrength = Math.floor(Math.random() * 51) + 50;
  }
  
  // Update Node 5 signal strength (50-100)
  const node5 = mockNodes.find(n => n.id === "node5");
  if (node5 && node5.status === "online") {
    node5.signalStrength = Math.floor(Math.random() * 51) + 50;
  }
}

// Function to get current dynamic signal strength
export function getCurrentSignalStrength(nodeId: string): number {
  const node = mockNodes.find(n => n.id === nodeId);
  if (node && (nodeId === "node1" || nodeId === "node5")) {
    return Math.floor(Math.random() * 51) + 50;
  }
  return node?.signalStrength || 0;
}
