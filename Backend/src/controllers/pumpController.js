const { Pump, Transaction } = require("../models");

// Get all pumps
exports.getAllPumps = async (req, res) => {
  try {
    const pumps = await Pump.findAll({
      include: [{ model: Transaction, as: "transactions" }],
      order: [["createdAt", "ASC"]],
    });

    // Map to required structure
    const result = pumps.map((pump) => ({
      id: pump.id,
      name: pump.name,
      currentIndex: pump.currentIndex,
      previousIndex: pump.previousIndex,
      pricePerLiter: parseFloat(pump.pricePerLiter),
      transactions: (pump.transactions || []).map((tx) => ({
        id: tx.id,
        date: tx.timestamp,
        shift: tx.shift,
        previousIndex: tx.previousIndex,
        currentIndex: tx.currentIndex,
        litersDispensed: parseFloat(tx.litersDispensed),
        pricePerLiter: parseFloat(tx.pricePerLiter),
        revenue: parseFloat(tx.revenue),
      })),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching pumps:", error);
    return res
      .status(500)
      .json({ message: "Error fetching pumps", error: error.message });
  }
};

// Get pump by ID
exports.getPumpById = async (req, res) => {
  try {
    const { id } = req.params;
    const pump = await Pump.findByPk(id, {
      include: [{ model: Transaction, as: "transactions" }],
    });

    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    const result = {
      id: pump.id,
      name: pump.name,
      currentIndex: pump.currentIndex,
      previousIndex: pump.previousIndex,
      pricePerLiter: parseFloat(pump.pricePerLiter),
      transactions: (pump.transactions || []).map((tx) => ({
        id: tx.id,
        date: tx.timestamp,
        shift: tx.shift,
        previousIndex: tx.previousIndex,
        currentIndex: tx.currentIndex,
        litersDispensed: parseFloat(tx.litersDispensed),
        pricePerLiter: parseFloat(tx.pricePerLiter),
        revenue: parseFloat(tx.revenue),
      })),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching pump:", error);
    return res
      .status(500)
      .json({ message: "Error fetching pump", error: error.message });
  }
};

// Create new pump
exports.createPump = async (req, res) => {
  try {
    const {
      name,
      fuel_type,
      pricePerLiter,
      status,
      currentIndex,
      previousIndex,
    } = req.body;

    const newPump = await Pump.create({
      name,
      fuel_type,
      pricePerLiter,
      status: status || "available",
      currentIndex: currentIndex || 0,
      previousIndex: previousIndex || 0,
    });

    return res.status(201).json({
      message: "Pump created successfully",
      pump: newPump,
    });
  } catch (error) {
    console.error("Error creating pump:", error);
    return res
      .status(500)
      .json({ message: "Error creating pump", error: error.message });
  }
};

// Update pump
exports.updatePump = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      fuel_type,
      pricePerLiter,
      status,
      currentIndex,
      previousIndex,
    } = req.body;

    const pump = await Pump.findByPk(id);

    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    await pump.update({
      name: name || pump.name,
      fuel_type: fuel_type || pump.fuel_type,
      pricePerLiter: pricePerLiter || pump.pricePerLiter,
      status: status || pump.status,
      currentIndex:
        currentIndex !== undefined ? currentIndex : pump.currentIndex,
      previousIndex:
        previousIndex !== undefined ? previousIndex : pump.previousIndex,
    });

    return res.status(200).json({
      message: "Pump updated successfully",
      pump,
    });
  } catch (error) {
    console.error("Error updating pump:", error);
    return res
      .status(500)
      .json({ message: "Error updating pump", error: error.message });
  }
};

// Delete pump
exports.deletePump = async (req, res) => {
  try {
    const { id } = req.params;

    const pump = await Pump.findByPk(id);

    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    await pump.destroy();

    return res.status(200).json({
      message: "Pump deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pump:", error);
    return res
      .status(500)
      .json({ message: "Error deleting pump", error: error.message });
  }
};
