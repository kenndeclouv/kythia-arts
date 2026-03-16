import type { DiscordBadge } from '../types';

export const DISCORD_BADGES: Record<number, Omit<DiscordBadge, 'id'>> = {
	1: {
		description: 'Discord Staff',
		icon: 'https://discord.com/assets/48d5bdcffe9e7848067c2e187f1ef951.svg',
	}, // 1 << 0
	2: {
		description: 'Partnered Server Owner',
		icon: 'https://discord.com/assets/34306011e46e87f8ef25f3415d3b99ca.svg',
	}, // 1 << 1
	4: {
		description: 'HypeSquad Events',
		icon: 'https://discord.com/assets/e666a84a7a5ea2abbbfa73adf22e627b.svg',
	}, // 1 << 2
	8: {
		description: 'Bug Hunter Level 1',
		icon: 'https://discord.com/assets/8353d89b529e13365c415aef08d1d1f4.svg',
	}, // 1 << 3
	64: {
		description: 'House Bravery',
		icon: 'https://discord.com/assets/efcc751513ec434ea4275ecda4f61136.svg',
	}, // 1 << 6
	128: {
		description: 'House Brilliance',
		icon: 'https://discord.com/assets/ec8e92568a7c8f19a052ef42f862ff18.svg',
	}, // 1 << 7
	256: {
		description: 'House Balance',
		icon: 'https://discord.com/assets/9f00b18e292e10fc0ae84ff5332e8b0b.svg',
	}, // 1 << 8
	512: {
		description: 'Early Supporter',
		icon: 'https://discord.com/assets/b802e9af134ff492276d94220e36ec5c.svg',
	}, // 1 << 9
	16384: {
		description: 'Bug Hunter Level 2',
		icon: 'https://discord.com/assets/f599063762165e0d23e8b11b684765a8.svg',
	}, // 1 << 14
	131072: {
		description: 'Early Verified Bot Developer',
		icon: 'https://discord.com/assets/4441e07fe0f46b3cb41b79366236fca6.svg',
	}, // 1 << 17
	262144: {
		description: 'Discord Certified Moderator',
		icon: 'https://discord.com/assets/c981e58b5ea4b7fedd3a643cf0c60564.svg',
	}, // 1 << 18
	4194304: {
		description: 'Active Developer',
		icon: 'https://discord.com/assets/26c7a60fb1654315e0be26107bd47470.svg',
	}, // 1 << 22
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
