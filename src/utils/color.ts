import { parseHex } from './validation';

/**
 * Parse and validate color values
 */
export function parseColor(color: string): string {
	return parseHex(color);
}

// Re-export for compatibility
export { parseHex } from './validation';
