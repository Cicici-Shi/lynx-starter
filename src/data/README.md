# Mock Data for Livestream Revenue Chatbot

This directory contains mock data and utility functions for the livestream revenue chatbot application.

## Overview

The mock data provides realistic sample data for development and testing purposes, including:

- **Livestream Records**: Sample livestream sessions with metadata
- **Revenue Distributions**: Detailed revenue sharing information for each livestream
- **Chat Messages**: Sample conversation data for testing the chat interface
- **Utility Functions**: Helper functions for data manipulation and formatting

## Data Structure

### Livestream Records

Each livestream record contains:

- `id`: Unique identifier
- `title`: Livestream title
- `date`: ISO 8601 formatted date
- `duration`: Human-readable duration (e.g., "2h 30m")
- `totalRevenue`: Total revenue amount
- `status`: Current status (completed, live, scheduled)
- `thumbnail`: Optional thumbnail image path
- `viewerCount`: Optional total viewer count
- `peakViewers`: Optional peak concurrent viewers

### Revenue Distributions

Each revenue distribution contains:

- `recordId`: Associated livestream record ID
- `totalAmount`: Total revenue amount
- `currency`: Currency code (default: "CNY")
- `distributions`: Array of distribution items
- `calculationBasis`: Explanation of calculation method
- `calculatedAt`: ISO 8601 formatted calculation timestamp

### Distribution Items

Each distribution item contains:

- `party`: Name of the receiving party
- `percentage`: Percentage of total revenue (0-100)
- `amount`: Actual amount received
- `reason`: Explanation for this allocation
- `category`: Type of party (streamer, platform, partner, other)

## Usage

### Basic Import

```typescript
import {
  mockLivestreamRecords,
  mockRevenueDistributions,
  mockChatMessages,
} from "../data";
```

### Utility Functions

```typescript
import {
  getRecentLivestreamRecords,
  getRevenueDistributionByRecordId,
  calculateTotalRevenue,
  formatCurrency,
  formatDate,
} from "../data";

// Get the 3 most recent livestreams
const recentStreams = getRecentLivestreamRecords(3);

// Get revenue distribution for a specific stream
const distribution = getRevenueDistributionByRecordId("stream-001");

// Calculate total revenue across all streams
const totalRevenue = calculateTotalRevenue(mockLivestreamRecords);

// Format currency for display
const formattedAmount = formatCurrency(12345.67); // "¥12,345.67"

// Format date for display
const formattedDate = formatDate("2024-12-31T20:00:00.000Z");
```

## Data Validation

All mock data is validated through comprehensive tests that ensure:

- Data structure integrity
- Proper data types
- Revenue distribution accuracy (percentages sum to 100%, amounts match totals)
- Date format compliance
- Required field presence
- Relationship consistency between records and distributions

## Requirements Coverage

This mock data satisfies the following requirements:

- **Requirement 1.1**: Provides sample livestream records for display
- **Requirement 1.4**: Includes empty state handling scenarios
- **Requirement 2.1**: Contains detailed revenue distribution data with explanations

## Testing

Run the mock data tests with:

```bash
pnpm test src/data/__tests__/mockData.test.ts --run
```

The test suite covers:

- Data structure validation
- Business logic verification
- Utility function correctness
- Edge case handling
