# 🛡️ Chakravyuh - AI-Powered Ground Control Station

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.6.1-FFCA28?logo=firebase)

**An intelligent IoT-based ground control station for real-time sensor node monitoring, alert analysis, and AI-driven threat assessment for perimeter defense systems.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Usage Guide](#-usage-guide)
- [AI Intelligence Features](#-ai-intelligence-features)
- [Firebase Setup](#-firebase-setup)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Chakravyuh** is a sophisticated ground control station designed for military and security applications. It provides real-time monitoring of distributed IoT sensor nodes, intelligent alert processing, and AI-powered threat analysis using Google Gemini AI.

### Key Capabilities

- 🔴 **Real-time Monitoring**: Live tracking of sensor nodes with status, battery, and signal strength
- 🚨 **Intelligent Alert System**: Multi-severity alerts (critical, warning, info) with audio notifications
- 🤖 **AI-Powered Analysis**: Google Gemini AI integration for threat assessment and pattern detection
- 🗺️ **Interactive Mapping**: Visual deployment map with node locations and network topology
- 🚁 **Drone Integration**: Automated drone deployment triggers for critical alerts
- 📊 **Comprehensive Analytics**: Alert patterns, threat intelligence, and decision support

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Real-time Node Monitoring** | Monitor sensor nodes with live status updates, battery levels, and signal strength |
| **Multi-Type Alert Detection** | Supports 8 alert types: gun, footsteps, motion, whisper, suspicious_activity, drone, help, fire |
| **Firebase Integration** | Seamless real-time data synchronization with Firebase Realtime Database |
| **Interactive Dashboard** | Modern, responsive UI with real-time updates and visual feedback |
| **Alert History** | Persistent alert storage with 24-hour retention and historical analysis |
| **Network Topology** | Visual representation of node connections and network health |

### AI Intelligence Features

| Feature | Description |
|---------|-------------|
| **Threat Intelligence** | Comprehensive threat assessment with severity levels and recommendations |
| **Alert Analysis** | AI-generated summaries and pattern detection across alerts |
| **Decision Support** | Real-time tactical recommendations based on current situation |
| **Anomaly Detection** | Identify unusual patterns and potential security threats |
| **Intelligence Reports** | Automated daily/weekly security reports with insights |

### User Interface

- 🎨 Modern, military-themed design with gradient backgrounds
- 📱 Fully responsive layout for desktop and mobile devices
- 🔊 Audio alerts with severity-based sound cues
- 🔔 Popup notifications for critical alerts
- 📍 Interactive map with Leaflet integration
- 📈 Real-time charts and statistics

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.1** - Build tool and dev server
- **Tailwind CSS 3.4.11** - Styling
- **shadcn/ui** - Component library
- **React Router 6.26.2** - Routing
- **TanStack Query 5.56.2** - Data fetching and caching

### Backend & Services
- **Firebase 11.6.1** - Realtime Database
- **Google Gemini AI** - AI analysis and intelligence

### Maps & Visualization
- **Leaflet 1.9.4** - Interactive maps
- **React-Leaflet 4.2.1** - React bindings for Leaflet
- **Recharts 2.12.7** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** or **bun** - Package manager
- **Firebase Account** - For database access
- **Google AI Studio Account** - For Gemini API key (optional, for AI features)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Chakravyuh_dashboard-main/Chakravyuh_dashboard-main
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini AI API Key (optional - for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal)

### 5. Access the Application

- **Login Page**: `http://localhost:5173/`
- **Dashboard**: `http://localhost:5173/dashboard`
- **AI Intelligence**: `http://localhost:5173/ai-intelligence`
- **Regions**: `http://localhost:5173/regions`

---

## ⚙️ Configuration

### Firebase Configuration

The Firebase configuration is located in `src/lib/firebase.ts`. Update the following if using your own Firebase project:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### Alert Types Configuration

Alert types and their severity levels are defined in `src/hooks/firebase/alertUtils.ts`:

```typescript
const alertSeverity: Record<AlertType, 'critical' | 'warning' | 'info'> = {
  gun: 'critical',
  footsteps: 'warning',
  motion: 'info',
  whisper: 'warning',
  suspicious_activity: 'critical',
  drone: 'warning',
  help: 'critical',
  fire: 'critical'
};
```

---

## 📁 Project Structure

```
Chakravyuh_dashboard-main/
├── public/                 # Static assets
│   ├── alert-*.mp3        # Alert sound files
│   └── lovable-uploads/   # Image assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── ActivityLog.tsx
│   │   ├── AlertAnalysis.tsx
│   │   ├── AlertPopup.tsx
│   │   ├── AlertsList.tsx
│   │   ├── DeploymentMap.tsx
│   │   ├── DroneStatus.tsx
│   │   ├── NetworkStatus.tsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── firebase/      # Firebase-related hooks
│   │   │   ├── useFirebase.ts
│   │   │   ├── useNodeProcessor.ts
│   │   │   └── alertUtils.ts
│   │   └── use-mobile.tsx
│   ├── lib/               # Utility libraries
│   │   ├── firebase.ts    # Firebase configuration
│   │   ├── gemini.ts      # Gemini AI integration
│   │   ├── types.ts       # TypeScript types
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Main dashboard
│   │   ├── AIIntelligence.tsx
│   │   ├── Login.tsx
│   │   └── Regions.tsx
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🏗️ Architecture

### Data Flow

```
┌─────────────────┐
│  Firebase RTDB  │
│                 │
│  /nodes         │
│  /alertHistory  │
│  /connections   │
│  /networkStatus │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useFirebase    │
│     Hook        │
│                 │
│  - Subscribes   │
│  - Processes    │
│  - Updates      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useNodeProcessor│
│                 │
│  - Alert Gen    │
│  - Severity     │
│  - Sound Trig   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Components    │
│                 │
│  - Dashboard    │
│  - Alerts       │
│  - Map          │
│  - AI Analysis  │
└─────────────────┘
```

### Alert Processing Pipeline

1. **Firebase Update**: Sensor node updates alert status in Firebase
2. **Subscription**: `useFirebase` hook detects change via Firebase listener
3. **Processing**: `useNodeProcessor` converts node alerts to Alert objects
4. **Storage**: Alerts saved to `alertHistory` in Firebase
5. **UI Update**: Components receive alerts and update display
6. **AI Analysis**: (Optional) Gemini AI analyzes alerts for intelligence
7. **Auto-Reset**: Alert flags reset after 15 seconds

### Component Hierarchy

```
App
├── QueryClientProvider
│   └── BrowserRouter
│       ├── Login (/)
│       ├── Index / Dashboard (/dashboard)
│       │   ├── NetworkStatus
│       │   ├── AlertsList
│       │   ├── DeploymentMap
│       │   ├── NodeDetails
│       │   ├── ActivityLog
│       │   ├── DroneStatus
│       │   ├── AlertSound
│       │   └── AlertPopup
│       ├── AIIntelligence (/ai-intelligence)
│       │   ├── ThreatIntelligence
│       │   ├── AlertAnalysis
│       │   ├── DecisionSupport
│       │   └── IntelligenceReport
│       └── Regions (/regions)
```

---

## 📖 Usage Guide

### Dashboard Overview

The main dashboard provides a comprehensive view of your sensor network:

1. **Network Status Card**: Shows active nodes, total nodes, and network health
2. **Alerts List**: Real-time feed of all alerts with severity indicators
3. **Deployment Map**: Interactive map showing node locations and connections
4. **Node Details Panel**: Detailed information about selected node
5. **Activity Log**: Timeline of recent alerts and events
6. **Drone Status**: Current status of surveillance drones

### Working with Alerts

#### Alert Types

- **Critical**: `gun`, `suspicious_activity`, `help`, `fire`
- **Warning**: `footsteps`, `whisper`, `drone`
- **Info**: `motion`

#### Alert Lifecycle

1. Sensor detects event → Updates Firebase `nodes/{nodeId}/alerts/{type}` to `true`
2. System processes alert → Creates Alert object with timestamp
3. Alert displayed → Shows in AlertsList, triggers sound, shows popup
4. Alert stored → Saved to `alertHistory` in Firebase
5. Auto-reset → Alert flag resets to `false` after 15 seconds

#### Responding to Alerts

- **View Details**: Click on alert in AlertsList to see full information
- **Deploy Drone**: Click "Arm Surveillance Drone" in AlertPopup for critical alerts
- **Acknowledge**: (Future feature) Mark alerts as acknowledged

### Using AI Intelligence

Navigate to **AI Intelligence** page to access:

1. **Threat Intelligence**
   - Click "Analyze" to get comprehensive threat assessment
   - View threat level, recommendations, and pattern analysis

2. **Alert Analysis**
   - Click "Enhance" to generate AI summaries for alerts
   - Click "Patterns" to analyze alert trends

3. **Decision Support**
   - Automatic recommendations based on current situation
   - Click "Refresh" to update recommendations

4. **Intelligence Reports**
   - Click "Generate Report" to create comprehensive security report
   - Download report as text file

### Adding New Nodes

1. Click **"Add Node"** button on dashboard
2. Fill in node details:
   - Name
   - Sector
   - Location (lat/lng or use map)
   - Type (standard/advanced/gateway)
3. Click **"Add Node"** to save
4. Node appears on map and in network

---

## 🤖 AI Intelligence Features

### Threat Intelligence Analysis

The AI analyzes multiple alerts and provides:

- **Threat Level**: low, medium, high, or critical
- **Summary**: Brief overview of threat situation
- **Recommendations**: Actionable steps for response
- **Correlated Alerts**: How alerts relate to each other
- **Pattern Analysis**: Trends and patterns in alerts
- **Risk Assessment**: Estimated risk with reasoning
- **Confidence Score**: AI's confidence in assessment (0-100)

### Alert Summaries

AI generates natural language summaries for each alert:

- Context-aware descriptions
- Location and sector information
- Urgency indicators
- Professional military terminology

### Decision Support

Real-time recommendations consider:

- Alert severity and patterns
- Available resources (drones, nodes)
- Network status
- Standard operating procedures
- Resource allocation efficiency

### Pattern Detection

Identifies:

- Alert frequency trends
- Geographic hotspots
- Temporal patterns
- Anomalous behavior
- Potential coordinated attacks

---

## 🔥 Firebase Setup

### Database Structure

```
/nodes
  /{nodeId}
    - name: string
    - sector: string
    - status: "online" | "offline" | "warning"
    - battery: number (0-100)
    - signalStrength: number (0-100)
    - lastActivity: timestamp
    - location: { lat: number, lng: number }
    - type: "standard" | "advanced" | "gateway"
    /alerts
      - gun: boolean
      - footsteps: boolean
      - motion: boolean
      - whisper: boolean
      - suspicious_activity: boolean
      - drone: boolean
      - help: boolean
      - fire: boolean

/alertHistory
  /{alertId}
    - type: AlertType
    - nodeId: string
    - timestamp: timestamp
    - description: string
    - severity: "critical" | "warning" | "info"
    - acknowledged: boolean

/connections
  /{connectionId}
    - source: string (nodeId)
    - target: string (nodeId)
    - strength: number (0-100)

/networkStatus
  - activeNodes: number
  - totalNodes: number
  - networkHealth: number (0-100)

/activate
  - Set to 1 to trigger drone deployment
```

### Security Rules

Configure Firebase Realtime Database rules:

```json
{
  "rules": {
    "nodes": {
      ".read": true,
      ".write": true
    },
    "alertHistory": {
      ".read": true,
      ".write": true
    },
    "connections": {
      ".read": true,
      ".write": true
    },
    "networkStatus": {
      ".read": true,
      ".write": true
    },
    "activate": {
      ".read": true,
      ".write": true
    }
  }
}
```

> **⚠️ Warning**: These rules allow public read/write. For production, implement proper authentication and authorization.

---

## 📚 API Reference

### Firebase Functions

#### `subscribeToNodes(callback)`
Subscribe to real-time node updates.

```typescript
const unsubscribe = subscribeToNodes((nodes: Node[]) => {
  console.log('Nodes updated:', nodes);
});
```

#### `subscribeToAlerts(callback)`
Subscribe to alert history.

```typescript
const unsubscribe = subscribeToAlerts((alerts: Alert[]) => {
  console.log('Alerts updated:', alerts);
});
```

#### `addNewNode(node)`
Add a new sensor node.

```typescript
const newNode = await addNewNode({
  id: 'node1',
  name: 'Node 1',
  sector: 'Sector A',
  status: 'online',
  battery: 100,
  signalStrength: 95,
  lastActivity: new Date(),
  location: { lat: 21.15, lng: 79.08 },
  type: 'standard'
});
```

#### `updateNodeAlert(nodeId, alertType, isActive)`
Update node alert status.

```typescript
await updateNodeAlert('node1', 'gun', true);
```

### Gemini AI Functions

#### `analyzeThreatIntelligence(alerts, nodes)`
Analyze multiple alerts for threat assessment.

```typescript
const assessment = await analyzeThreatIntelligence(alerts, nodes);
console.log(assessment.threatLevel); // 'critical'
console.log(assessment.recommendations); // ['Action 1', 'Action 2']
```

#### `generateAlertSummary(alert, nodeInfo)`
Generate AI summary for an alert.

```typescript
const summary = await generateAlertSummary(alert, {
  sector: 'Sector A',
  status: 'online',
  battery: 95
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### Firebase Connection Errors

**Problem**: Cannot connect to Firebase

**Solutions**:
- Verify Firebase configuration in `src/lib/firebase.ts`
- Check database URL is correct
- Ensure Firebase project is active
- Check network connectivity
- Verify Firebase Realtime Database is enabled

#### Gemini API Not Working

**Problem**: AI features show "API not configured"

**Solutions**:
- Verify `.env` file exists with `VITE_GEMINI_API_KEY`
- Restart development server after adding API key
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Verify API key has proper permissions

#### Alerts Not Appearing

**Problem**: Alerts not showing in dashboard

**Solutions**:
- Check Firebase `nodes/{nodeId}/alerts/{type}` is set to `true`
- Verify Firebase listeners are active (check browser console)
- Check alert processing in `useNodeProcessor`
- Verify alert history is being saved

#### Map Not Loading

**Problem**: Deployment map is blank

**Solutions**:
- Check Leaflet CSS is imported
- Verify node locations are valid coordinates
- Check browser console for errors
- Ensure internet connection for map tiles

#### Audio Alerts Not Playing

**Problem**: Alert sounds not playing

**Solutions**:
- Check browser allows autoplay
- Verify audio files exist in `public/` directory
- Check `AlertSound` component is mounted
- Verify `shouldPlayAlertSound` state is true

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('debug', 'true');
```

### Performance Issues

If experiencing performance issues:

1. **Limit Alert History**: Alerts are limited to last 200 alerts
2. **Optimize Firebase Queries**: Use specific node subscriptions when possible
3. **Cache AI Results**: AI analysis results can be cached
4. **Debounce Updates**: Rapid Firebase updates are debounced

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code style (ESLint)
- Write descriptive commit messages
- Add comments for complex logic
- Test changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI analysis capabilities
- **Firebase** - For real-time database infrastructure
- **shadcn/ui** - For beautiful UI components
- **Leaflet** - For interactive mapping
- **React Community** - For excellent tools and libraries

---

## 📞 Support

For issues, questions, or contributions:

- **Issues**: Open an issue on GitHub
- **Documentation**: Check `AI_SETUP.md` for AI configuration
- **Firebase Docs**: [Firebase Documentation](https://firebase.google.com/docs)
- **Gemini AI Docs**: [Google AI Studio](https://makersuite.google.com/)

---

<div align="center">

**Built with ❤️ for security and defense applications**

[⬆ Back to Top](#-chakravyuh---ai-powered-ground-control-station)

</div>
