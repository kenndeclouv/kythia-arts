import { genWelcomeBanner } from '../composers/welcome';
import { KythiaArtsError } from '../errors';
import { fetchUserData as fetchFromDiscord } from '../services/discord-api';
import { fetchUserData as fetchFromLanyard } from '../services/lanyard-api';
import type { WelcomeOptions } from '../types';

/**
 * Generate a Discord welcome/goodbye banner
 * @param userId - Discord user ID
 * @param options - Welcome banner customization options
 * @returns PNG buffer of the welcome banner
 */
export async function welcomeBanner(
	userId: string,
	options: WelcomeOptions = {},
): Promise<Buffer> {
	if (!userId || typeof userId !== 'string') {
		throw new KythiaArtsError(
			`TypeError: Invalid argument for welcomeBanner()\nExpected string userId, got ${typeof userId === 'undefined' || !userId ? 'undefined' : typeof userId}`,
		);
	}

	try {
		// Choose API based on botToken presence
		const data = options.botToken
			? await fetchFromDiscord(userId, options.botToken)
			: await fetchFromLanyard(userId);

		const buffer = await genWelcomeBanner(data, options);
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

export default welcomeBanner;
