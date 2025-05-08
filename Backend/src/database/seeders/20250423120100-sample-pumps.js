const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Pumps", [
      {
        id: uuidv4(),
        name: "Pump 1",
        fuel_type: "Regular",
        status: "available",
        price_per_liter: 3.45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Pump 2",
        fuel_type: "Premium",
        status: "available",
        price_per_liter: 3.85,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Pump 3",
        fuel_type: "Diesel",
        status: "available",
        price_per_liter: 3.65,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Pump 4",
        fuel_type: "Regular",
        status: "maintenance",
        price_per_liter: 3.45,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Pumps", null, {});
  },
};
