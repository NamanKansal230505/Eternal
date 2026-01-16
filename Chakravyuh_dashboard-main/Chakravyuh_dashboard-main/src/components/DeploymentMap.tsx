
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Node, NetworkConnection } from "@/lib/types";

interface DeploymentMapProps {
  nodes: Node[];
  connections: NetworkConnection[];
  onSelectNode: (node: Node) => void;
  selectedNodeId: string | null;
}

const DeploymentMap: React.FC<DeploymentMapProps> = ({ 
  nodes, 
  connections, 
  onSelectNode,
  selectedNodeId 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Simple approach: load Leaflet directly
    const loadMap = () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initMap, 100); // Small delay to ensure CSS is loaded
        };
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    loadMap();
  }, []);

  const initMap = () => {
    if (!mapContainerRef.current || !window.L || mapInitialized) return;

    console.log('Initializing map...');
    console.log('Nodes:', nodes);
    console.log('Node coordinates:', nodes.map(n => ({ id: n.id, lat: n.location.lat, lng: n.location.lng })));
    console.log('Container:', mapContainerRef.current);

    const L = window.L;
    
    // Force container dimensions
    const container = mapContainerRef.current;
    container.style.width = '100%';
    container.style.height = '400px';
    container.style.minHeight = '400px';

    // Calculate center from actual nodes
    const centerLat = (Math.max(...nodes.map(n => n.location.lat)) + Math.min(...nodes.map(n => n.location.lat))) / 2;
    const centerLng = (Math.max(...nodes.map(n => n.location.lng)) + Math.min(...nodes.map(n => n.location.lng))) / 2;
    
    console.log('Calculated map center:', { centerLat, centerLng });

    // Create map
    const map = L.map(container, {
      center: [centerLat, centerLng], // Use calculated center from nodes
      zoom: 14, // Closer zoom to see the rectangle clearly
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    console.log('Map created, adding nodes...');

    // Add nodes
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => {
        console.log(`Adding node: ${node.name} at ${node.location.lat}, ${node.location.lng}`);
        
        // Special handling for gateway node (command center)
        if (node.type === "gateway") {
          // Create command center icon
          const commandCenterIcon = L.divIcon({
            html: `<div style="
              width: 40px; 
              height: 40px; 
              background: linear-gradient(135deg, #1e40af, #3b82f6);
              border: 3px solid #ffffff;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1e40af;
                font-weight: bold;
                font-size: 14px;
              ">CC</div>
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(30, 64, 175, 0.9);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
              ">COMMAND</div>
            </div>`,
            className: 'command-center-icon',
            iconSize: [40, 50],
            iconAnchor: [20, 25]
          });

          const marker = L.marker([node.location.lat, node.location.lng], { icon: commandCenterIcon }).addTo(map);
          
          // Add popup for command center
          marker.bindPopup(`
            <div style="min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #1e40af;">🏛️ Command Center</h3>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #10b981;">ONLINE</span></p>
              <p style="margin: 4px 0;"><strong>Function:</strong> Network Control Hub</p>
              <p style="margin: 4px 0;"><strong>Signal:</strong> ${node.signalStrength}%</p>
              <p style="margin: 4px 0;"><strong>Battery:</strong> ${node.battery}%</p>
              <p style="margin: 4px 0;"><strong>Connected Nodes:</strong> 4</p>
            </div>
          `);

          // Handle click
          marker.on('click', () => onSelectNode(node));
        } else {
          // Regular node handling
          const color = node.status === 'online' ? '#10B981' : '#EF4444';
          const size = 24; // All regular nodes are standard size
          
          const icon = L.divIcon({
            html: `<div style="
              width: ${size}px; 
              height: ${size}px; 
              background: ${color}; 
              border: 3px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold;
              font-size: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${node.id.replace('node', '')}</div>`,
            className: 'custom-node-icon',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
          });

          const marker = L.marker([node.location.lat, node.location.lng], { icon }).addTo(map);
          
          // Add popup for regular nodes
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0;">${node.name}</h3>
              <p><strong>Status:</strong> ${node.status}</p>
              <p><strong>Sector:</strong> ${node.sector}</p>
              <p><strong>Battery:</strong> ${node.battery}%</p>
              <p><strong>Signal:</strong> ${node.signalStrength}%</p>
            </div>
          `);

          // Handle click
          marker.on('click', () => onSelectNode(node));
        }
      });
    }

    // Add connections
    if (connections && connections.length > 0) {
      connections.forEach(conn => {
        const source = nodes.find(n => n.id === conn.source);
        const target = nodes.find(n => n.id === conn.target);
        
        if (source && target) {
          console.log(`Adding connection: ${source.id} to ${target.id}`);
          
          // Create polyline for connection with better visibility
          const polyline = L.polyline([
            [source.location.lat, source.location.lng],
            [target.location.lat, target.location.lng]
          ], {
            color: '#8B7D39', // Army khaki color
            weight: 3, // Medium thickness
            opacity: 0.8, // Good opacity
            dashArray: '5, 5', // Dashed pattern
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
        }
      });
    }

    setMapInitialized(true);
    console.log('Map initialization complete!');
  };

  // Re-initialize when nodes change
  useEffect(() => {
    // Only run this effect once when the component mounts
    // Don't re-initialize the map when nodes/connections change
  }, []); // Empty dependency array - only runs once

  return (
    <Card className="h-full border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Deployment Map - OpenStreetMap</CardTitle>
      </CardHeader>
      <CardContent className="p-1">
        <div 
          ref={mapContainerRef}
          className="w-full h-[400px] rounded-md bg-gray-200"
          style={{ 
            minHeight: '400px',
            position: 'relative'
          }}
        >
          {!mapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-t-army-khaki border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentMap;
