import {
	type Canvas,
	createCanvas,
	type Image,
	loadImage,
} from '@napi-rs/canvas';
// Import profile image assets
import profileImageFiles from '../../public/profile-image.files.json';
import { KythiaArtsError } from '../errors';
import type { DiscordUserData, ProfileOptions } from '../types';
import { getCanvasDimensions } from '../utils/canvas';
import {
	abbreviateNumber,
	getDateOrString,
	parseUsername,
	truncateText,
} from '../utils/text';
import {
	isNumber,
	isString,
	parseHex,
	parseImg,
	parsePng,
} from '../utils/validation';

const { otherImgs, statusImgs } = profileImageFiles;

const alphaValue = 0.4;
const clydeID = '1081004946872352958';

/**
 * Badge canvas representation
 */
interface BadgeCanvas {
	canvas: Image;
	x: number;
	y: number;
	w: number;
}

/**
 * Extended profile options with internal scaling properties
 */
interface ScaledProfileOptions extends ProfileOptions {
	_scaleX?: number;
	_scaleY?: number;
	_canvasWidth?: number;
	_canvasHeight?: number;
}

/**
 * Get and load Discord badges + custom badges
 */
export async function getBadges(
	data: DiscordUserData,
	options: ScaledProfileOptions,
): Promise<BadgeCanvas[]> {
	const { assets } = data;

	const badges = assets?.badges ?? [];
	const canvasBadges: BadgeCanvas[] = [];

	for (const badge of badges.reverse()) {
		const { name, icon } = badge;
		const canvas = await loadImage(icon).catch(() => undefined);
		if (!canvas) {
			throw new KythiaArtsError(
				`Could not load badge: (${name || 'Unknown'}) \nIf you think it is not a network problem, please report it in our discord: https://discord.gg/csedxqGQKP`,
			);
		}

		canvasBadges.push({ canvas, x: 0, y: 15, w: 60 });
	}

	if (options?.customBadges?.length) {
		if (options?.overwriteBadges) {
			canvasBadges.splice(0, badges.length);
		}

		for (let i = 0; i < options.customBadges.length; i++) {
			const badgePath = options.customBadges[i];
			if (!badgePath) continue;

			const canvas = await loadImage(parsePng(badgePath)).catch(
				() => undefined,
			);
			if (!canvas) {
				const truncatedBadge = truncateText(badgePath, 30);
				throw new KythiaArtsError(
					`Could not load custom badge: (${truncatedBadge}), make sure that the image exists.`,
				);
			}

			canvasBadges.push({ canvas, x: 10, y: 22, w: 46 });
		}
	}

	return canvasBadges;
}

/**
 * Generate card base with background
 */
export async function genBase(
	options: ScaledProfileOptions,
	_avatarData: string,
	bannerData: string | null,
): Promise<Canvas> {
	const { width, height } = getCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	let cardBackground: Image | undefined;

	if (options?.customBackground || bannerData) {
		const bgStr = options?.customBackground
			? parseImg(options.customBackground)
			: bannerData;
		if (bgStr) {
			cardBackground = await loadImage(bgStr).catch(() => undefined);
		}
	}

	ctx.fillStyle = '#18191c';
	ctx.beginPath();
	ctx.fillRect(0, 0, width, height);
	ctx.fill();

	if (cardBackground) {
		const blurFilter = options?.moreBackgroundBlur
			? 'blur(9px)'
			: options?.disableBackgroundBlur
				? 'blur(0px)'
				: 'blur(3px)';
		const blurAmount = options?.moreBackgroundBlur
			? 9
			: options?.disableBackgroundBlur
				? 0
				: 3;
		ctx.filter =
			blurFilter +
			(options?.backgroundBrightness
				? ` brightness(${options.backgroundBrightness + 100}%)`
				: '');

		// Cover-fit: scale the image so it fills the canvas, preserving aspect ratio.
		// Extra pixels are cropped; the image is never stretched.
		const imgRatio = cardBackground.width / cardBackground.height;
		const canvasRatio = width / height;

		let drawWidth: number;
		let drawHeight: number;
		let offsetX: number;
		let offsetY: number;

		if (imgRatio > canvasRatio) {
			// Image is wider than canvas — fit to height, crop sides
			drawHeight = height + blurAmount * 2;
			drawWidth = drawHeight * imgRatio;
			offsetX = (width - drawWidth) / 2;
			offsetY = -blurAmount;
		} else {
			// Image is taller than canvas — fit to width, crop top/bottom
			drawWidth = width + blurAmount * 2;
			drawHeight = drawWidth / imgRatio;
			offsetX = -blurAmount;
			offsetY = (height - drawHeight) / 2;
		}

		// Clip to canvas bounds so blurred edges don't bleed to transparent
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, width, height);
		ctx.clip();
		ctx.drawImage(cardBackground, offsetX, offsetY, drawWidth, drawHeight);
		ctx.restore();
		ctx.filter = 'none';
	}

	// Apply customizable overlay color
	const overlayColor = options?.overlayColor ?? 'rgba(42, 45, 51, 0.2)';
	ctx.globalAlpha = 1;
	ctx.fillStyle = overlayColor;
	ctx.beginPath();
	ctx.fillRect(0, 0, width, height);
	ctx.fill();

	return canvas;
}

/**
 * Generate frame overlay and background elements
 */
export async function genFrame(
	badges: BadgeCanvas[],
	options: ScaledProfileOptions,
): Promise<Canvas> {
	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const cardFrame = await loadImage(Buffer.from(otherImgs.frame, 'base64'));

	ctx.globalCompositeOperation = 'source-out';
	ctx.globalAlpha = 0.5;
	ctx.drawImage(cardFrame, 0, 0, width, height);
	ctx.globalCompositeOperation = 'source-over';

	// Only draw date background if date is not hidden
	if (!options?.hideDate) {
		ctx.globalAlpha = alphaValue;
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.roundRect(696 * scaleX, 248 * scaleY, 165 * scaleX, 33 * scaleY, [
			12 * Math.min(scaleX, scaleY),
		]);
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	const badgesLength = badges.length;

	if (options?.badgesFrame && badgesLength > 0 && !options?.removeBadges) {
		ctx.fillStyle = '#000';
		ctx.globalAlpha = alphaValue;
		ctx.beginPath();
		ctx.roundRect(
			857 * scaleX - badgesLength * 59 * scaleX,
			15 * scaleY,
			(59 * badgesLength + 8) * scaleX,
			61 * scaleY,
			[17 * Math.min(scaleX, scaleY)],
		);
		ctx.fill();
	}

	return canvas;
}

/**
 * Generate border overlay
 */
export function genBorder(options: ScaledProfileOptions): Canvas {
	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const borderColors: string[] = [];
	if (typeof options.borderColor === 'string') {
		borderColors.push(options.borderColor);
	} else if (Array.isArray(options.borderColor)) {
		borderColors.push(...options.borderColor);
	}

	if (borderColors.length > 20) {
		throw new KythiaArtsError(
			`Invalid borderColor length (${borderColors.length}) must be a maximum of 20 colors`,
		);
	}

	const gradX = options.borderAllign === 'vertical' ? 0 : width;
	const gradY = options.borderAllign === 'vertical' ? height : 0;

	const grd = ctx.createLinearGradient(0, 0, gradX, gradY);

	for (let i = 0; i < borderColors.length; i++) {
		const stop = i / (borderColors.length - 1);
		const color = borderColors[i];
		if (color) {
			grd.addColorStop(stop, parseHex(color));
		}
	}

	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.fillRect(0, 0, width, height);

	ctx.globalCompositeOperation = 'destination-out';

	ctx.beginPath();
	ctx.roundRect(
		9 * scaleX,
		9 * scaleY,
		width - 18 * scaleX, // Use derived width to ensure symmetry
		height - 18 * scaleY,
		[25 * minScale],
	);
	ctx.fill();

	return canvas;
}

/**
 * Generate text content and avatar
 */
export async function genTextAndAvatar(
	data: DiscordUserData,
	options: ScaledProfileOptions,
	avatarData: string,
	hasFrame = false,
): Promise<Canvas> {
	const {
		global_name: globalName,
		username: rawUsername,
		discriminator,
		bot,
		created_at: createdTimestamp,
		id,
	} = data;

	// Extract options with defaults
	const customFont = options?.customFont ?? 'Helvetica';
	const usernameSize = options?.usernameSize;
	const tagSize = options?.tagSize ?? 60;
	const textShadow = options?.textShadow ?? false;
	const textStroke = options?.textStroke;
	const avatarBorder = options?.avatarBorder;
	const hideDate = options?.hideDate ?? false;
	const multilineSubtitle = options?.multilineSubtitle;

	const isClyde = id === clydeID;
	const pixelLength = bot ? 470 : 555;

	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const fixedUsername =
		options?.customUsername ?? globalName ?? rawUsername ?? 'Unknown User';

	const { username, newSize } = parseUsername(
		fixedUsername,
		ctx,
		customFont,
		usernameSize ? usernameSize * minScale : 80 * minScale,
		pixelLength * scaleX,
		options?.fontWeight ?? 'bold',
	);

	// Handle multiline subtitle or single subtitle
	if ((multilineSubtitle || options?.customSubtitle) && !options.rankData) {
		const subtitles = multilineSubtitle ?? [options?.customSubtitle ?? ''];
		const lineHeight = 25 * scaleY;
		const totalHeight = subtitles.length * lineHeight + 8 * scaleY;

		ctx.globalAlpha = alphaValue;
		ctx.fillStyle = '#2a2d33';
		ctx.beginPath();
		ctx.roundRect(
			304 * scaleX,
			248 * scaleY,
			380 * scaleX,
			Math.max(33 * scaleY, totalHeight),
			[12 * minScale],
		);
		ctx.fill();
		ctx.globalAlpha = 1;

		ctx.font = `${23 * minScale}px ${customFont}`;
		ctx.textAlign = 'left';
		ctx.fillStyle = '#dadada';

		for (let index = 0; index < subtitles.length; index++) {
			const line = subtitles[index];
			if (line) {
				ctx.fillText(line, 314 * scaleX, 258 * scaleY + index * lineHeight);
			}
		}
	}

	const createdDateString = getDateOrString(
		options?.customDate,
		createdTimestamp ?? new Date().toISOString(),
		options?.localDateType,
	);

	if (isClyde && !options?.customTag) {
		options.customTag = '@clyde';
	}

	const tag = options?.customTag
		? isString(options.customTag, 'customTag')
		: !discriminator
			? `@${rawUsername ?? 'unknown'}`
			: `#${discriminator}`;

	// Apply text shadow if enabled
	if (textShadow) {
		ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
		ctx.shadowBlur = 4;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
	}

	// Apply text stroke if specified
	if (textStroke?.width && textStroke?.color) {
		ctx.strokeStyle = parseHex(textStroke.color);
		ctx.lineWidth = textStroke.width * minScale;
		ctx.lineJoin = 'round';
	}

	// Draw username
	const finalUsernameSize = usernameSize ?? newSize; // Already scaled
	const weight = options?.fontWeight ?? 'bold';
	ctx.font = `${weight} ${finalUsernameSize}px ${customFont}`.trim();
	ctx.textAlign = 'left';
	ctx.fillStyle = options?.usernameColor
		? parseHex(options.usernameColor)
		: '#FFFFFF';

	if (textStroke?.width && textStroke?.color) {
		ctx.strokeText(username, 300 * scaleX, 155 * scaleY);
	}
	ctx.fillText(username, 300 * scaleX, 155 * scaleY);

	// Draw tag if no rank data
	if (!options?.rankData) {
		ctx.font = `${tagSize * minScale}px ${customFont}`;
		ctx.fillStyle = options?.tagColor ? parseHex(options.tagColor) : '#dadada';
		if (textStroke?.width && textStroke?.color) {
			ctx.strokeText(tag, 300 * scaleX, 215 * scaleY);
		}
		ctx.fillText(tag, 300 * scaleX, 215 * scaleY);
	}

	// Reset shadow and stroke
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.lineWidth = 1;

	// Draw date if not hidden
	if (!hideDate) {
		ctx.font = `${23 * minScale}px ${customFont}`;
		ctx.textAlign = 'center';
		ctx.fillStyle = '#dadada';
		ctx.fillText(createdDateString, 775 * scaleX, 273 * scaleY);
	}

	const cardAvatar = await loadImage(avatarData);

	const roundValue = (options?.squareAvatar ? 30 : 225) * minScale;

	// Calculate concentric center
	const newCenterX = 159.5 * scaleX;
	const newCenterY = 151.5 * scaleY;
	const avatarSize = 225 * minScale;
	const avatarX = newCenterX - avatarSize / 2;
	const avatarY = newCenterY - avatarSize / 2;

	ctx.beginPath();
	ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, [roundValue]);
	ctx.clip();

	ctx.fillStyle = '#292b2f';
	ctx.beginPath();
	ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, [roundValue]);
	ctx.fill();

	ctx.drawImage(cardAvatar, avatarX, avatarY, avatarSize, avatarSize);

	ctx.closePath();

	// Apply avatar border if specified, and there are no overlayed decoration frames
	if (!hasFrame && avatarBorder?.width && avatarBorder?.color) {
		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = parseHex(avatarBorder.color);
		ctx.lineWidth = avatarBorder.width * minScale;
		ctx.beginPath();
		ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, [roundValue]);
		ctx.stroke();
	}

	let resultCanvas: Canvas = canvas;
	if (options?.presenceStatus) {
		resultCanvas = await genStatus(canvas, options);
	}

	return resultCanvas;
}

/**
 * Generate avatar frame decoration
 */
export async function genAvatarFrame(
	data: { decoration?: { avatarFrame?: string } },
	options: ScaledProfileOptions,
): Promise<Canvas> {
	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const newCenterX = 159.5 * scaleX;
	const newCenterY = 151.5 * scaleY;

	const frameUrl = data?.decoration?.avatarFrame;

	if (frameUrl) {
		const avatarFrame = await loadImage(frameUrl);
		const frameSize = 269 * minScale;
		const frameX = newCenterX - frameSize / 2;
		const frameY = newCenterY - frameSize / 2;

		ctx.drawImage(avatarFrame, frameX, frameY, frameSize, frameSize);
	}

	if (options?.presenceStatus) {
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();

		if (options.presenceStatus === 'phone') {
			ctx.roundRect(
				newCenterX + 57 * minScale,
				newCenterY + 42.5 * minScale,
				57 * minScale,
				78 * minScale,
				[10 * minScale],
			);
		} else {
			ctx.roundRect(
				newCenterX + 52.5 * minScale,
				newCenterY + 52.5 * minScale,
				62 * minScale,
				62 * minScale,
				[62 * minScale],
			);
		}
		ctx.fill();
		ctx.globalCompositeOperation = 'source-over';
	}

	return canvas;
}

/**
 * Generate presence status indicator
 */
async function genStatus(
	canvasToEdit: Canvas,
	options: ScaledProfileOptions,
): Promise<Canvas> {
	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const validStatus = [
		'idle',
		'dnd',
		'online',
		'invisible',
		'offline',
		'streaming',
		'phone',
	];

	const presenceStatus = options.presenceStatus;
	if (!presenceStatus || !validStatus.includes(presenceStatus)) {
		throw new KythiaArtsError(
			`Invalid presenceStatus ('${presenceStatus}') must be 'online' | 'idle' | 'offline' | 'dnd' | 'invisible' | 'streaming' | 'phone'`,
		);
	}

	const statusString =
		presenceStatus === 'offline' ? 'invisible' : presenceStatus;

	const statusBase64 = statusImgs[statusString as keyof typeof statusImgs];
	if (!statusBase64) {
		throw new KythiaArtsError(`Status image not found for: ${statusString}`);
	}

	const status = await loadImage(Buffer.from(statusBase64, 'base64'));

	const newCenterX = 159.5 * scaleX;
	const newCenterY = 151.5 * scaleY;

	ctx.drawImage(canvasToEdit, 0, 0);

	ctx.globalCompositeOperation = 'destination-out';

	if (presenceStatus === 'phone') {
		ctx.roundRect(
			newCenterX + 57 * minScale,
			newCenterY + 42.5 * minScale,
			57 * minScale,
			78 * minScale,
			[10 * minScale],
		);
	} else {
		ctx.roundRect(
			newCenterX + 52.5 * minScale,
			newCenterY + 52.5 * minScale,
			62 * minScale,
			62 * minScale,
			[62 * minScale],
		);
	}
	ctx.fill();

	ctx.globalCompositeOperation = 'source-over';

	if (presenceStatus === 'phone') {
		// Image Position: 224.5 (65 offset), 202 (50.5 offset)
		ctx.drawImage(
			status,
			newCenterX + 65 * minScale,
			newCenterY + 50.5 * minScale,
			57 * minScale,
			78 * minScale,
		);
	} else {
		// Image Position: 212 (52.5 offset), 204 (52.5 offset)
		ctx.drawImage(
			status,
			newCenterX + 52.5 * minScale,
			newCenterY + 52.5 * minScale,
			62 * minScale,
			62 * minScale,
		);
	}

	return canvas;
}

/**
 * Generate badges overlay
 */
export function genBadges(
	badges: BadgeCanvas[],
	options: Partial<ScaledProfileOptions> = {},
): Canvas {
	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Extract badge customization options with defaults
	const badgePosition = options?.badgePosition ?? 'top-right';
	const badgeSpacing = (options?.badgeSpacing ?? 59) * scaleX;
	const badgeOpacity = options?.badgeOpacity ?? 1.0;
	const badgeScale = options?.badgeScale ?? 1.0;

	// Calculate position based on badgePosition
	const positions: Record<string, { startX: number; startY: number }> = {
		'top-right': { startX: 800 * scaleX, startY: 15 * scaleY },
		'top-left': { startX: 85 * scaleX, startY: 15 * scaleY },
		'bottom-right': { startX: 800 * scaleX, startY: 227 * scaleY },
		'bottom-left': { startX: 85 * scaleX, startY: 227 * scaleY },
	};

	const { startX, startY } = positions[badgePosition] || {
		startX: 800 * scaleX,
		startY: 15 * scaleY,
	};
	const isLeftAlign = badgePosition.includes('left');

	let x = startX;
	for (const badge of badges) {
		const { canvas: badgeCanvas, x: bX, y: bY, w } = badge;

		// Apply scale to badge size
		const scaledW = w * badgeScale * minScale;
		const scaledBX = bX * badgeScale * minScale;
		const scaledBY = bY * badgeScale * minScale;

		// Apply opacity
		ctx.globalAlpha = badgeOpacity;

		// Calculate x position based on alignment
		const xPos = isLeftAlign ? x : x + scaledBX;
		const yPos = startY + (bY !== 15 ? scaledBY : 0);

		ctx.drawImage(badgeCanvas, xPos, yPos, scaledW, scaledW);

		// Move to next badge position
		x += isLeftAlign ? badgeSpacing : -badgeSpacing;
	}

	// Reset alpha
	ctx.globalAlpha = 1;

	return canvas;
}

/**
 * Generate bot verification badge
 */
export async function genBotVerifBadge(
	data: DiscordUserData,
	options?: ScaledProfileOptions,
): Promise<Canvas> {
	const { username, global_name, id, public_flags } = data;
	const verified = (public_flags & (1 << 16)) !== 0;

	// Use options to get scaling if available, otherwise default to 885x303
	const { width, height, scaleX, scaleY } = options
		? getCanvasDimensions(options)
		: { width: 885, height: 303, scaleX: 1, scaleY: 1 };
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const isClyde = id === clydeID;

	const usernameToParse = isClyde ? global_name : username;

	const { textLength } = parseUsername(
		usernameToParse ?? 'Bot',
		ctx,
		'Helvetica',
		80 * minScale,
		470 * scaleX,
		'bold',
	);

	const badgeName = isClyde ? 'botAI' : verified ? 'botVerif' : 'botNoVerif';

	const botBadgeBase64 = otherImgs[badgeName as keyof typeof otherImgs];
	if (!botBadgeBase64) {
		throw new KythiaArtsError(`Bot badge not found for: ${badgeName}`);
	}

	const botBadge = await loadImage(Buffer.from(botBadgeBase64, 'base64'));

	ctx.drawImage(botBadge, textLength + 310 * scaleX, 110 * scaleY);

	return canvas;
}

/**
 * Generate XP/Rank bar
 */
export function genXpBar(options: ScaledProfileOptions): Canvas {
	if (!options.rankData) {
		throw new KythiaArtsError('rankData is required for genXpBar');
	}

	const {
		currentXp,
		requiredXp,
		level,
		rank,
		barColor,
		levelColor,
		autoColorRank,
		rankColor,
		rankPrefix = 'RANK',
		hideRank = false,
		hideLevel = false,
		showPercentage = false,
		xpBarHeight = 36,
		xpBarStyle = 'rounded',
		barGradientDirection = 'horizontal',
		barBorder,
	} = options.rankData;

	if (
		Number.isNaN(currentXp) ||
		Number.isNaN(requiredXp) ||
		Number.isNaN(level)
	) {
		throw new KythiaArtsError(
			'rankData options requires: currentXp, requiredXp and level properties',
		);
	}

	const { width, height, scaleX, scaleY } = getCanvasDimensions(options);
	const minScale = Math.min(scaleX, scaleY);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const mY = 8 * scaleY;

	// Bottom text background
	ctx.fillStyle = '#000';
	ctx.globalAlpha = alphaValue;
	ctx.beginPath();
	ctx.roundRect(304 * scaleX, 248 * scaleY, 380 * scaleX, 33 * scaleY, [
		12 * minScale,
	]);
	ctx.fill();
	ctx.globalAlpha = 1;

	// Build rank string with custom prefix
	const rankString =
		!hideRank && rank !== undefined && !Number.isNaN(rank)
			? `${rankPrefix} #${abbreviateNumber(isNumber(rank, 'rankData:rank'))}`
			: '';
	const lvlString =
		!hideLevel && !Number.isNaN(level)
			? `Lvl ${abbreviateNumber(isNumber(level, 'rankData:level'))}`
			: '';

	// XP display with optional percentage
	const percentage = Math.round((currentXp / requiredXp) * 100);
	const xpText = showPercentage
		? `${abbreviateNumber(currentXp)} / ${abbreviateNumber(requiredXp)} XP (${percentage}%)`
		: `${abbreviateNumber(currentXp)} / ${abbreviateNumber(requiredXp)} XP`;

	const customFont = options?.customFont ?? 'Helvetica';
	const weight = options?.fontWeight ?? 'bold';

	ctx.font = `${21 * minScale}px ${customFont}`;
	ctx.textAlign = 'left';
	ctx.fillStyle = '#dadada';
	ctx.fillText(xpText, 314 * scaleX, 273 * scaleY);

	// Rank color logic
	const rankColors = {
		gold: '#F1C40F',
		silver: '#a1a4c9',
		bronze: '#AD8A56',
		current: rankColor ?? '#dadada',
	};

	const rankMapping: Record<string, string> = {
		[`${rankPrefix} #1`]: rankColors.gold,
		[`${rankPrefix} #2`]: rankColors.silver,
		[`${rankPrefix} #3`]: rankColors.bronze,
	};

	// Auto-color rank only if no custom rankColor is set
	if (!rankColor && autoColorRank && rankString in rankMapping) {
		rankColors.current = rankMapping[rankString] ?? rankColors.current;
	}

	// Display rank (if not hidden)
	if (rankString) {
		ctx.font = `${weight} ${21 * minScale}px ${customFont}`.trim();
		ctx.textAlign = 'right';
		ctx.fillStyle = rankColors.current;
		ctx.fillText(
			rankString,
			674 * scaleX -
				ctx.measureText(lvlString).width -
				(lvlString ? 10 * scaleX : 0),
			273 * scaleY,
		);
	}

	// Display level (if not hidden)
	if (lvlString) {
		ctx.font = `${weight} ${21 * minScale}px ${customFont}`.trim();
		ctx.textAlign = 'right';
		ctx.fillStyle = levelColor ? parseHex(levelColor) : '#dadada';
		ctx.fillText(lvlString, 674 * scaleX, 273 * scaleY);
	}

	// XP Bar background
	ctx.globalAlpha = alphaValue;
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.roundRect(
		304 * scaleX,
		187 * scaleY - mY,
		557 * scaleX,
		xpBarHeight * scaleY,
		[14 * minScale],
	);
	ctx.fill();
	ctx.globalAlpha = 1;

	// Apply bar border if specified
	if (barBorder?.width && barBorder?.color) {
		ctx.strokeStyle = parseHex(barBorder.color);
		ctx.lineWidth = barBorder.width * minScale;
		ctx.beginPath();
		ctx.roundRect(
			304 * scaleX,
			187 * scaleY - mY,
			557 * scaleX,
			xpBarHeight * scaleY,
			[14 * minScale],
		);
		ctx.stroke();
	}

	// Clip for XP bar
	ctx.beginPath();
	ctx.roundRect(
		304 * scaleX,
		187 * scaleY - mY,
		557 * scaleX,
		xpBarHeight * scaleY,
		[14 * minScale],
	);
	ctx.clip();

	// Build gradient colors
	const barColors: string[] = [];
	if (typeof barColor === 'string') {
		barColors.push(barColor);
	} else if (Array.isArray(barColor)) {
		barColors.push(...barColor);
	}

	if (barColors.length > 20) {
		throw new KythiaArtsError(
			`Invalid barColor length (${barColors.length}) must be a maximum of 20 colors`,
		);
	}

	const barWidth = Math.round((currentXp * (556 * scaleX)) / requiredXp);

	// Gradient direction logic
	let gradientCoords = {
		x0: 304 * scaleX,
		y0: 197 * scaleY,
		x1: 860 * scaleX,
		y1: 197 * scaleY,
	}; // horizontal (default)
	if (barGradientDirection === 'vertical') {
		gradientCoords = {
			x0: 304 * scaleX,
			y0: 187 * scaleY - mY,
			x1: 304 * scaleX,
			y1: 187 * scaleY - mY + xpBarHeight * scaleY,
		};
	} else if (barGradientDirection === 'radial') {
		// For radial, use a diagonal for linear gradient
		gradientCoords = {
			x0: 304 * scaleX,
			y0: 187 * scaleY - mY,
			x1: 860 * scaleX,
			y1: 187 * scaleY - mY + xpBarHeight * scaleY,
		};
	}

	const grd = ctx.createLinearGradient(
		gradientCoords.x0,
		gradientCoords.y0,
		gradientCoords.x1,
		gradientCoords.y1,
	);

	for (let i = 0; i < barColors.length; i++) {
		const stop = i / (barColors.length - 1);
		const color = barColors[i];
		if (color) {
			grd.addColorStop(stop, parseHex(color));
		}
	}

	// Draw XP bar with style
	ctx.fillStyle = barColors.length > 0 ? grd : '#fff';
	ctx.beginPath();

	// Apply bar style
	const barRadius =
		xpBarStyle === 'sharp'
			? 0
			: xpBarStyle === 'capsule'
				? (xpBarHeight * scaleY) / 2
				: 14 * minScale;
	ctx.roundRect(
		304 * scaleX,
		187 * scaleY - mY,
		barWidth,
		xpBarHeight * scaleY,
		[barRadius],
	);
	ctx.fill();

	return canvas;
}

/**
 * Add shadow effect to canvas
 */
export function addShadow(canvasToEdit: Canvas): Canvas {
	const scaleX = canvasToEdit.width / 885;
	const scaleY = canvasToEdit.height / 303;
	const minScale = Math.min(scaleX, scaleY);

	const canvas = createCanvas(canvasToEdit.width, canvasToEdit.height);
	const ctx = canvas.getContext('2d');
	ctx.filter = `drop-shadow(0px ${(4 * minScale).toFixed(2)}px ${(4 * minScale).toFixed(2)}px #000)`;
	ctx.globalAlpha = alphaValue;
	ctx.drawImage(canvasToEdit, 0, 0);
	ctx.globalAlpha = 1;

	return canvas;
}
