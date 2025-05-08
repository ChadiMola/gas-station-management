const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    supplier: {
      type: DataTypes.STRING,
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Inventory;
