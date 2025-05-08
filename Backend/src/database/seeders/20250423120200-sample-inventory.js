const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Inventories", [
      {
        id: uuidv4(),
        name: "Motor Oil",
        category: "Car Accessories",
        quantity: 50,
        unit_price: 25.99,
        supplier: "AutoSupplies Inc.",
        low_stock_threshold: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Windshield Wiper Fluid",
        category: "Car Accessories",
        quantity: 35,
        unit_price: 4.99,
        supplier: "AutoSupplies Inc.",
        low_stock_threshold: 8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Energy Drink",
        category: "Beverages",
        quantity: 120,
        unit_price: 2.49,
        supplier: "RefreshCo",
        low_stock_threshold: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Chocolate Bar",
        category: "Snacks",
        quantity: 85,
        unit_price: 1.25,
        supplier: "SnackWorld",
        low_stock_threshold: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Air Freshener",
        category: "Car Accessories",
        quantity: 40,
        unit_price: 3.99,
        supplier: "AutoSupplies Inc.",
        low_stock_threshold: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Inventories", null, {});
  },
};
