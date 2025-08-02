const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
  define: {
    schema: "public",
  },
});

const Nickname = require("../models/nicknames")(sequelize);
const Username = require("../models/usernames")(sequelize);
const AFK = require("../models/AFK")(sequelize);
const Links = require("../models/links")(sequelize);
const UserLinkData = require("../models/userLinkData")(sequelize);

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
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
};
