// Custom validation utilities to replace Zod
// Compatible with Lynx runtime environment (no BigInt dependency)

export interface AISearchResult {
  searchTerm?: string | null;
  dateRange?: {
    start: string;
    end: string;
  } | null;
  weekend?: 'weekend' | 'weekday' | null;
  duration?: 'short' | 'medium' | 'long' | null;
}

// Validation functions
export function isValidString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isValidOptionalString(
  value: unknown,
): value is string | undefined | null {
  return value === undefined || value === null || typeof value === 'string';
}

export function isValidDateRange(
  value: unknown,
): value is { start: string; end: string } {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return isValidString(obj.start) && isValidString(obj.end);
}

export function isValidOptionalDateRange(
  value: unknown,
): value is { start: string; end: string } | undefined | null {
  return value === undefined || value === null || isValidDateRange(value);
}

export function isValidWeekend(
  value: unknown,
): value is 'weekend' | 'weekday' {
  return value === 'weekend' || value === 'weekday';
}

export function isValidOptionalWeekend(
  value: unknown,
): value is 'weekend' | 'weekday' | undefined | null {
  return value === undefined || value === null || isValidWeekend(value);
}

export function isValidDuration(
  value: unknown,
): value is 'short' | 'medium' | 'long' {
  return value === 'short' || value === 'medium' || value === 'long';
}

export function isValidOptionalDuration(
  value: unknown,
): value is 'short' | 'medium' | 'long' | undefined | null {
  return value === undefined || value === null || isValidDuration(value);
}

// Simple helper to handle searchTerms array -> searchTerm string
function normalizeSearchTerm(
  searchTerm: unknown,
  searchTerms: unknown,
): string | undefined {
  if (typeof searchTerm === 'string') return searchTerm;
  if (Array.isArray(searchTerms)) {
    const parts = (searchTerms as unknown[]).filter(
      (x) => typeof x === 'string',
    ) as string[];
    const joined = parts.join(' ').trim();
    return joined.length > 0 ? joined : undefined;
  }
  if (typeof searchTerms === 'string') return searchTerms;
  return undefined;
}

// Main validation function for AI search results
export function validateAISearchResult(data: unknown): AISearchResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI search result: must be an object');
  }

  const obj = data as Record<string, unknown>;
  const result: AISearchResult = {};

  // Handle searchTerm (support searchTerms as array/string for backward compatibility)
  const normalizedSearchTerm = normalizeSearchTerm(
    obj.searchTerm,
    (obj as any).searchTerms,
  );
  if (normalizedSearchTerm !== undefined && normalizedSearchTerm !== null) {
    if (!isValidOptionalString(normalizedSearchTerm)) {
      throw new Error(
        'Invalid searchTerm: must be a string, null, or undefined',
      );
    }
    result.searchTerm = normalizedSearchTerm;
  }

  // Validate dateRange
  if (obj.dateRange !== undefined) {
    if (!isValidOptionalDateRange(obj.dateRange)) {
      throw new Error(
        'Invalid dateRange: must have start and end string properties or be undefined',
      );
    }
    result.dateRange = obj.dateRange;
  }

  // Validate weekend (let AI handle normalization)
  if (obj.weekend !== undefined) {
    if (!isValidOptionalWeekend(obj.weekend)) {
      throw new Error(
        "Invalid weekend: must be 'weekend', 'weekday', or undefined",
      );
    }
    result.weekend = obj.weekend;
  }

  // Validate duration (let AI handle normalization)
  if (obj.duration !== undefined) {
    if (!isValidOptionalDuration(obj.duration)) {
      throw new Error(
        "Invalid duration: must be 'short', 'medium', 'long', or undefined",
      );
    }
    result.duration = obj.duration;
  }

  return result;
}

// Helper function to safely parse AI response
export function parseAISearchResult(data: unknown): AISearchResult {
  try {
    return validateAISearchResult(data);
  } catch (error) {
    console.error('AI search result validation failed:', error);
    // Return empty result on validation failure
    return {};
  }
}
