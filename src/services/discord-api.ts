import fetch, { FetchError } from 'node-fetch';
import { KythiaArtsError } from '../errors';
import type { DiscordUserData } from '../types';

const DISCORD_API = 'https://discord.com/api/v10';
const DISCORD_CDN = 'https://cdn.discordapp.com';

/**
 * Build avatar URL from user data
 */
function getAvatarURL(userId: string, avatarHash: string | null): string {
	if (!avatarHash) {
		// Default avatar - use discriminator % 5
		return `${DISCORD_CDN}/embed/avatars/${Number.parseInt(userId, 10) % 5}.png`;
	}
	const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
	return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}`;
}

/**
 * Build banner URL from user data
 */
function getBannerURL(
	userId: string,
	bannerHash: string | null,
): string | null {
	if (!bannerHash) return null;
	const extension = bannerHash.startsWith('a_') ? 'gif' : 'png';
	return `${DISCORD_CDN}/banners/${userId}/${bannerHash}.${extension}`;
}

/**
 * Fetch Discord user data directly from Discord API
 * Requires a bot token for authentication
 * @param userId - Discord user ID
 * @param botToken - Discord bot token
 * @returns User data including avatar, banner, badges, etc.
 */
export async function fetchUserData(
	userId: string,
	botToken: string,
): Promise<DiscordUserData> {
	if (!botToken || typeof botToken !== 'string') {
		throw new KythiaArtsError(
			'Bot token is required to fetch data from Discord API',
		);
	}

	try {
		const response = await fetch(`${DISCORD_API}/users/${userId}`, {
			headers: {
				Authorization: `Bot ${botToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new KythiaArtsError('Invalid bot token');
			}
			if (response.status === 404) {
				throw new KythiaArtsError('User not found');
			}
			throw new KythiaArtsError(
				`Discord API error: ${response.status} ${response.statusText}`,
			);
		}

		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			throw new KythiaArtsError(
				`Invalid response format. Expected JSON, but received: ${contentType}`,
			);
		}

		const userData = (await response.json()) as DiscordUserData;

		// Calculate created_at from Snowflake ID if not provided
		if (!userData.created_at) {
			userData.created_at = new Date(
				Number.parseInt(userData.id, 10) / 4194304 + 1420070400000,
			).toISOString();
		}

		// Build CDN URLs for compatibility with composers
		const avatarURL = getAvatarURL(userData.id, userData.avatar);
		const bannerURL = getBannerURL(userData.id, userData.banner);

		// Add assets field for composer compatibility
		return {
			...userData,
			assets: {
				avatarURL,
				defaultAvatarURL: `${DISCORD_CDN}/embed/avatars/${Number.parseInt(userData.id, 10) % 5}.png`,
				bannerURL,
				badges: userData.badges || [],
			},
		};
	} catch (error) {
		if (error instanceof FetchError) {
			throw new KythiaArtsError(
				'Discord API is currently down, try again later',
			);
		}
		if (error instanceof KythiaArtsError) {
			throw error;
		}
		throw new KythiaArtsError(
			(error as Error)?.message || 'Failed to fetch user data from Discord',
		);
	}
}

export default fetchUserData;
