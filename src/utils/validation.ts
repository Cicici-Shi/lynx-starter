// Custom validation utilities to replace Zod
// Compatible with Lynx runtime environment (no BigInt dependency)

export interface AISearchResult {
  searchTerm?: string | null;
  dateRange?: {
    start: string;
    end: string;
  } | null;
  status?: 'completed' | 'pending' | 'failed' | null;
  type?: 'sales' | 'analytics' | 'user' | null;
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

export function isValidStatus(
  value: unknown,
): value is 'completed' | 'pending' | 'failed' {
  return value === 'completed' || value === 'pending' || value === 'failed';
}

export function isValidOptionalStatus(
  value: unknown,
): value is 'completed' | 'pending' | 'failed' | undefined | null {
  return value === undefined || value === null || isValidStatus(value);
}

export function isValidType(
  value: unknown,
): value is 'sales' | 'analytics' | 'user' {
  return value === 'sales' || value === 'analytics' || value === 'user';
}

export function isValidOptionalType(
  value: unknown,
): value is 'sales' | 'analytics' | 'user' | undefined | null {
  return value === undefined || value === null || isValidType(value);
}

// Simple helper to handle searchTerms array -> searchTerm string
function normalizeSearchTerm(searchTerm: unknown, searchTerms: unknown): string | undefined {
  if (typeof searchTerm === 'string') return searchTerm;
  if (Array.isArray(searchTerms)) {
    const parts = (searchTerms as unknown[]).filter((x) => typeof x === 'string') as string[];
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
  const normalizedSearchTerm = normalizeSearchTerm(obj.searchTerm, (obj as any).searchTerms);
  if (normalizedSearchTerm !== undefined && normalizedSearchTerm !== null) {
    if (!isValidOptionalString(normalizedSearchTerm)) {
      throw new Error('Invalid searchTerm: must be a string, null, or undefined');
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

  // Validate status (let AI handle normalization)
  if (obj.status !== undefined) {
    if (!isValidOptionalStatus(obj.status)) {
      throw new Error(
        "Invalid status: must be 'completed', 'pending', 'failed', or undefined",
      );
    }
    result.status = obj.status;
  }

  // Validate type (let AI handle normalization)
  if (obj.type !== undefined) {
    if (!isValidOptionalType(obj.type)) {
      throw new Error(
        "Invalid type: must be 'sales', 'analytics', 'user', or undefined",
      );
    }
    result.type = obj.type;
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
