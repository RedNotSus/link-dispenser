const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AFK = sequelize.define(
    "AFK",
    {
      guild: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "afk_schemas",
      indexes: [
        {
          unique: true,
          fields: ["guild", "user"],
        },
      ],
    }
  );

  return AFK;
};
