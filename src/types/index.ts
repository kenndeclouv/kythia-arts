/**
 * Type definitions for Kythia Arts library
 */

// ============================================
// ENUMS & LITERAL TYPES
// ============================================

export type PresenceStatus =
	| 'online'
	| 'idle'
	| 'offline'
	| 'dnd'
	| 'invisible'
	| 'streaming'
	| 'phone';

export type BorderAlign = 'horizontal' | 'vertical';

export type BadgePosition =
	| 'top-right'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-left';

export type XpBarStyle = 'rounded' | 'sharp' | 'capsule';

export type BarGradientDirection = 'horizontal' | 'vertical' | 'radial';

export type WelcomeType = 'welcome' | 'goodbye';

// ============================================
// UTILITY INTERFACES
// ============================================

/**
 * Border styling configuration
 */
export interface BorderStyle {
	/** Border width in pixels */
	width: number;
	/** Border color (HEX format) */
	color: string;
}

// ============================================
// DISCORD API TYPES
// ============================================

/**
 * Discord badge metadata
 */
export interface DiscordBadge {
	id: string;
	description: string;
	icon: string;
	link?: string;
	name?: string;
}

/**
 * Discord user data from API
 */
export interface DiscordUserData {
	id: string;
	username: string;
	discriminator: string;
	global_name: string | null;
	avatar: string | null;
	avatar_decoration_data: {
		asset: string;
		sku_id: string;
	} | null;
	banner: string | null;
	banner_color: string | null;
	accent_color: number | null;
	clan: {
		identity_guild_id: string;
		identity_enabled: boolean;
		tag: string;
		badge: string;
	} | null;
	badges: DiscordBadge[];
	premium_type: number;
	premium_since: string | null;
	created_at: string;
	bot: boolean;
	bio: string | null;
	public_flags: number;
	/** Computed assets for rendering (internal use) */
	assets?: DiscordUserAssets;
}

/**
 * Computed assets URLs and data
 */
export interface DiscordUserAssets {
	avatarURL: string;
	defaultAvatarURL: string;
	bannerURL: string | null;
	badges: DiscordBadge[];
}

// ============================================
// RANK SYSTEM OPTIONS
// ============================================

/**
 * Rank and leveling system configuration
 */
export interface RankOptions {
	/** Current user XP */
	currentXp: number;
	/** XP required to reach next level */
	requiredXp: number;
	/** Current user level */
	level: number;
	/** User's rank position on leaderboard */
	rank?: number;
	/** XP bar color (single color or gradient array) */
	barColor?: string | string[];
	/** Level text color (HEX) */
	levelColor?: string;
	/** Auto-color ranks as medals for 1st, 2nd, 3rd */
	autoColorRank?: boolean;
	/** Custom rank color (overrides autoColorRank) */
	rankColor?: string;
	/** Custom rank prefix instead of "RANK" */
	rankPrefix?: string;
	/** Hide rank display */
	hideRank?: boolean;
	/** Hide level display */
	hideLevel?: boolean;
	/** Display XP percentage on bar */
	showPercentage?: boolean;
	/** Custom XP bar height in pixels */
	xpBarHeight?: number;
	/** XP bar corner style */
	xpBarStyle?: XpBarStyle;
	/** Gradient flow direction for XP bar */
	barGradientDirection?: BarGradientDirection;
	/** Border configuration for XP bar */
	barBorder?: BorderStyle;
}

// ============================================
// PROFILE CARD OPTIONS
// ============================================

/**
 * Profile card customization options
 */
export interface ProfileOptions {
	// Content Customization
	/** Override displayed username */
	customUsername?: string;
	/** Custom tag text below username */
	customTag?: string;
	/** Custom subtitle text */
	customSubtitle?: string;
	/** Multiple lines of subtitle text */
	multilineSubtitle?: string[];
	/** Custom date or text instead of Discord join date */
	customDate?: Date | string;
	/** Local format for date (e.g., 'en', 'es') */
	localDateType?: string;

	// Badge Customization
	/** Custom badge images (paths or URLs) - 46x46px */
	customBadges?: string[];
	/** Merge custom badges with Discord defaults */
	overwriteBadges?: boolean;
	/** Position of badges */
	badgePosition?: BadgePosition;
	/** Gap between badges in pixels */
	badgeSpacing?: number;
	/** Badge transparency (0.0-1.0) */
	badgeOpacity?: number;
	/** Badge size multiplier (0.5-2.0) */
	badgeScale?: number;
	/** Add background frame behind badges */
	badgesFrame?: boolean;
	/** Remove all badges */
	removeBadges?: boolean;

	// Visual Customization
	/** Custom background image (path or URL) - 885x303px */
	customBackground?: string;
	/** Triple the blur effect on background */
	moreBackgroundBlur?: boolean;
	/** Disable background blur entirely */
	disableBackgroundBlur?: boolean;
	/** Background brightness adjustment (1-100%) */
	backgroundBrightness?: number;
	/** Custom overlay color (rgba/hex) */
	overlayColor?: string;

	// Colors
	/** Username text color (HEX) */
	usernameColor?: string;
	/** Tag text color (HEX) */
	tagColor?: string;
	/** Border color (single or gradient array) */
	borderColor?: string | string[];
	/** Border gradient alignment */
	borderAllign?: BorderAlign;
	/** Disable Discord profile theme colors */
	disableProfileTheme?: boolean;

	// Typography
	/**
	 * Custom font family
	 * @default 'Helvetica'
	 */
	customFont?: string;
	/**
	 * Custom font weight (e.g. 'normal', 'bold', '600')
	 * @default 'bold'
	 */
	fontWeight?: string;
	/** Manual username font size override */
	usernameSize?: number;
	/** Tag font size override */
	tagSize?: number;
	/** Enable text shadow for readability */
	textShadow?: boolean;
	/** Text outline configuration */
	textStroke?: BorderStyle;

	// Avatar
	/** User presence status indicator */
	presenceStatus?: PresenceStatus;
	/** Use square avatar instead of circle */
	squareAvatar?: boolean;
	/** Remove Discord avatar frame/decoration */
	removeAvatarFrame?: boolean;
	/** Border around avatar */
	avatarBorder?: BorderStyle;

	// Layout
	/** Remove border around card */
	removeBorder?: boolean;
	/** Hide creation date display */
	hideDate?: boolean;
	/** Custom canvas width in pixels */
	customWidth?: number;
	/** Custom canvas height in pixels */
	customHeight?: number;

	// Rank System
	/** Rank and leveling configuration */
	rankData?: RankOptions;

	// API Configuration
	/** Discord bot token for direct API access (optional, uses Lanyard if not provided) */
	botToken?: string;
}

// ============================================
// WELCOME BANNER OPTIONS
// ============================================

/**
 * Welcome banner customization options
 */
export interface WelcomeOptions {
	/** Discord bot token for direct API access (optional, uses Lanyard if not provided) */
	botToken?: string;
	// Dimensions
	/** Canvas width in pixels */
	customWidth?: number;
	/** Canvas height in pixels */
	customHeight?: number;

	// Background
	/** Background image (path or URL) */
	customBackground?: string;
	/** Blur amount for background */
	backgroundBlur?: number;
	/** Brightness adjustment (-100 to 100) */
	backgroundBrightness?: number;
	/** Color overlay on background (rgba/hex) */
	overlayColor?: string;

	// Avatar
	/** Avatar diameter in pixels */
	avatarSize?: number;
	/** Avatar border configuration */
	avatarBorder?: BorderStyle;
	/** Avatar Y position offset from default */
	avatarY?: number;

	// Text
	/** Main welcome text (e.g., "WELCOME", "GOODBYE") */
	welcomeText?: string;
	/** Override username display */
	customUsername?: string;
	/** Custom font family */
	customFont?: string;
	/**
	 * Custom font weight (e.g. 'normal', 'bold')
	 * @default 'bold'
	 */
	fontWeight?: string;
	/** Manual font size override for welcome text */
	customFontSize?: number;
	/** Manual font size override for username */
	customUsernameSize?: number;
	/** Welcome text color (HEX) */
	welcomeColor?: string;
	/** Username text color (HEX) */
	usernameColor?: string;
	/** Enable text shadow */
	textShadow?: boolean;
	/** Text outline configuration */
	textStroke?: BorderStyle;
	/** Vertical offset for text block (positive = down, negative = up) */
	textOffsetY?: number;

	// Layout
	/** Banner type */
	type?: WelcomeType;
}
