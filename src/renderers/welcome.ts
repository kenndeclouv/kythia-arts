import { type Canvas, createCanvas, loadImage } from '@napi-rs/canvas';
import type { WelcomeOptions } from '../types';
import { getWelcomeCanvasDimensions } from '../utils/canvas';
import { parseHex, parseImg } from '../utils/validation';

/**
 * Generate welcome banner background
 */
export async function genWelcomeBase(
	options: WelcomeOptions,
	backgroundImage?: string,
): Promise<Canvas> {
	const { width, height } = getWelcomeCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Load background image
	let bgImage: Awaited<ReturnType<typeof loadImage>> | null = null;
	if (backgroundImage) {
		try {
			bgImage = await loadImage(parseImg(backgroundImage));
		} catch {
			// Fallback to solid color if image fails
			bgImage = null;
		}
	}

	if (bgImage) {
		// Apply blur filter
		const blurAmount = options?.backgroundBlur ?? 3;
		ctx.filter = `blur(${blurAmount}px)`;

		// Apply brightness
		if (options?.backgroundBrightness) {
			ctx.filter += ` brightness(${options.backgroundBrightness + 100}%)`;
		}

		// Draw background image (cover fit)
		const imgRatio = bgImage.width / bgImage.height;
		const canvasRatio = width / height;

		let drawWidth: number;
		let drawHeight: number;
		let offsetX: number;
		let offsetY: number;

		if (imgRatio > canvasRatio) {
			// Image is wider
			drawHeight = height;
			drawWidth = height * imgRatio;
			offsetX = (width - drawWidth) / 2;
			offsetY = 0;
		} else {
			// Image is taller
			drawWidth = width;
			drawHeight = width / imgRatio;
			offsetX = 0;
			offsetY = (height - drawHeight) / 2;
		}

		ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);
		ctx.filter = 'none';
	} else {
		// Default gradient background
		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, '#667eea');
		gradient.addColorStop(1, '#764ba2');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
	}

	// Apply overlay for better text contrast
	const overlayColor = options?.overlayColor ?? 'rgba(0, 0, 0, 0.4)';
	ctx.fillStyle = overlayColor;
	ctx.fillRect(0, 0, width, height);

	return canvas;
}

/**
 * Generate circular avatar with border
 */
export async function genWelcomeAvatar(
	avatarUrl: string,
	options: WelcomeOptions,
	hasFrame = false,
): Promise<Canvas> {
	const { width, height } = getWelcomeCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const avatarSize = options?.avatarSize ?? 220;
	const avatarRadius = avatarSize / 2;

	// Avatar position (center horizontally, custom Y or default)
	const avatarX = width / 2;
	const avatarY = options?.avatarY ?? 80;

	// Load avatar
	const avatar = await loadImage(avatarUrl);

	// Draw avatar border if no frame overlay
	const borderConfig = options?.avatarBorder ?? { width: 8, color: '#FFFFFF' };

	if (!hasFrame && borderConfig.width > 0) {
		ctx.strokeStyle = parseHex(borderConfig.color);
		ctx.lineWidth = borderConfig.width;
		ctx.beginPath();
		ctx.arc(
			avatarX,
			avatarY + avatarRadius,
			avatarRadius + borderConfig.width / 2,
			0,
			Math.PI * 2,
		);
		ctx.stroke();
	}

	// Clip to circle
	ctx.save();
	ctx.beginPath();
	ctx.arc(avatarX, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();

	// Draw avatar
	ctx.drawImage(
		avatar,
		avatarX - avatarRadius,
		avatarY,
		avatarSize,
		avatarSize,
	);
	ctx.restore();

	return canvas;
}

/**
 * Generate welcome avatar frame decoration
 */
export async function genWelcomeAvatarFrame(
	frameUrl: string,
	options: WelcomeOptions,
): Promise<Canvas> {
	const { width, height } = getWelcomeCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const avatarSize = options?.avatarSize ?? 220;
	// Profile.ts uses 225 avatar and 269 frame = ~1.1955x scale ratio
	const frameSize = avatarSize * (269 / 225);

	// The avatar's center point in genWelcomeAvatar is (avatarX, avatarY + avatarRadius)
	const avatarRadius = avatarSize / 2;
	const centerX = width / 2;
	const centerY = (options?.avatarY ?? 80) + avatarRadius;

	const frameX = centerX - frameSize / 2;
	const frameY = centerY - frameSize / 2;

	if (frameUrl) {
		const avatarFrame = await loadImage(frameUrl);
		ctx.drawImage(avatarFrame, frameX, frameY, frameSize, frameSize);
	}

	return canvas;
}

/**
 * Generate welcome text and username
 */
export function genWelcomeText(
	username: string,
	options: WelcomeOptions,
): Canvas {
	const { width, height } = getWelcomeCanvasDimensions(options);
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const customFont = options?.customFont ?? 'Helvetica';
	const welcomeText =
		options?.welcomeText ??
		(options?.type === 'goodbye' ? 'GOODBYE' : 'WELCOME');
	const customFontSize = options?.customFontSize ?? 80;
	const customUsernameSize = options?.customUsernameSize ?? 40;
	const welcomeColor = options?.welcomeColor ?? '#FFFFFF';
	const usernameColor = options?.usernameColor ?? '#FFFFFF';
	const textShadow = options?.textShadow ?? true;
	const textStroke = options?.textStroke;

	// Calculate positions
	const avatarSize = options?.avatarSize ?? 220;
	const avatarY = options?.avatarY ?? 80;
	const textOffsetY = options?.textOffsetY ?? 0;
	const welcomeY = avatarY + avatarSize + 50 + textOffsetY; // Below avatar + offset
	const usernameY = welcomeY + 40; // Below welcome text

	// Apply text shadow if enabled
	if (textShadow) {
		ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
	}

	// Apply text stroke if specified
	if (textStroke?.width && textStroke?.color) {
		ctx.strokeStyle = parseHex(textStroke.color);
		ctx.lineWidth = textStroke.width;
		ctx.lineJoin = 'round';
	}

	// Draw welcome text
	const weight = options?.fontWeight ?? 'bold';
	ctx.font = `${weight} ${customFontSize}px ${customFont}`.trim();
	ctx.fillStyle = parseHex(welcomeColor);
	ctx.textAlign = 'center';

	if (textStroke?.width && textStroke?.color) {
		ctx.strokeText(welcomeText, width / 2, welcomeY);
	}
	ctx.fillText(welcomeText, width / 2, welcomeY);

	// Draw username
	// Draw username
	ctx.font = `${weight} ${customUsernameSize}px ${customFont}`.trim();
	ctx.fillStyle = parseHex(usernameColor);

	if (textStroke?.width && textStroke?.color) {
		ctx.strokeText(username, width / 2, usernameY);
	}
	ctx.fillText(username, width / 2, usernameY);

	// Reset shadow
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	return canvas;
}
