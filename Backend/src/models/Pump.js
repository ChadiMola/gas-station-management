const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Pump = sequelize.define(
  "Pump",
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
    fuel_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "in_use", "maintenance"),
      defaultValue: "available",
    },
    currentIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    previousIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pricePerLiter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: false,
  }
);

// Associations
Pump.associate = (models) => {
  Pump.hasMany(models.Transaction, {
    foreignKey: "pumpId",
    as: "transactions",
  });
};

module.exports = Pump;
