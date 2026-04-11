import type { DiscordBadge } from '../types';

export const DISCORD_BADGES: Record<number, Omit<DiscordBadge, 'id'>> = {
	1: {
		description: 'Discord Staff',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordstaff.svg',
	}, // 1 << 0
	2: {
		description: 'Partnered Server Owner',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordpartner.svg',
	}, // 1 << 1
	4: {
		description: 'HypeSquad Events',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/hypesquadevents.svg',
	}, // 1 << 2
	8: {
		description: 'Bug Hunter Level 1',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordbughunter1.svg',
	}, // 1 << 3
	64: {
		description: 'House Bravery',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/hypesquadbravery.svg',
	}, // 1 << 6
	128: {
		description: 'House Brilliance',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/hypesquadbrilliance.svg',
	}, // 1 << 7
	256: {
		description: 'House Balance',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/hypesquadbalance.svg',
	}, // 1 << 8
	512: {
		description: 'Early Supporter',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordearlysupporter.svg',
	}, // 1 << 9
	16384: {
		description: 'Bug Hunter Level 2',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordbughunter2.svg',
	}, // 1 << 14
	131072: {
		description: 'Early Verified Bot Developer',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordbotdev.svg',
	}, // 1 << 17
	262144: {
		description: 'Discord Certified Moderator',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/discordmod.svg',
	}, // 1 << 18
	4194304: {
		description: 'Active Developer',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/activedeveloper.svg',
	}, // 1 << 22
	8388608: {
		description: 'Legacy Username',
		icon: 'https://raw.githubusercontent.com/kenndeclouv/badges-discord/main/assets/username.png',
	}, // 1 << 23
};

export function getBadgesFromFlags(flags: number): DiscordBadge[] {
	if (!flags) return [];
	const badges: DiscordBadge[] = [];

	for (const [flagStr, badgeData] of Object.entries(DISCORD_BADGES)) {
		const flag = Number(flagStr);
		if ((flags & flag) === flag) {
			badges.push({
				id: flagStr,
				...badgeData,
			});
		}
	}

	return badges;
}
