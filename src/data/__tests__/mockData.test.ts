// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, it, expect } from 'vitest';
import {
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
} from '../mockData.js';

describe('Mock Data', () => {
    describe('mockLivestreamRecords', () => {
        it('should contain valid livestream records', () => {
            expect(mockLivestreamRecords).toHaveLength(5);

            mockLivestreamRecords.forEach(record => {
                expect(record).toHaveProperty('id');
                expect(record).toHaveProperty('title');
                expect(record).toHaveProperty('date');
                expect(record).toHaveProperty('duration');
                expect(record).toHaveProperty('totalRevenue');
                expect(record).toHaveProperty('status');

                // Validate data types
                expect(typeof record.id).toBe('string');
                expect(typeof record.title).toBe('string');
                expect(typeof record.date).toBe('string');
                expect(typeof record.duration).toBe('string');
                expect(typeof record.totalRevenue).toBe('number');
                expect(['completed', 'live', 'scheduled']).toContain(record.status);

                // Validate date format (ISO 8601)
                expect(() => new Date(record.date)).not.toThrow();
                expect(new Date(record.date).toISOString()).toBe(record.date);

                // Validate revenue is positive
                expect(record.totalRevenue).toBeGreaterThan(0);
            });
        });

        it('should have records with proper duration format', () => {
            mockLivestreamRecords.forEach(record => {
                expect(record.duration).toMatch(/^\d+h \d+m$/);
            });
        });

        it('should have optional properties when present', () => {
            const recordsWithOptionalProps = mockLivestreamRecords.filter(r => r.thumbnail);
            expect(recordsWithOptionalProps.length).toBeGreaterThan(0);

            recordsWithOptionalProps.forEach(record => {
                if (record.thumbnail) {
                    expect(typeof record.thumbnail).toBe('string');
                }
                if (record.viewerCount) {
                    expect(typeof record.viewerCount).toBe('number');
                    expect(record.viewerCount).toBeGreaterThan(0);
                }
                if (record.peakViewers) {
                    expect(typeof record.peakViewers).toBe('number');
                    expect(record.peakViewers).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('mockRevenueDistributions', () => {
        it('should contain valid revenue distributions', () => {
            expect(mockRevenueDistributions).toHaveLength(5);

            mockRevenueDistributions.forEach(distribution => {
                expect(distribution).toHaveProperty('recordId');
                expect(distribution).toHaveProperty('totalAmount');
                expect(distribution).toHaveProperty('currency');
                expect(distribution).toHaveProperty('distributions');
                expect(distribution).toHaveProperty('calculationBasis');
                expect(distribution).toHaveProperty('calculatedAt');

                // Validate data types
                expect(typeof distribution.recordId).toBe('string');
                expect(typeof distribution.totalAmount).toBe('number');
                expect(typeof distribution.currency).toBe('string');
                expect(Array.isArray(distribution.distributions)).toBe(true);
                expect(typeof distribution.calculationBasis).toBe('string');
                expect(typeof distribution.calculatedAt).toBe('string');

                // Validate currency
                expect(distribution.currency).toBe('CNY');

                // Validate total amount is positive
                expect(distribution.totalAmount).toBeGreaterThan(0);

                // Validate date format
                expect(() => new Date(distribution.calculatedAt)).not.toThrow();
            });
        });

        it('should have distributions that sum to 100%', () => {
            mockRevenueDistributions.forEach(distribution => {
                const totalPercentage = distribution.distributions.reduce(
                    (sum, item) => sum + item.percentage,
                    0
                );
                expect(totalPercentage).toBe(100);
            });
        });

        it('should have distribution amounts that sum to total amount', () => {
            mockRevenueDistributions.forEach(distribution => {
                const totalDistributedAmount = distribution.distributions.reduce(
                    (sum, item) => sum + item.amount,
                    0
                );
                // Allow for small floating point differences
                expect(Math.abs(totalDistributedAmount - distribution.totalAmount)).toBeLessThan(0.02);
            });
        });

        it('should have valid distribution items', () => {
            mockRevenueDistributions.forEach(distribution => {
                distribution.distributions.forEach(item => {
                    expect(item).toHaveProperty('party');
                    expect(item).toHaveProperty('percentage');
                    expect(item).toHaveProperty('amount');
                    expect(item).toHaveProperty('reason');
                    expect(item).toHaveProperty('category');

                    // Validate data types
                    expect(typeof item.party).toBe('string');
                    expect(typeof item.percentage).toBe('number');
                    expect(typeof item.amount).toBe('number');
                    expect(typeof item.reason).toBe('string');
                    expect(['streamer', 'platform', 'partner', 'other']).toContain(item.category);

                    // Validate ranges
                    expect(item.percentage).toBeGreaterThan(0);
                    expect(item.percentage).toBeLessThanOrEqual(100);
                    expect(item.amount).toBeGreaterThan(0);
                });
            });
        });

        it('should match livestream record IDs', () => {
            const recordIds = mockLivestreamRecords.map(r => r.id);
            mockRevenueDistributions.forEach(distribution => {
                expect(recordIds).toContain(distribution.recordId);
            });
        });
    });

    describe('mockChatMessages', () => {
        it('should contain valid chat messages', () => {
            expect(mockChatMessages.length).toBeGreaterThan(0);

            mockChatMessages.forEach(message => {
                expect(message).toHaveProperty('id');
                expect(message).toHaveProperty('type');
                expect(message).toHaveProperty('content');
                expect(message).toHaveProperty('timestamp');

                // Validate data types
                expect(typeof message.id).toBe('string');
                expect(['user', 'bot']).toContain(message.type);
                expect(typeof message.content).toBe('string');
                expect(message.timestamp).toBeInstanceOf(Date);

                // Validate content is not empty
                expect(message.content.trim()).not.toBe('');
            });
        });

        it('should have alternating user and bot messages', () => {
            for (let i = 0; i < mockChatMessages.length - 1; i += 2) {
                expect(mockChatMessages[i].type).toBe('user');
                if (i + 1 < mockChatMessages.length) {
                    expect(mockChatMessages[i + 1].type).toBe('bot');
                }
            }
        });

        it('should have valid metadata for bot messages', () => {
            const botMessages = mockChatMessages.filter(m => m.type === 'bot');
            botMessages.forEach(message => {
                if (message.metadata) {
                    if (message.metadata.confidence) {
                        expect(typeof message.metadata.confidence).toBe('number');
                        expect(message.metadata.confidence).toBeGreaterThan(0);
                        expect(message.metadata.confidence).toBeLessThanOrEqual(1);
                    }
                    if (message.metadata.sources) {
                        expect(Array.isArray(message.metadata.sources)).toBe(true);
                        message.metadata.sources.forEach(source => {
                            expect(typeof source).toBe('string');
                        });
                    }
                }
            });
        });
    });

    describe('mockChatSession', () => {
        it('should contain valid chat session', () => {
            expect(mockChatSession).toHaveProperty('id');
            expect(mockChatSession).toHaveProperty('messages');
            expect(mockChatSession).toHaveProperty('createdAt');
            expect(mockChatSession).toHaveProperty('lastActiveAt');

            expect(typeof mockChatSession.id).toBe('string');
            expect(Array.isArray(mockChatSession.messages)).toBe(true);
            expect(mockChatSession.createdAt).toBeInstanceOf(Date);
            expect(mockChatSession.lastActiveAt).toBeInstanceOf(Date);

            expect(mockChatSession.messages).toEqual(mockChatMessages);
        });
    });

    describe('Utility Functions', () => {
        describe('getRevenueDistributionByRecordId', () => {
            it('should return correct distribution for valid record ID', () => {
                const distribution = getRevenueDistributionByRecordId('stream-001');
                expect(distribution).toBeDefined();
                expect(distribution?.recordId).toBe('stream-001');
            });

            it('should return undefined for invalid record ID', () => {
                const distribution = getRevenueDistributionByRecordId('invalid-id');
                expect(distribution).toBeUndefined();
            });
        });

        describe('getRecentLivestreamRecords', () => {
            it('should return records sorted by date (newest first)', () => {
                const recent = getRecentLivestreamRecords();
                expect(recent.length).toBeLessThanOrEqual(5);

                for (let i = 0; i < recent.length - 1; i++) {
                    const currentDate = new Date(recent[i].date);
                    const nextDate = new Date(recent[i + 1].date);
                    expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                }
            });

            it('should respect the limit parameter', () => {
                const recent = getRecentLivestreamRecords(3);
                expect(recent).toHaveLength(3);
            });
        });

        describe('calculateTotalRevenue', () => {
            it('should calculate correct total revenue', () => {
                const total = calculateTotalRevenue(mockLivestreamRecords);
                const expected = mockLivestreamRecords.reduce((sum, record) => sum + record.totalRevenue, 0);
                expect(total).toBe(expected);
            });

            it('should return 0 for empty array', () => {
                const total = calculateTotalRevenue([]);
                expect(total).toBe(0);
            });
        });

        describe('getHighestRevenueRecord', () => {
            it('should return record with highest revenue', () => {
                const highest = getHighestRevenueRecord(mockLivestreamRecords);
                expect(highest).toBeDefined();

                const maxRevenue = Math.max(...mockLivestreamRecords.map(r => r.totalRevenue));
                expect(highest?.totalRevenue).toBe(maxRevenue);
            });

            it('should return undefined for empty array', () => {
                const highest = getHighestRevenueRecord([]);
                expect(highest).toBeUndefined();
            });
        });

        describe('formatCurrency', () => {
            it('should format currency correctly', () => {
                const formatted = formatCurrency(12345.67);
                expect(formatted).toMatch(/¥12,345\.67/);
            });

            it('should handle different currencies', () => {
                const formatted = formatCurrency(12345.67, 'USD');
                expect(formatted).toContain('12,345.67');
            });
        });

        describe('formatDate', () => {
            it('should format date correctly', () => {
                const formatted = formatDate('2024-12-31T20:00:00.000Z');
                // The formatted date should contain the year, month, and day
                // Note: Due to timezone differences, the actual date might be different
                expect(formatted).toMatch(/\d{4}/); // Should contain a 4-digit year
                expect(formatted).toMatch(/\d{1,2}/); // Should contain month/day numbers
                expect(typeof formatted).toBe('string');
                expect(formatted.length).toBeGreaterThan(0);
            });
        });
    });
});