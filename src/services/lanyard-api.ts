import fetch, { FetchError } from 'node-fetch';
import { KythiaArtsError } from '../errors';
import type { DiscordUserData } from '../types';

const LANYARD_API = 'https://api.lanyard.rest/v1/users';
const DISCORD_CDN = 'https://cdn.discordapp.com';

/**
 * Build avatar URL from user data
 */
function getAvatarURL(userId: string, avatarHash: string | null): string {
	if (!avatarHash) {
		// Default avatar - use user ID % 5
		return `${DISCORD_CDN}/embed/avatars/${Number.parseInt(userId, 10) % 5}.png`;
	}
	const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
	return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}`;
}

/**
 * Build banner URL from user data (not available in Lanyard)
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
 * Lanyard API response structure
 */
interface LanyardResponse {
	success: boolean;
	data: {
		discord_user: {
			id: string;
			username: string;
			discriminator: string;
			avatar: string | null;
			avatar_decoration_data: {
				asset: string;
				sku_id: string;
				expires_at: string | null;
			} | null;
			bot: boolean;
			global_name: string | null;
			display_name: string | null;
			public_flags: number;
			banner: string | null; // Added banner field
			banner_color: string | null; // Added banner_color field
			collectibles?: {
				nameplate?: {
					asset: string;
					sku_id: string;
					expires_at: string | null;
				};
			};
			primary_guild?: {
				badge: string | null;
				identity_enabled: boolean;
				identity_guild_id: string | null;
				tag: string | null;
			};
		};
		discord_status: string;
		activities: unknown[];
		kv: Record<string, unknown>;
	};
}

/**
 * Fetch Discord user data from Lanyard API
 * @param userId - Discord user ID
 * @returns User data including avatar, banner, badges, etc.
 */
export async function fetchUserData(userId: string): Promise<DiscordUserData> {
	try {
		const response = await fetch(`${LANYARD_API}/${userId}`);

		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			throw new KythiaArtsError(
				`Invalid response format. Expected JSON, but received: ${contentType}`,
			);
		}

		const json = (await response.json()) as LanyardResponse;

		if (!json.success || !json.data) {
			throw new KythiaArtsError('Failed to fetch user data from Lanyard');
		}

		const { discord_user } = json.data;

		// Build CDN URLs
		const avatarURL = getAvatarURL(discord_user.id, discord_user.avatar);
		const defaultAvatarURL = `${DISCORD_CDN}/embed/avatars/${Number.parseInt(discord_user.id, 10) % 5}.png`;
		const bannerURL = getBannerURL(discord_user.id, discord_user.banner);

		// Map Lanyard response to DiscordUserData
		const userData: DiscordUserData = {
			id: discord_user.id,
			username: discord_user.username,
			discriminator: discord_user.discriminator,
			global_name: discord_user.global_name,
			avatar: discord_user.avatar,
			avatar_decoration_data: discord_user.avatar_decoration_data,
			banner: discord_user.banner,
			banner_color: discord_user.banner_color,
			accent_color: null,
			clan: discord_user.primary_guild
				? {
						identity_guild_id:
							discord_user.primary_guild.identity_guild_id ?? '',
						identity_enabled: discord_user.primary_guild.identity_enabled,
						tag: discord_user.primary_guild.tag ?? '',
						badge: discord_user.primary_guild.badge ?? '',
					}
				: null,
			badges: [], // Lanyard doesn't provide badges directly
			premium_type: 0, // Not available in Lanyard
			premium_since: null,
			created_at: new Date(
				Number.parseInt(discord_user.id, 10) / 4194304 + 1420070400000,
			).toISOString(),
			bot: discord_user.bot,
			bio: null, // Not available in Lanyard
			public_flags: discord_user.public_flags,
			// Add assets field for composer compatibility
			assets: {
				avatarURL,
				defaultAvatarURL,
				bannerURL,
				badges: [],
			},
		};

		return userData;
	} catch (error) {
		if (error instanceof FetchError) {
			throw new KythiaArtsError(
				'Lanyard API is currently down, try again later',
			);
		}
		if (error instanceof KythiaArtsError) {
			throw error;
		}
		throw new KythiaArtsError(
			(error as Error)?.message || 'Failed to fetch user data',
		);
	}
}

export default fetchUserData;
