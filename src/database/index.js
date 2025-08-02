const { Sequelize } = require("sequelize");

// Database configuration with SSL handling
const getDialectOptions = () => {
  const baseOptions = {};

  // Only add SSL if explicitly enabled or if it's a requirement
  if (process.env.DATABASE_SSL === "true") {
    baseOptions.ssl = { rejectUnauthorized: false };
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.DATABASE_SSL !== "false"
  ) {
    // Try SSL first in production, but allow fallback
    baseOptions.ssl = { rejectUnauthorized: false };
  }

  return baseOptions;
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: getDialectOptions(),
  define: {
    schema: "public",
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,
    match: [
      /ConnectionError/,
      /ConnectionRefusedError/,
      /ConnectionTimedOutError/,
      /TimeoutError/,
    ],
  },
});

const Nickname = require("../models/nicknames")(sequelize);
const Username = require("../models/usernames")(sequelize);
const AFK = require("../models/AFK")(sequelize);
const Links = require("../models/links")(sequelize);
const UserLinkData = require("../models/userLinkData")(sequelize);
const UserSentLinks = require("../models/userSentLinks")(sequelize);

const syncDatabase = async () => {
  try {
    // Test the connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Sync the database
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    // If SSL error, try to reconnect without SSL
    if (error.message.includes("SSL") || error.message.includes("ssl")) {
      console.log("🔄 Retrying database connection without SSL...");
      try {
        // Create new sequelize instance without SSL
        const sequelizeNoSSL = new Sequelize(process.env.DATABASE_URL, {
          dialect: "postgres",
          logging: process.env.NODE_ENV === "development" ? console.log : false,
          dialectOptions: {}, // No SSL options
          define: {
            schema: "public",
          },
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        });

        await sequelizeNoSSL.authenticate();
        console.log("✅ Database connected successfully without SSL");

        // Replace the global sequelize instance
        Object.assign(sequelize, sequelizeNoSSL);

        await sequelize.sync({ alter: true });
        console.log("✅ Database synced successfully");
      } catch (retryError) {
        console.error(
          "❌ Database connection failed even without SSL:",
          retryError.message
        );
        throw retryError;
      }
    } else {
      throw error;
    }
  }
};

module.exports = {
  sequelize,
  Nickname,
  Username,
  AFK,
  syncDatabase,
  Links,
  UserLinkData,
  UserSentLinks,
};
