const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@gasstation.com",
        password: await bcrypt.hash("Admin123!", 10),
        role: "admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Super Admin",
        email: "superadmin@gasstation.com",
        password: await bcrypt.hash("SuperAdmin123!", 10),
        role: "super_admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
