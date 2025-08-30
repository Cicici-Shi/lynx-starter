// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Mock data exports for the livestream revenue chatbot
 * This module provides sample data for development and testing
 */

export {
    mockLivestreamRecords,
    mockRevenueDistributions,
    mockChatMessages,
    mockChatSession,
    getRevenueDistributionByRecordId,
    getRecentLivestreamRecords,
    calculateTotalRevenue,
    getHighestRevenueRecord,
    formatCurrency,
    formatDate,
} from './mockData.js';

// Re-export types for convenience
export type {
    LivestreamRecord,
    RevenueDistribution,
    DistributionItem,
    ChatMessage,
    ChatSession,
    ErrorState,
} from '../types/chatbot.js';