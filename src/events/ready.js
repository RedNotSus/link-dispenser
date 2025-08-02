const config = require("../config");
const fs = require("fs");
const path = require("path");
const { sequelize, syncDatabase } = require("../database");
const databaseURL = process.env.DATABASE_URL;

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.logs.info(`[SCHEMAS] Started loading schemas...`);

    if (!databaseURL) return;

    try {
      await sequelize.authenticate();
      await syncDatabase();

      const color = {
        red: "\x1b[31m",
        orange: "\x1b[38;5;202m",
        yellow: "\x1b[33m",
        green: "\x1b[32m",
        blue: "\x1b[34m",
        pink: "\x1b[38;5;213m",
        torquise: "\x1b[38;5;45m",
        purple: "\x1b[38;5;57m",
        reset: "\x1b[0m",
      };

      function getTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      client.logs.success("[DATABASE] Connected to PostgreSQL successfully.");

      const schemaFolder = path.join(__dirname, "../models");
      fs.readdir(schemaFolder, (err, files) => {
        if (err) {
          client.logs.error("[ERROR] Error reading models folder:", err);
          return;
        }
        client.logs.success(`[SCHEMAS] Loaded ${files.length} model files.`);
      });
    } catch (error) {
      client.logs.error("[DATABASE] Failed to connect to PostgreSQL:", error);
      return;
    }

    client.logs.logging(`[BOT] ${client.user.username} has been launched!`);
    client.logs.info(`[EVENTS] Started loading events...`);
    client.logs.success(
      `[EVENTS] Loaded ${client.eventNames().length} events.`
    );

    const triggerFolder = path.join(__dirname, "../triggers");
    fs.readdir(triggerFolder, (err, files) => {
      if (err) {
        client.logs.error("Error reading trigger folder:", err);
        return;
      }
      client.logs.info(`[TRIGGERS] Started loading triggers...`);
      client.logs.success(`[TRIGGERS] Loaded ${files.length} trigger files.`);
    });

    require("events").EventEmitter.defaultMaxListeners = config.eventListeners;
  },
};
