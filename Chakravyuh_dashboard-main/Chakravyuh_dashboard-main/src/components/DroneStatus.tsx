import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Battery, 
  Signal, 
  Camera, 
  Play, 
  Pause,
  Wifi,
  Zap,
  Eye,
  AlertTriangle
} from "lucide-react";

interface Drone {
  id: string;
  name: string;
  status: 'on_station' | 'charging' | 'maintenance' | 'deployed' | 'on_mission';
  battery: number;
  signalStrength: number;
  location: string;
  type: string;
}

const DroneStatus: React.FC = () => {
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [drones, setDrones] = useState<Drone[]>([
    {
      id: "drone1",
      name: "Eagle Eye Alpha",
      status: "on_station",
      battery: 95,
      signalStrength: 98,
      location: "Sector A - Perimeter",
      type: "Surveillance"
    },
    {
      id: "drone2",
      name: "Shadow Hawk Beta",
      status: "maintenance",
      battery: 45,
      signalStrength: 0,
      location: "Hangar Bay 2",
      type: "Reconnaissance"
    },
    {
      id: "drone3",
      name: "Stealth Raven Gamma",
      status: "maintenance",
      battery: 32,
      signalStrength: 0,
      location: "Maintenance Bay",
      type: "Stealth"
    },
    {
      id: "drone4",
      name: "Thunder Bird Delta",
      status: "maintenance",
      battery: 18,
      signalStrength: 0,
      location: "Repair Station",
      type: "Combat"
    }
  ]);

  // Listen for drone status changes from AlertPopup
  useEffect(() => {
    const handleDroneStatusChange = (event: CustomEvent) => {
      const { droneId, newStatus } = event.detail;
      setDrones(prevDrones => 
        prevDrones.map(drone => 
          drone.id === droneId 
            ? { ...drone, status: newStatus as Drone['status'] }
            : drone
        )
      );
    };

    window.addEventListener('droneStatusChanged', handleDroneStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('droneStatusChanged', handleDroneStatusChange as EventListener);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_station':
        return 'bg-green-600 hover:bg-green-700';
      case 'charging':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'maintenance':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'deployed':
        return 'bg-red-600 hover:bg-red-700';
      case 'on_mission':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 70) return 'text-green-500';
    if (battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const renderBar = (value: number, color: string) => (
    <div className="w-24 h-1.5 bg-muted/40 rounded">
      <div className={`h-1.5 ${color} rounded`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );

  const summary = {
    active: drones.filter(d => d.status === 'on_station').length,
    charging: drones.filter(d => d.status === 'charging').length,
    maintenance: drones.filter(d => d.status === 'maintenance').length,
    deployed: drones.filter(d => d.status === 'deployed').length,
    onMission: drones.filter(d => d.status === 'on_mission').length,
    total: drones.length,
  };

  return (
    <Card className="h-full border-army-khaki/30 bg-gradient-to-b from-army-olive/80 to-army-green/80">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with KPI Summary */}
          <div data-drone-section className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Drone Fleet</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-600/40 text-green-500">Active {summary.active}</Badge>
              <Badge variant="outline" className="border-purple-600/40 text-purple-500">Mission {summary.onMission}</Badge>
              <Badge variant="outline" className="border-blue-600/40 text-blue-500">Charging {summary.charging}</Badge>
              <Badge variant="outline" className="border-yellow-600/40 text-yellow-500">Maint {summary.maintenance}</Badge>
              <Badge variant="outline" className="border-red-600/40 text-red-500">Deployed {summary.deployed}</Badge>
              <Badge variant="secondary" className="bg-army-khaki/20 border-army-khaki/30">Total {summary.total}</Badge>
            </div>
          </div>

          {/* Main Layout: Drones List (Left) + Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Drones List */}
            <div className="lg:col-span-1">
              <Card className="border-army-khaki/30 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-lg">Fleet Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {drones.map((drone) => (
                    <div 
                      key={drone.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedDrone?.id === drone.id 
                          ? 'border-army-khaki bg-army-khaki/10 shadow-md' 
                          : 'border-army-khaki/30 hover:border-army-khaki/50'
                      }`}
                      onClick={() => setSelectedDrone(drone)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Plane className={`w-4 h-4 ${
                            drone.status === 'on_station' || drone.status === 'on_mission' ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <span className="font-semibold text-sm">{drone.name}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(drone.status)} text-white`}
                        >
                          {drone.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Battery className={`w-3 h-3 ${getBatteryColor(drone.battery)}`} />
                            <span>Battery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderBar(drone.battery, 'bg-green-500')}
                            <span className={getBatteryColor(drone.battery)}>{drone.battery}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Signal className={`w-3 h-3 ${drone.signalStrength > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                            <span>Signal</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderBar(drone.signalStrength, 'bg-blue-500')}
                            <span>{drone.signalStrength}%</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground truncate">
                          {drone.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Details Panels */}
            <div className="lg:col-span-2 space-y-4">
              {selectedDrone ? (
                <>
                  {/* Live Feed Card */}
                  <Card className="border-army-khaki/30 bg-card/90">
                    <CardHeader>
                      <CardTitle className="text-lg">Live Feed - {selectedDrone.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Live Video Placeholder */}
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isVideoPlaying ? (
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                              </div>
                              <p className="text-sm">LIVE</p>
                              <p className="text-xs text-gray-400">{selectedDrone.name}</p>
                            </div>
                          ) : (
                            <div className="text-center text-white">
                              <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">Video Feed Offline</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Video Controls */}
                        <div className="absolute bottom-2 right-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={toggleVideo}
                            className="bg-black/50 hover:bg-black/70 text-white border-0"
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Quick Status Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Status</span>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(selectedDrone.status)} text-white`}
                          >
                            {selectedDrone.status.replace("_", " ")}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Battery</span>
                          <div className="flex items-center gap-2">
                            {renderBar(selectedDrone.battery, 'bg-green-500')}
                            <span className={getBatteryColor(selectedDrone.battery)}>{selectedDrone.battery.toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Signal</span>
                          <div className="flex items-center gap-2">
                            {renderBar(selectedDrone.signalStrength, 'bg-blue-500')}
                            <span>{selectedDrone.signalStrength}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Location</span>
                          <span className="text-muted-foreground">{selectedDrone.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather & Specs Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Weather Conditions */}
                    <Card className="border-army-khaki/30 bg-card/90">
                      <CardHeader>
                        <CardTitle className="text-lg">Weather Conditions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Weather Icon and Main Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-2xl">🌤️</span>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-foreground">
                                {Math.floor(Math.random() * 15) + 20}°C
                              </div>
                              <div className="text-sm text-muted-foreground">Partly Cloudy</div>
                            </div>
                          </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">Wind</span>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                              {Math.floor(Math.random() * 25) + 5} km/h
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">Humidity</span>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                              {Math.floor(Math.random() * 30) + 40}%
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium">Visibility</span>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                              {Math.floor(Math.random() * 5) + 8} km
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium">Pressure</span>
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                              {Math.floor(Math.random() * 20) + 1000} hPa
                            </div>
                          </div>
                        </div>

                        {/* Flight Conditions */}
                        <div className="pt-2 border-t border-muted">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Flight Conditions</span>
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              Favorable
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Specifications */}
                    <Card className="border-army-khaki/30 bg-card/90">
                      <CardHeader>
                        <CardTitle className="text-lg">Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Technical Specs</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{selectedDrone.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Range:</span>
                                <span>15 km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Max Altitude:</span>
                                <span>120 m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Flight Time:</span>
                                <span>45 min</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-muted">
                            <h4 className="font-semibold text-sm mb-2">Mission Status</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Mission:</span>
                                <span>2 hours ago</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Missions:</span>
                                <span>47</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Success Rate:</span>
                                <span className="text-green-600">98.5%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                /* No Drone Selected State */
                <div className="lg:col-span-2">
                  <Card className="border-army-khaki/30 bg-card/90 h-full">
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">No Drone Selected</h3>
                        <p className="text-sm">Select a drone from the fleet list to view detailed information</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DroneStatus;

