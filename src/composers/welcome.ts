import path from 'node:path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import {
	genWelcomeAvatar,
	genWelcomeBase,
	genWelcomeText,
} from '../renderers/welcome';
import type { DiscordUserData, WelcomeOptions } from '../types';

// Register fonts
GlobalFonts.registerFromPath(
	`${path.join(__dirname, '..', '..', 'public', 'fonts')}/HelveticaBold.ttf`,
	'Helvetica Bold',
);
GlobalFonts.registerFromPath(
	`${path.join(__dirname, '..', '..', 'public', 'fonts')}/Helvetica.ttf`,
	'Helvetica',
);

/**
 * Generate complete welcome banner
 */
export async function genWelcomeBanner(
	data: DiscordUserData,
	options: WelcomeOptions,
): Promise<Buffer> {
	const { assets } = data;

	// Get dimensions
	const width = options?.customWidth ?? 1024;
	const height = options?.customHeight ?? 500;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Get user avatar (high quality)
	const userAvatar = `${assets?.avatarURL ?? assets?.defaultAvatarURL}?size=512`;

	// Get background image (custom or banner or avatar)
	const backgroundImage =
		options?.customBackground ?? assets?.bannerURL ?? userAvatar;

	// Layer 1: Background
	const cardBase = await genWelcomeBase(options, backgroundImage);
	ctx.drawImage(cardBase, 0, 0);

	// Layer 2: Avatar
	const cardAvatar = await genWelcomeAvatar(userAvatar, options);
	ctx.drawImage(cardAvatar, 0, 0);

	// Layer 3: Text (WELCOME + username)
	const username =
		options?.customUsername ??
		data.global_name ??
		data.username ??
		'Unknown User';
	const cardText = genWelcomeText(username, options);
	ctx.drawImage(cardText, 0, 0);

	return canvas.toBuffer('image/png');
}
