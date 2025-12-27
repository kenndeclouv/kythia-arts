import { genPng } from '../composers/profile';
import { KythiaArtsError } from '../errors';
import { fetchUserData as fetchFromDiscord } from '../services/discord-api';
import { fetchUserData as fetchFromLanyard } from '../services/lanyard-api';
import type { ProfileOptions } from '../types';

/**
 * Generate a Discord profile card image
 * @param userId - Discord user ID
 * @param options - Profile customization options
 * @returns PNG buffer of the profile card
 */
export async function profileImage(
	userId: string,
	options: ProfileOptions = {},
): Promise<Buffer> {
	if (!userId || typeof userId !== 'string') {
		throw new KythiaArtsError(
			`TypeError: Invalid argument for profileImage()\nExpected string userId, got ${typeof userId === 'undefined' || !userId ? 'undefined' : typeof userId}`,
		);
	}

	try {
		// Choose API based on botToken presence
		const data = options.botToken
			? await fetchFromDiscord(userId, options.botToken)
			: await fetchFromLanyard(userId);

		const buffer = await genPng(data, options);
		return buffer;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('source rejected')) {
				throw new KythiaArtsError('Error loading user assets, try again later');
			}
			throw new KythiaArtsError(error.message);
		}
		throw new KythiaArtsError('Unknown error occurred');
	}
}

export default profileImage;
