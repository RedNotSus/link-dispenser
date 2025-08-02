const { type } = require("os");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserLinkData = sequelize.define(
    "UserLinkData",
    {
      User: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      FirstUsed: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      LinksGiven: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "user-link-data",
    }
  );

  return UserLinkData;
};
