<p align="center">
  <a href="https://kythia.my.id">
    <img src="https://files.catbox.moe/alnl1h.png" alt="Kythia Logo" height="150" style="border-radius: 10px;">
  </a>
</p>

<h1 align="center">
  Kythia Arts
</h1>


A powerful, production-ready **TypeScript** library for generating beautiful Discord profile cards, welcome banners, and more using Canvas.

[![npm version](https://img.shields.io/npm/v/kythia-arts.svg)](https://www.npmjs.com/package/kythia-arts)
[![Downloads](https://img.shields.io/npm/dm/kythia-arts.svg)](https://www.npmjs.com/package/kythia-arts)

## ✨ What's New in v0.1.0

- 🎯 **Full TypeScript Support** - Migrated from JavaScript to TypeScript
- 📘 **Auto-generated Type Definitions** - Perfect IntelliSense & autocomplete
- 🔌 **Dual API Support** - Choose between Lanyard API (default) or Discord API (with bot token)
- 🛡️ **Strict Type Safety** - Catch errors at compile time
- 📦 **Smaller Bundle** - Optimized build output
- 🚀 **Better DX** - Enhanced developer experience with full typing

## 🏗️ Architecture Overview

Kythia arts follows a **clean, modular architecture** designed for scalability and maintainability. Perfect for developers who want to understand, extend, or contribute to the codebase.

### Project Structure

```
kythia-arts/
├── src/
│   ├── generators/        # 🎯 Public API entry points
│   │   ├── profile.ts     # Profile card generator
│   │   └── welcome.ts     # Welcome banner generator
│   │
│   ├── renderers/         # 🎨 Canvas rendering logic
│   │   ├── profile.ts     # Profile rendering functions
│   │   └── welcome.ts     # Welcome rendering functions
│   │
│   ├── composers/         # 🎼 Layer composition
│   │   ├── profile.ts     # Combines profile layers
│   │   └── welcome.ts     # Combines welcome layers
│   │
│   ├── services/          # 🌐 External integrations
│   │   ├── lanyard-api.ts # Lanyard API client (default)
│   │   └── discord-api.ts # Discord API client (requires bot token)
│   │
│   ├── errors/            # ⚠️ Custom error classes
│   │   └── index.ts       # KythiaArtsError
│   │
│   ├── types/             # 📝 TypeScript type definitions
│   │   └── index.ts       # All interfaces and types
│   │
│   └── utils/             # 🛠️ Pure utility functions
│       ├── canvas.ts      # Canvas dimension helpers
│       ├── color.ts       # Color parsing utilities
│       ├── text.ts        # Text processing functions
│       └── validation.ts  # Input validation
│
├── public/                # 📦 Static assets
│   ├── fonts/             # Font files
│   └── profile-image.files.json
│
├── dist/                  # 📤 Compiled output (published to npm)
│   ├── index.js           # Main entry point
│   ├── index.d.ts         # Type definitions
│   └── ...                # All compiled modules
│
├── index.ts               # TypeScript entry point
└── tsconfig.json         # TypeScript configuration
│   ├── fonts/             # Font files
│   └── profile-image.files.json
│
├── index.js               # Main entry point
└── index.d.ts            # TypeScript definitions
```

### Design Patterns

#### 1. **Separation of Concerns**

Each layer has a specific responsibility:

- **Generators** (`src/generators/`): Handle user input, validate parameters, orchestrate data fetching and rendering
- **Composers** (`src/composers/`): Combine multiple rendering layers into final output
- **Renderers** (`src/renderers/`): Pure rendering functions, no business logic
- **Services** (`src/services/`): External API integrations
- **Utils** (`src/utils/`): Stateless, reusable helper functions

#### 2. **Dependency Flow**

```
User Code
    ↓
Generators (Public API)
    ↓
Services (Data Fetching) + Composers (Layer Orchestration)
    ↓
Renderers (Canvas Drawing)
    ↓
Utils (Helper Functions)
```

#### 3. **Error Handling**

```javascript
// All errors use KythiaArtsError for consistent error handling
const KythiaArtsError = require('./src/errors');

try {
  await profileImage(userId);
} catch (error) {
  if (error.name === 'KythiaArtsError') {
    // Handle library-specific errors
  }
}
```

###  Adding New Features

#### Example: Adding a "Level Up" Card

```bash
# 1. Create renderer
src/renderers/levelup.js

# 2. Create composer
src/composers/levelup.js

# 3. Create generator
src/generators/levelup.js

# 4. Export from index.js
module.exports = {
  profileImage,
  welcomeBanner,
  levelUpCard  // ← Add here
};

# 5. Add TypeScript definitions
index.d.ts
```

## 📌 What's New

- 🎊 **NEW: Welcome Banner Generator** - Beautiful welcome/goodbye banners!
- ✨ **25+ New Customization Options** - Comprehensive control over every aspect
- 🎨 Typography Controls - Custom fonts, sizes, shadows, and strokes
- 🏅 Enhanced Rank System - Hide/show elements, custom prefixes, percentage display
- 🎯 Badge Positioning - Place badges anywhere (top/bottom, left/right)
- 📊 Advanced XP Bars - Custom heights, styles (rounded/sharp/capsule), borders
- 🌈 Gradient Control - Vertical, horizontal, or radial XP bar gradients
- 🖼️ Avatar decorations/frames
- 🎴 Automatic profile theme colors
- 🔮 Booster badges are back
- 🛡️ Automod and LegacyUsername badges

## 🚀 Installation

```bash
npm install kythia-arts
```

## 🔌 API Configuration

Kythia Arts uses the Discord API directly to fetch full user data including badges, banners, premium info, and avatar decorations. 

**A Discord bot token is required.**

```typescript
import { profileImage } from 'kythia-arts';

// Use Discord API with bot token
const buffer = await profileImage('1158654757183959091', {
  botToken: process.env.DISCORD_BOT_TOKEN,
  // ... other options
});
```

**Requirements:**
- Discord bot token
- Bot must have proper intents and permissions

**Features Available via API:**
- ✅ Full badge data
- ✅ Banner images
- ✅ Avatar decorations
- ✅ Premium info
- ✅ Works for any user

## 🖼️ Card Types

### 🪄 profileImage(userId, imgOptions?)

Generate a profile image card for a user or bot, including badges and custom options.

**Returns:** Promise<Buffer>

### 🎊 welcomeBanner(userId, welcomeOptions?)

Generate a beautiful welcome or goodbye banner with centered avatar and custom text.

**Returns:** Promise<Buffer>

## 📚 API Reference  

### Profile Card Options

<details>
<summary><b>Core Options (imgOptions)</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| customUsername | string | Customize the username | - |
| customTag | string | Text below the user | - |
| customSubtitle | string | Text below the custom tag | - |
| multilineSubtitle | string[] | Multiple lines of subtitle text | - |
| customBadges | string[] | Your own png badges (path and URL) (46x46) | - |
| customBackground | string | Change the background to any image (path and URL) (885x303) | - |
| overwriteBadges | boolean | Merge your badges with the discord defaults | false |
| badgesFrame | boolean | Creates a small frame behind the badges | false |
| removeBadges | boolean | Removes badges, whether custom or from discord | false |
| removeBorder | boolean | Removes the image border, custom and normal | false |
| usernameColor | string | Username HEX color | #FFFFFF |
| tagColor | string | Tag HEX color | #dadada |
| borderColor | string \| string[] | Border HEX color, can be gradient if 2 colors are used | - |
| borderAllign | string | Gradient alignment if 2 colors are used ('horizontal'\|'vertical') | horizontal |
| disableProfileTheme | boolean | Disable the discord profile theme colors | false |
| presenceStatus | string | User status to be displayed ('online'\|'idle'\|'dnd'\|'offline'\|'invisible'\|'streaming'\|'phone') | - |
| squareAvatar | boolean | Change avatar shape to a square | false |
| removeAvatarFrame | boolean | Remove the discord avatar frame/decoration (if any) | false |
| rankData | object | Rank data options (see below) | - |
| moreBackgroundBlur | boolean | Triples blur of background image | false |
| backgroundBrightness | number | Set brightness of background from 1-100% | - |
| overlayColor | string | Custom overlay color on background (rgba/hex) | rgba(42,45,51,0.2) |
| customDate | Date \| string | Custom date or text to use instead of when user joined Discord | - |
| localDateType | string | Local format for the date, e.g. 'en' \| 'es' etc. | - |
| hideDate | boolean | Hide the creation date display | false |
| customWidth | number | Custom canvas width in pixels | 885 |
| customHeight | number | Custom canvas height in pixels | 303 |

</details>

<details>
<summary><b>Typography Options</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| customFont | string | Font family override | Helvetica |
| usernameSize | number | Manual username font size override | auto-calculated |
| tagSize | number | Tag font size override | 60 |
| textShadow | boolean | Enable text shadow for readability | false |
| textStroke | object | Text outline `{ width: number, color: string }` | - |

</details>

<details>
<summary><b>Badge Customization</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| badgePosition | string | Badge placement ('top-right'\|'top-left'\|'bottom-right'\|'bottom-left') | top-right |
| badgeSpacing | number | Gap between badges in pixels | 59 |
| badgeOpacity | number | Badge transparency (0.0-1.0) | 1.0 |
| badgeScale | number | Badge size multiplier (0.5-2.0) | 1.0 |

</details>

<details>
<summary><b>Visual Effects</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| avatarBorder | object | Border around avatar `{ width: number, color: string }` | - |

</details>

<details>
<summary><b>Rank Data Options (rankData)</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| currentXp | number | Current user XP (required) | - |
| requiredXp | number | XP required to level up (required) | - |
| level | number | Current user level (required) | - |
| rank | number | Position on the leaderboard | - |
| barColor | string \| string[] | HEX XP bar color, can be gradient | - |
| levelColor | string | HEX color of LVL text | #dadada |
| autoColorRank | boolean | Color ranks as medals for 1st, 2nd, 3rd | false |
| rankColor | string | Custom rank color (overrides autoColorRank) | #dadada |
| rankPrefix | string | Custom rank prefix instead of "RANK" | RANK |
| hideRank | boolean | Hide rank display | false |
| hideLevel | boolean | Hide level display | false |
| showPercentage | boolean | Display XP percentage on bar | false |
| xpBarHeight | number | Custom bar thickness in pixels | 36 |
| xpBarStyle | string | Bar corner style ('rounded'\|'sharp'\|'capsule') | rounded |
| barGradientDirection | string | Gradient flow ('horizontal'\|'vertical'\|'radial') | horizontal |
| barBorder | object | Border around XP bar `{ width: number, color: string }` | - |

</details>

### Welcome Banner Options

<details>
<summary><b>welcomeOptions</b></summary>

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| customWidth | number | Canvas width in pixels | 1024 |
| customHeight | number | Canvas height in pixels | 500 |
| customBackground | string | Background image (path or URL) | User banner/avatar |
| backgroundBlur | number | Blur amount for background | 3 |
| backgroundBrightness | number | Brightness adjustment (-100 to 100) | 0 |
| overlayColor | string | Color overlay on background (rgba/hex) | rgba(0,0,0,0.4) |
| avatarSize | number | Avatar diameter in pixels | 220 |
| avatarBorder | object | Avatar border `{ width: number, color: string }` | { width: 8, color: '#FFFFFF' } |
| removeAvatarFrame | boolean | Remove the discord avatar frame/decoration (if any) | false |
| avatarY | number | Avatar Y position offset | 80 |
| welcomeText | string | Main text (e.g., "WELCOME", "GOODBYE") | WELCOME |
| customUsername | string | Override username display | User's display name |
| customFont | string | Font family | Helvetica |
| customFontSize | number | Manual font size override | 80 |
| customUsernameSize | number | Manual username font size override | 40 |
| welcomeColor | string | Welcome text color (HEX) | #FFFFFF |
| usernameColor | string | Username text color (HEX) | #FFFFFF |
| textShadow | boolean | Enable text shadow | true |
| textStroke | object | Text outline `{ width: number, color: string }` | - |
| type | string | Banner type ('welcome' \| 'goodbye') | welcome |

</details>

## 📃 Code Examples

### Profile Image

```javascript
const { AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

await interaction.deferReply();
const user = interaction.options.getUser('user-option');

const buffer = await profileImage(user.id, {
  customTag: 'Admin',
  squareAvatar: true,
  rankData: {
    currentXp: 1500,
    requiredXp: 2000,
    level: 15,
    rank: 3
  }
});

interaction.followUp({ files: [new AttachmentBuilder(buffer)] });
```

### Welcome Banner

```javascript
const { AttachmentBuilder } = require('discord.js');
const { welcomeBanner } = require('discord-arts');

// Basic welcome banner
client.on('guildMemberAdd', async (member) => {
  const buffer = await welcomeBanner(member.id);
  
  const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
  const welcomeChannel = member.guild.channels.cache.get('CHANNEL_ID');
  
  welcomeChannel.send({ 
    content: `Welcome to the server, ${member}!`,
    files: [attachment] 
  });
});
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kenndeclouv/kythia-arts
cd kythia-arts

# Install dependencies
npm install

# Link for local testing
yalc publish
```

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Adding New Features

1. Create renderer in `src/renderers/`
2. Create composer in `src/composers/`
3. Create generator in `src/generators/`
4. Add TypeScript definitions in `index.d.ts`
5. Update README with examples
6. Test thoroughly

## 📜 License

This project is licensed under the CC BY-NC 4.0 License. See the [LICENSE](LICENSE) file for details.
Copyright © 2025 Kythia Labs - All rights reserved.

---

## 💬 Community & Support

Need help or want to connect with other Kythia users? Join our community!

*   **🌐 My Website:** [kenndeclouv.me](https://kenndeclouv.me)
*   **💬 Discord Server:** [dsc.gg/kythia](https://dsc.gg/kythia)
*   **📧 Email:** [kenndeclouv@gmail.com](mailto:kenndeclouv@gmail.com)
