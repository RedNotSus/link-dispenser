# Environment Variables for Production Deployment

## Required Variables

DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_discord_guild_id_here (optional for global commands)
DATABASE_URL=postgresql://username:password@host:port/database

## Optional Variables

API_KEY=your_api_key_for_web_interface
PORT=3000
NODE_ENV=production

## Database SSL Configuration

# Set to "false" to disable SSL (use this if getting SSL connection errors)

DATABASE_SSL=false

# Set to "true" to force SSL connections

# DATABASE_SSL=true

## Development Variables (not needed in production)

DEV_ID=your_discord_user_id_for_development

## Notes for Coolify Deployment:

1. Set DATABASE_SSL=false in your environment variables if you're getting SSL connection errors
2. Make sure your DATABASE_URL is correctly formatted for your PostgreSQL instance
3. The bot will automatically register slash commands on startup
4. API will be available on the configured PORT (default 3000)
5. Set NODE_ENV=production for production deployments
