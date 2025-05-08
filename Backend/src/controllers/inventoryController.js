const { Inventory } = require("../models");
const { Op, Sequelize } = require("sequelize");

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      order: [["name", "ASC"]],
    });
    return res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return res
      .status(500)
      .json({
        message: "Error fetching inventory items",
        error: error.message,
      });
  }
};

// Get inventory item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return res
      .status(500)
      .json({ message: "Error fetching inventory item", error: error.message });
  }
};

// Create new inventory item
exports.createInventory = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit_price,
      supplier,
      low_stock_threshold,
    } = req.body;

    const newItem = await Inventory.create({
      name,
      category,
      quantity: quantity || 0,
      unit_price,
      supplier,
      low_stock_threshold: low_stock_threshold || 10,
    });

    return res.status(201).json({
      message: "Inventory item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return res
      .status(500)
      .json({ message: "Error creating inventory item", error: error.message });
  }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      quantity,
      unit_price,
      supplier,
      low_stock_threshold,
    } = req.body;

    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await item.update({
      name: name || item.name,
      category: category || item.category,
      quantity: quantity !== undefined ? quantity : item.quantity,
      unit_price: unit_price || item.unit_price,
      supplier: supplier || item.supplier,
      low_stock_threshold: low_stock_threshold || item.low_stock_threshold,
    });

    return res.status(200).json({
      message: "Inventory item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return res
      .status(500)
      .json({ message: "Error updating inventory item", error: error.message });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await item.destroy();

    return res.status(200).json({
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return res
      .status(500)
      .json({ message: "Error deleting inventory item", error: error.message });
  }
};

// Get low stock inventory items
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: {
        quantity: {
          [Op.lte]: Sequelize.col("low_stock_threshold"),
        },
      },
      order: [["quantity", "ASC"]],
    });

    return res.status(200).json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return res
      .status(500)
      .json({
        message: "Error fetching low stock items",
        error: error.message,
      });
  }
};
