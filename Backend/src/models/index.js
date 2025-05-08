const User = require("./User");
const Pump = require("./Pump");
const Transaction = require("./Transaction");
const Inventory = require("./Inventory");
const Expense = require("./Expense");

// Define relationships
Transaction.belongsTo(Pump, { foreignKey: "pump_id", as: "pump" });
Pump.hasMany(Transaction, { foreignKey: "pump_id", as: "transactions" });

// Export models
module.exports = {
  User,
  Pump,
  Transaction,
  Inventory,
  Expense,
};
