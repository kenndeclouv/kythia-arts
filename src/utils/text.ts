import type { SKRSContext2D } from '@napi-rs/canvas';

/**
 * Result of username parsing with fitted size
 */
export interface ParsedUsername {
	username: string;
	newSize: number;
	textLength: number;
}

/**
 * Parse and fit username to canvas constraints
 * Adjusts font size and truncates text to fit within maxLength
 */
export function parseUsername(
	username: string | null | undefined,
	ctx: SKRSContext2D,
	font: string,
	size: number,
	maxLength: number,
	weight = '',
): ParsedUsername {
	const safeUsername = username?.replace(/\s/g, '') ? username : '?????';
	const usernameChars = safeUsername.split('');
	let finalUsername = '';

	let newSize = +size;
	let textLength = 0;

	let finalized = false;

	while (!finalized) {
		const editableUsername = usernameChars.join('');

		ctx.font = `${weight} ${newSize}px ${font}`.trim();
		ctx.textAlign = 'left';
		ctx.fillStyle = '#FFFFFF';

		const actualLength = ctx.measureText(editableUsername).width;

		if (actualLength >= maxLength) {
			if (newSize > 60) {
				newSize -= 1;
			} else {
				usernameChars.pop();
			}
		}

		if (actualLength <= maxLength) {
			finalUsername = usernameChars.join('');
			textLength = actualLength;
			finalized = true;
		}
	}

	return {
		username: finalUsername,
		newSize,
		textLength,
	};
}

/**
 * Takes a large number like "9360" and converts it to a small decimal like "9.3".
 * Used by `abbreviateNumber()` to form abbreviations like "9.3K".
 *
 * This method intentionally avoids number rounding, for simplicity.
 */
function getFirstDigitsAsDecimal(numString: string): string {
	const digits = ((numString.length - 1) % 3) + 1;
	if (numString.length < 4) {
		return numString;
	}

	const decimal = numString.slice(digits, digits + 1);
	return `${numString.slice(0, digits)}${
		decimal === '0' || decimal === '00' || digits === 3
			? ''
			: `.${decimal.replace(/0$/g, '')}`
	}`;
}

/**
 * Abbreviate large numbers using gaming format:
 * K - thousands
 * M - millions
 * B - billions
 * T - trillions
 *
 * Larger numbers beyond trillions follow the format:
 * AA, BB, ..., ZZ
 *
 * Supports numbers nearly up to a googol (100 zeroes), supporting up to 92 zeroes or 93 digits.
 */
export function abbreviateNumber(number: number): string {
	const numString = `${number}`;
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const abbreviations = ['', 'K', 'M', 'B', 'T'].concat(
		new Array(letters.length)
			.fill('AA')
			.map((_, i) => letters[i]?.repeat(2) ?? ''),
	);

	const selectedAbbr =
		abbreviations[Math.floor((numString.length - 1) / 3)] ?? '??';
	return `${getFirstDigitsAsDecimal(numString)}${selectedAbbr}`;
}

/**
 * Get formatted date string or custom text
 */
export function getDateOrString(
	dateInput: Date | string | null | undefined,
	createdTimestamp: string,
	localDateType = 'en',
): string {
	const dateOptions: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	};

	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

	if (typeof dateInput === 'string') {
		if (iso8601Regex.test(dateInput)) {
			const dateInstance = new Date(dateInput);
			return dateInstance.toLocaleDateString(localDateType, dateOptions);
		}
		return dateInput;
	}
	if (dateInput instanceof Date) {
		return dateInput.toLocaleDateString(localDateType, dateOptions);
	}
	if (dateInput === undefined || dateInput === null) {
		const timestamp = /^\d+$/.test(createdTimestamp)
			? +createdTimestamp
			: createdTimestamp;
		return new Date(timestamp).toLocaleDateString(localDateType, dateOptions);
	}

	return '';
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(
	text: string,
	limit = 25,
	fromEnd = false,
): string {
	if (text.length > limit) {
		if (fromEnd) {
			return `...${text.slice(-limit)}`;
		}
		return `${text.slice(0, limit)}...`;
	}
	return text;
}
