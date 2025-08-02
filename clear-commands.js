const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

async function clearCommands() {
  try {
    console.log("🧹 Clearing global slash commands...");

    // Clear global commands
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    console.log("✅ Successfully cleared global slash commands.");

    if (GUILD_ID) {
      console.log(`🧹 Clearing guild slash commands for guild ${GUILD_ID}...`);

      // Clear guild commands
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: [],
      });
      console.log("✅ Successfully cleared guild slash commands.");
    }

    console.log(
      "🎉 All commands cleared! Restart the bot to re-register only guild commands."
    );
  } catch (error) {
    console.error("❌ Error clearing commands:", error);
  }
}

clearCommands();
