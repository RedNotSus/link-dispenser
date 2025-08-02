const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Username = sequelize.define("Username", {
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    usernames: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  });

  return Username;
};
