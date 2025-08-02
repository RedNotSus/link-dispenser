# 🔗 Link Dispenser

A modern Discord bot for dispensing unblocked website links with monthly user limits and comprehensive management features.

## ✨ Features

### 🎯 Discord Bot Features

- **`/panel`** - Display the link dispenser panel with a "Get Link" button
- **`/admin`** - Admin panel with buttons for link management (view, add, remove)
- **`/reset <user>`** - Reset a user's monthly link limit
- **Monthly Limits** - 3 links per user per month, automatically resets
- **DM Delivery** - Links are sent privately to users with action buttons
- **Owner Protection** - Commands restricted to bot owner (ID: 735641273477890178)

### 🌐 Web API

- **RESTful API** - Manage links and users programmatically
- **Real-time Statistics** - Track usage and user activity
- **Secure Authentication** - API key-based access control
- **CORS Support** - Cross-origin requests enabled

### 📊 Web Dashboard

- **Interactive Admin Panel** - Manage links through a web interface
- **User Management** - View and reset user limits
- **Live Statistics** - Real-time system metrics
- **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL database
- Discord bot token

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RedNotSus/link-dispenser.git
   cd link-dispenser
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here

# Database URL (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# API Key for web interface
API_KEY=your-secure-api-key-here

# Server Port (optional, defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=development
```

### Discord Bot Setup

1. Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a bot and copy the token
3. Invite the bot to your server with appropriate permissions:
   - Send Messages
   - Use Slash Commands
   - Send Messages in DMs
   - Read Message History

## 📖 Usage

### Discord Commands

**`/panel`** (Owner Only)

- Displays the main link dispenser panel
- Users can click "Get Link" to receive a DM with their link

**`/admin`** (Owner Only)

- Opens the admin panel with management options
- View all links in the database
- Add new links via modal
- Remove existing links with confirmation

**`/reset <user>`** (Owner Only)

- Resets the specified user's monthly link limit
- Useful for special cases or troubleshooting

### Web Dashboard

Access the web dashboard at `http://localhost:3000` (or your configured port).

Features:

- **Link Management** - Add/remove links with instant updates
- **User Management** - View user statistics and reset limits
- **System Statistics** - Monitor bot usage and performance
- **API Key Authentication** - Secure access control

### API Endpoints

All endpoints require authentication via `X-API-Key` header or `api_key` query parameter.

| Method | Endpoint                   | Description       |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/health`              | Health check      |
| GET    | `/api/stats`               | System statistics |
| GET    | `/api/links`               | Get all links     |
| POST   | `/api/links`               | Add new link      |
| DELETE | `/api/links/:id`           | Remove link       |
| GET    | `/api/users`               | Get user data     |
| POST   | `/api/users/:userId/reset` | Reset user limit  |

### Example API Usage

```javascript
// Add a new link
fetch("/api/links", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "your-api-key",
  },
  body: JSON.stringify({
    url: "https://example.com",
  }),
});

// Get system statistics
fetch("/api/stats?api_key=your-api-key")
  .then((response) => response.json())
  .then((data) => console.log(data.statistics));
```

## 🔒 Security Features

- **Owner-Only Commands** - Critical functions restricted to bot owner
- **API Key Authentication** - Secure web interface access
- **Rate Limiting** - Monthly user limits prevent abuse
- **Input Validation** - URL validation and sanitization
- **Error Handling** - Comprehensive error management

## 🗄️ Database Schema

The bot uses PostgreSQL with the following models:

**Links**

- `id` - Primary key
- `link` - Website URL
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**UserLinkData**

- `User` - Discord user ID
- `Remaining` - Links remaining this month
- `LinksGiven` - Total links given this month
- `FirstUsed` - First usage timestamp (for monthly reset)

## 🎨 Customization

### Embed Colors

The bot uses `#5e7694` as the primary color. You can modify this in:

- `/src/commands/Utility/panel.js`
- `/src/commands/Utility/admin.js`
- `/src/events/interactionCreate.js`

### Monthly Reset Logic

Monthly limits reset exactly one month from the user's first usage. This is handled automatically in `handleGetLink()`.

### Owner ID

Change the owner ID in all command files by replacing `735641273477890178` with your Discord user ID.

## 📱 Mobile Support

The web dashboard is fully responsive and works on:

- Desktop browsers
- Mobile phones
- Tablets
- Progressive Web App capabilities

## 🛠️ Development

### Project Structure

```
src/
├── commands/Utility/     # Discord slash commands
├── database/            # Database configuration
├── events/              # Discord event handlers
├── models/              # Database models
├── api.js              # Express API server
└── index.js            # Main bot file

public/                  # Web dashboard files
```

### Adding New Features

1. **New Discord Commands** - Add to `src/commands/Utility/`
2. **New API Endpoints** - Add to `src/api.js`
3. **Database Changes** - Modify models in `src/models/`
4. **Web Interface** - Update `public/index.html`

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions:

- Create an issue on GitHub
- Check the Discord.js documentation
- Review the API documentation in the web dashboard

---

**Made with ❤️ for the Discord community**
