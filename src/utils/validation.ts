import { KythiaArtsError } from '../errors/index';

/**
 * Validate and parse image file paths/URLs
 * Accepts: png, jpg, jpeg, gif
 */
export function parseImg(imgString: string): string {
	if (!imgString || typeof imgString !== 'string') {
		throw new KythiaArtsError(
			`Invalid custom badge ('${imgString || undefined}') must be an image file 'png | jpg | jpeg | gif'`,
		);
	}
	const URL = imgString.split('.');
	const imgType = URL[URL.length - 1];
	const imgCheck = /(jpg|jpeg|png|gif)/gi.test(imgType ?? '');

	if (!imgCheck) {
		throw new KythiaArtsError(
			`Invalid customBackground ('${imgString || undefined}') must be an image file 'png | jpg | jpeg | gif'`,
		);
	}

	return imgString;
}

/**
 * Validate and parse PNG file paths/URLs
 * Only accepts: png
 */
export function parsePng(imgString: string): string {
	if (!imgString || typeof imgString !== 'string') {
		throw new KythiaArtsError(
			`Invalid custom badge ('${imgString || undefined}') must be a png file`,
		);
	}
	const URL = imgString.split('.');
	const imgType = URL[URL.length - 1];
	const imgCheck = /(png)/gi.test(imgType ?? '');

	if (!imgCheck) {
		throw new KythiaArtsError(
			`Invalid custom badge ('${imgString || undefined}') must be a png file`,
		);
	}

	return imgString;
}

/**
 * Validate and parse HEX color codes
 * Accepts: #RRGGBB or RRGGBB format
 */
export function parseHex(hexString: string): string {
	const hexRegex = new RegExp(/^(#)?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/);

	if (!hexRegex.test(hexString)) {
		throw new KythiaArtsError(`Invalid Hex Code ('${hexString || undefined}')`);
	}

	let normalizedHex = hexString;
	if (!hexString.includes('#') && !hexString.startsWith('#')) {
		normalizedHex = `#${hexString}`;
	}

	return normalizedHex;
}

/**
 * Validate that a parameter is a string
 */
export function isString(param: unknown, type: string): string {
	if (typeof param !== 'string') {
		throw new KythiaArtsError(
			`Invalid ${type} (${param || undefined}), must be a string`,
		);
	}

	return param;
}

/**
 * Validate that a parameter is a number
 */
export function isNumber(param: unknown, type: string): number {
	if (typeof param !== 'number' || Number.isNaN(param)) {
		throw new KythiaArtsError(
			`Invalid ${type} (${param || undefined}), must be a number`,
		);
	}

	return param;
}
