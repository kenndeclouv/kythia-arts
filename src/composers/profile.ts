import path from 'node:path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import {
	addShadow,
	genAvatarFrame,
	genBadges,
	genBase,
	genBorder,
	genBotVerifBadge,
	genFrame,
	genTextAndAvatar,
	genXpBar,
	getBadges,
} from '../renderers/profile';
import type { DiscordUserData, ProfileOptions } from '../types';

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
 * Extended user data with internal properties
 */
interface ExtendedUserData extends DiscordUserData {
	// basicInfo is replaced by direct DiscordUserData properties
	// Assets are inherited from DiscordUserData
	decoration?: {
		profileColors?: string[];
		avatarFrame?: string;
	};
}

/**
 * Generate complete profile card PNG
 */
export async function genPng(
	data: ExtendedUserData,
	options: ProfileOptions,
): Promise<Buffer> {
	const { assets } = data;

	// Default dimensions
	const defaultWidth = 885;
	const defaultHeight = 303;

	// Custom dimensions with defaults
	const canvasWidth = options?.customWidth ?? defaultWidth;
	const canvasHeight = options?.customHeight ?? defaultHeight;

	// Calculate scale ratios for proportional scaling
	const scaleX = canvasWidth / defaultWidth;
	const scaleY = canvasHeight / defaultHeight;

	// Add scale info to options for utility functions
	const scaledOptions: ProfileOptions & {
		_scaleX?: number;
		_scaleY?: number;
		_canvasWidth?: number;
		_canvasHeight?: number;
	} = {
		...options,
		_scaleX: scaleX,
		_scaleY: scaleY,
		_canvasWidth: canvasWidth,
		_canvasHeight: canvasHeight,
	};

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	const userAvatar = `${assets?.avatarURL ?? assets?.defaultAvatarURL}?size=512`;
	const userBanner = assets?.bannerURL ? `${assets.bannerURL}?size=512` : null;
	const badges = await getBadges(data, scaledOptions);

	// Apply scaling for clipping
	if (scaledOptions?.removeBorder) {
		ctx.roundRect(9 * scaleX, 9 * scaleY, 867 * scaleX, 285 * scaleY, [
			26 * Math.min(scaleX, scaleY),
		]);
	} else {
		ctx.roundRect(0, 0, canvasWidth, canvasHeight, [
			34 * Math.min(scaleX, scaleY),
		]);
	}
	ctx.clip();

	const cardBase = await genBase(scaledOptions, userAvatar, userBanner);
	ctx.drawImage(cardBase, 0, 0);

	const cardFrame = await genFrame(badges, scaledOptions);
	ctx.drawImage(cardFrame, 0, 0);

	const cardTextAndAvatar = await genTextAndAvatar(
		data,
		scaledOptions,
		userAvatar,
	);
	const textAvatarShadow = addShadow(cardTextAndAvatar);
	ctx.drawImage(textAvatarShadow, 0, 0);
	ctx.drawImage(cardTextAndAvatar, 0, 0);

	if (
		!scaledOptions?.disableProfileTheme &&
		data?.decoration?.profileColors &&
		typeof scaledOptions?.borderColor === 'undefined'
	) {
		scaledOptions.borderColor = data?.decoration?.profileColors;
		if (!scaledOptions?.borderAllign) {
			scaledOptions.borderAllign = 'vertical';
		}
	}

	if (
		(typeof scaledOptions?.borderColor === 'string' &&
			scaledOptions.borderColor) ||
		(Array.isArray(scaledOptions?.borderColor) &&
			scaledOptions.borderColor.length > 0)
	) {
		const border = genBorder(scaledOptions);
		ctx.drawImage(border, 0, 0);
	}

	if (data.bot) {
		const botVerifBadge = await genBotVerifBadge(data, scaledOptions);
		const shadowVerifBadge = addShadow(botVerifBadge);
		ctx.drawImage(shadowVerifBadge, 0, 0);
		ctx.drawImage(botVerifBadge, 0, 0);
	}

	if (!scaledOptions?.removeBadges) {
		const cardBadges = genBadges(badges, scaledOptions);
		const badgesShadow = addShadow(cardBadges);
		ctx.drawImage(badgesShadow, 0, 0);
		ctx.drawImage(cardBadges, 0, 0);
	}

	if (scaledOptions?.rankData) {
		const xpBar = genXpBar(scaledOptions);
		ctx.drawImage(xpBar, 0, 0);
	}

	if (!scaledOptions?.removeAvatarFrame && data?.decoration?.avatarFrame) {
		const avatarFrame = await genAvatarFrame(data, scaledOptions);
		ctx.drawImage(avatarFrame, 0, 0);
	}

	return canvas.toBuffer('image/png');
}
