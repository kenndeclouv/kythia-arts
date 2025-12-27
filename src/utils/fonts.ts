import fs from 'node:fs';
import path from 'node:path';
import { GlobalFonts } from '@napi-rs/canvas';
import { KythiaArtsError } from '../errors';

/**
 * Register a single font file
 * @param fontPath - Absolute path to the font file
 * @param family - Font family name (alias)
 * @returns true if successful
 */
export function registerFont(fontPath: string, family: string): boolean {
	if (!fs.existsSync(fontPath)) {
		throw new KythiaArtsError(`Font file not found: ${fontPath}`);
	}

	try {
		return GlobalFonts.registerFromPath(fontPath, family);
	} catch (error) {
		throw new KythiaArtsError(
			`Failed to register font: ${(error as Error).message}`,
		);
	}
}

/**
 * Load and register all fonts from a directory
 * Files will be registered using their filename (without extension) as the font family name.
 * Supported extensions: .ttf, .otf, .woff, .woff2
 *
 * @param directory - Directory path containing font files
 * @returns Number of fonts registered
 */
export function loadFonts(directory: string): number {
	if (!fs.existsSync(directory)) {
		// Just warn or return 0, don't throw to avoid crashing if optional folder is missing
		return 0;
	}

	const files = fs.readdirSync(directory);
	const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
	let count = 0;

	for (const file of files) {
		const ext = path.extname(file).toLowerCase();
		if (fontExtensions.includes(ext)) {
			const fontPath = path.join(directory, file);
			const family = path.basename(file, ext); // filename without extension

			try {
				registerFont(fontPath, family);
				count++;
			} catch {
				// Continue loading other fonts even if one fails
			}
		}
	}

	return count;
}
