# AI-Driven Livestream Analytics Platform

A cross-platform intelligent livestream analytics platform built with Lynx framework, featuring AI-native interactions and natural language data querying capabilities.

## Project Overview

This project demonstrates the future of AI-driven user interfaces by combining Lynx's cross-platform capabilities with advanced AI services. The platform provides intelligent livestream analytics through natural language interactions, enabling creators to analyze their performance and revenue distribution with conversational AI assistance.

## Key Features

### 1. **AI-Native Interaction Design**
- Natural language queries for livestream data analysis
- Intelligent intent understanding without complex query syntax
- Streaming response rendering for real-time AI analysis display
- Open input + Filters pattern for redefining data query interactions

### 2. **Cross-Platform Technology Stack**
- Single codebase supporting iOS, Android, and Web platforms
- Native-level performance with familiar Web development experience
- Seamless state synchronization across devices
- Built with Lynx framework - TikTok's open-source cross-platform UI technology

### 3. **Intelligent Data Filtering System**
- Natural language to structured query conversion
- AI-powered filter logic generation
- Real-time data visualization and analysis

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.0
- Lynx Explorer App (for mobile testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lynx-starter
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure AI services (optional):
```bash
cp src/config/local.example.ts src/config/local.ts
```

Edit `src/config/local.ts` and add your OpenAI API key:
```typescript
export const LOCAL_CONFIG = {
  AI_API_KEY: 'your-openai-api-key',
  AI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
  AI_MODEL: 'gpt-4o-mini'
};
```

### Development

#### Mobile Development
```bash
pnpm run dev
```

Scan the QR code displayed in the terminal with your Lynx Explorer App to preview on mobile devices.

#### Web Development
```bash
# Build the Lynx application
pnpm run build

# Start the web project (in sibling directory)
cd ../web-project
pnpm run dev
```

Access the application at http://localhost:3000

## Core Functionality

### Intelligent Chatbot Interface

The platform features an AI-powered chatbot that understands natural language queries about livestream performance:

**Example Interaction:**
```
User: "Please analyze my recent livestream performance and provide reasonable revenue distribution suggestions"

AI: [Real-time analysis in progress...]
    📊 Livestream Performance Analysis
    - Average viewing duration: 2.5 hours
    - Audience engagement rate: 15.3%
    - Gift revenue trend: +20% increase
    
    💰 Revenue Distribution Recommendations
    - Creator share: 70% (recommended)
    - Platform share: 20%
    - Operational costs: 10%
    
    📈 Improvement Suggestions
    - Increase interactive segments to boost audience engagement
    - Optimize streaming schedule for peak audience activity
```

### Natural Language Data Filtering

The intelligent filtering system converts natural language into structured queries:

**Example Query:**
```
User: "Show only records from first half of 2025 with livestream duration over 2 hours"

System: [Converting to filter logic...]
        ✅ Time range: 2025-01-01 to 2025-06-30
        ✅ Duration: > 120 minutes
        📋 Filtered results: 15 records
        
        Displayed results:
        - Stream-001: 2025-01-15, 2h 30m, ¥1,200
        - Stream-002: 2025-02-03, 2h 45m, ¥1,500
        ...
```

## Technical Architecture

### Core Technology Stack

- **UI Framework**: Lynx - TikTok's cross-platform UI technology
- **Frontend**: React 18 + TypeScript
- **AI Services**: OpenAI GPT-4 + custom tool calling
- **Build Tools**: Rspeedy + Biome
- **Testing**: Vitest + Testing Library

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   AI Service    │
│   (iOS/Android) │    │   (React)       │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Lynx Runtime  │
                    │  (Cross-Platform)│
                    └─────────────────┘
```

### Key Technical Features

- **Modular Design**: Clear component separation and service layer abstraction
- **Type Safety**: Complete TypeScript type definitions
- **Test Coverage**: Unit and integration tests for core functionality
- **Performance Optimization**: Streaming rendering, state management, cross-platform optimization

## Project Structure

```
src/
├── components/              # Reusable components
│   ├── ChatInterface.tsx    # Chat interface
│   ├── LivestreamRecords.tsx # Livestream records
│   └── RevenueDetails.tsx   # Revenue details
├── pages/                   # Page components
│   ├── LivestreamChatbotPage.tsx # Intelligent chat page
│   └── ReportsPage.tsx      # Data reports page
├── services/                # Service layer
│   └── aiService.ts         # AI services
├── types/                   # Type definitions
└── utils/                   # Utility functions
```

## Development Guidelines

### Adding New Features

1. Define types in `src/types/`
2. Implement business logic in `src/services/`
3. Create UI components in `src/components/`
4. Integrate pages in `src/pages/`

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with watch mode
pnpm test --watch
```

## Evaluation Criteria Alignment

### Completeness & Execution
- Complete prototype with intelligent chat, data filtering, and cross-platform functionality
- Core AI-driven data analysis and natural language interaction
- Smooth user experience with intuitive operation interface

### Technical Quality
- Engineering best practices with TypeScript, modular architecture, and test coverage
- Technology selection with Lynx framework, React, and modern build tools
- Performance optimization with streaming rendering, state management, and cross-platform optimization

### Innovation & Creativity
- AI-native design redefining data query interaction methods
- Cross-platform innovation with single codebase for three platforms
- UX pattern innovation with Open input + Filters interaction paradigm

### Problem Fit & Value
- Solves complexity and efficiency issues in livestream data analysis
- Reduces data analysis barriers and improves decision-making efficiency
- Provides intelligent revenue management tools for content creators

### Impact Potential
- Extensible to other content creation domains
- Promotes AI-era UI/UX design paradigms
- Contributes innovative cases to the Lynx ecosystem

## Configuration

### Environment Variables

- `AI_API_KEY`: Your OpenAI API key for AI services
- `AI_ENDPOINT`: OpenAI API endpoint (default: https://api.openai.com/v1/chat/completions)
- `AI_MODEL`: AI model to use (default: gpt-4o-mini)

### Model Configuration

The AI model is configured for:
- Base model: GPT-4o-mini
- Tool calling: Custom revenue analysis tools
- Response format: Structured JSON with natural language analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0.

## Acknowledgments

- [Lynx Framework](https://github.com/lynx-js/lynx) - Cross-platform UI technology
- [OpenAI](https://openai.com/) - AI capabilities support
- [React](https://reactjs.org/) - Frontend development framework


## Feature Highlights

- **AI-Native Interaction**: Redefines how users interact with data through natural language
- **Cross-Platform Excellence**: Single codebase supporting iOS, Android, and Web with native performance
- **Modern UI/UX Patterns**: Implements emerging AI-era interaction paradigms
- **Production Ready**: Complete API integration with comprehensive testing and documentation
- **Scalable Architecture**: Modular design supporting future feature expansion
