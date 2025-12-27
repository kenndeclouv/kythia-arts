/**
 * Custom error class for Kythia Arts library
 */
export class KythiaArtsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'KythiaArtsError';
		// Maintains proper stack trace for where our error was thrown
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, KythiaArtsError);
		}
	}
}

// Default export for backward compatibility
export default KythiaArtsError;
