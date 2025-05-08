const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pumpId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    liters: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    previousIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    litersDispensed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shift: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pricePerLiter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    revenue: {
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
Transaction.associate = (models) => {
  Transaction.belongsTo(models.Pump, { foreignKey: "pumpId", as: "pump" });
};

module.exports = Transaction;
