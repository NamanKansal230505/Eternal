# AI Intelligence Features Setup Guide

This guide will help you set up the Google Gemini AI integration for the Chakravyuh Dashboard.

## Features

The AI Intelligence tab includes:

1. **Threat Intelligence** - Analyzes multiple alerts and provides comprehensive threat assessment
2. **Alert Analysis** - AI-enhanced alert summaries and pattern analysis
3. **Decision Support** - Real-time recommendations based on current situation
4. **Intelligence Report Generator** - Automated daily/weekly security reports

## Setup Instructions

### Step 1: Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure Environment Variable

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add your API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Replace `your_actual_api_key_here` with your actual API key

### Step 3: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

### Step 4: Access AI Intelligence Tab

1. Navigate to the dashboard at `http://localhost:8080/dashboard`
2. Click the "AI Intelligence" button in the header
3. Or directly navigate to `http://localhost:8080/ai-intelligence`

## Usage

### Threat Intelligence

- Automatically analyzes recent alerts (last 30 minutes)
- Provides threat level assessment (low/medium/high/critical)
- Shows pattern analysis and correlated alerts
- Gives actionable recommendations
- Click "Analyze" to refresh the assessment

### Alert Analysis

- View AI-enhanced summaries for each alert
- See alert type distribution and statistics
- Analyze patterns across alerts
- Click "Enhance" to generate AI summaries
- Click "Patterns" to analyze alert trends

### Decision Support

- Real-time tactical recommendations
- System status overview
- Resource availability tracking
- Click "Refresh" to get updated recommendations

### Intelligence Report Generator

- Generate comprehensive security reports
- Includes executive summary, threat assessment, and recommendations
- Download reports as text files
- Click "Generate Report" to create a new report

## API Configuration Status

The dashboard will show a warning banner if the Gemini API key is not configured. All AI features will still be accessible but will show fallback messages.

## Troubleshooting

### API Key Not Working

1. Verify the API key is correct in `.env`
2. Check that the variable name is exactly `VITE_GEMINI_API_KEY`
3. Restart the development server after changing `.env`
4. Check browser console for error messages

### Rate Limiting

Google Gemini API has rate limits. If you encounter rate limit errors:
- Wait a few moments before retrying
- Consider implementing caching for frequently accessed data
- Monitor your API usage in Google AI Studio

### API Errors

If you see "Analysis unavailable" messages:
- Check your internet connection
- Verify the API key is valid
- Check Google AI Studio for service status
- Review browser console for detailed error messages

## Security Notes

- API keys are client-side in this implementation
- For production, consider using a backend proxy to hide API keys
- Never expose API keys in client-side code for production applications
- Implement proper authentication and authorization

## Cost Considerations

- Google Gemini API has free tier limits
- Monitor usage in Google AI Studio
- Consider implementing request throttling for production
- Cache results when possible to reduce API calls

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API key configuration
3. Review Google Gemini API documentation
4. Check network connectivity

