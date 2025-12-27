import type { ProfileOptions, WelcomeOptions } from '../types';

/**
 * Canvas dimension configuration with scaling
 */
export interface CanvasDimensions {
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
}

/**
 * Simple canvas dimension configuration
 */
export interface SimpleCanvasDimensions {
	width: number;
	height: number;
}

/**
 * Get canvas dimensions for profile cards
 */
export function getCanvasDimensions(
	options?: ProfileOptions & {
		_canvasWidth?: number;
		_canvasHeight?: number;
		_scaleX?: number;
		_scaleY?: number;
	},
): CanvasDimensions {
	const width = options?._canvasWidth ?? 1024;
	const height = options?._canvasHeight ?? 500;
	const scaleX = options?._scaleX ?? 1;
	const scaleY = options?._scaleY ?? 1;
	return { width, height, scaleX, scaleY };
}

/**
 * Get canvas dimensions for welcome banners
 */
export function getWelcomeCanvasDimensions(
	options?: WelcomeOptions,
): SimpleCanvasDimensions {
	const width = options?.customWidth ?? 1024;
	const height = options?.customHeight ?? 500;
	return { width, height };
}
