// Custom validation utilities to replace Zod
// Compatible with Lynx runtime environment (no BigInt dependency)

export interface AISearchResult {
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: 'completed' | 'pending' | 'failed';
  type?: 'sales' | 'analytics' | 'user';
}

// Validation functions
export function isValidString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isValidOptionalString(
  value: unknown,
): value is string | undefined {
  return value === undefined || typeof value === 'string';
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
): value is { start: string; end: string } | undefined {
  return value === undefined || isValidDateRange(value);
}

export function isValidStatus(
  value: unknown,
): value is 'completed' | 'pending' | 'failed' {
  return value === 'completed' || value === 'pending' || value === 'failed';
}

export function isValidOptionalStatus(
  value: unknown,
): value is 'completed' | 'pending' | 'failed' | undefined {
  return value === undefined || isValidStatus(value);
}

export function isValidType(
  value: unknown,
): value is 'sales' | 'analytics' | 'user' {
  return value === 'sales' || value === 'analytics' || value === 'user';
}

export function isValidOptionalType(
  value: unknown,
): value is 'sales' | 'analytics' | 'user' | undefined {
  return value === undefined || isValidType(value);
}

// Main validation function for AI search results
export function validateAISearchResult(data: unknown): AISearchResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI search result: must be an object');
  }

  const obj = data as Record<string, unknown>;
  const result: AISearchResult = {};

  // Validate searchTerm
  if (obj.searchTerm !== undefined) {
    if (!isValidOptionalString(obj.searchTerm)) {
      throw new Error('Invalid searchTerm: must be a string or undefined');
    }
    result.searchTerm = obj.searchTerm;
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

  // Validate status
  if (obj.status !== undefined) {
    if (!isValidOptionalStatus(obj.status)) {
      throw new Error(
        "Invalid status: must be 'completed', 'pending', 'failed', or undefined",
      );
    }
    result.status = obj.status;
  }

  // Validate type
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
