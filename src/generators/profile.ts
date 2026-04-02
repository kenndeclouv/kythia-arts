import { genPng } from '../composers/profile';
import { KythiaArtsError } from '../errors';
import { fetchUserData as fetchFromDiscord } from '../services/discord-api';
import type { ProfileOptions } from '../types';

/**
 * Generate a Discord profile card image
 * @param userId - Discord user ID
 * @param options - Profile customization options
 * @returns PNG buffer of the profile card
 */
export async function profileImage(
	userId: string,
	options: ProfileOptions,
): Promise<Buffer> {
	if (!userId || typeof userId !== 'string') {
		throw new KythiaArtsError(
			`TypeError: Invalid argument for profileImage()\nExpected string userId, got ${typeof userId === 'undefined' || !userId ? 'undefined' : typeof userId}`,
		);
	}

	if (!options.botToken) {
		throw new KythiaArtsError(
			'A bot token is required. Pass it via options.botToken.',
		);
	}

	try {
		const data = await fetchFromDiscord(userId, options.botToken);

		const buffer = await genPng(data, options);
		return buffer;
	} catch (error) {
		if (error instanceof Error) {
			const msg = error.message.toLowerCase();
			if (
				msg.includes('source rejected') ||
				msg.includes('503') ||
				msg.includes('502') ||
				msg.includes('504') ||
				msg.includes('failed to load')
			) {
				throw new KythiaArtsError('Error loading user assets, try again later');
			}
			throw new KythiaArtsError(error.message);
		}
		throw new KythiaArtsError('Unknown error occurred');
	}
}

export default profileImage;
