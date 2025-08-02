const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Nickname = sequelize.define(
    "Nickname",
    {
      discordId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guildId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nicknames: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["discordId", "guildId"],
        },
      ],
    }
  );

  return Nickname;
};
