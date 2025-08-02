const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const links = sequelize.define(
    "Links",
    {
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "links",
    }
  );

  return links;
};
