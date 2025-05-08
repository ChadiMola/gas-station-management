const { Transaction, Pump } = require("../models");
const { Op } = require("sequelize");

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: Pump, as: "pump" }],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id, {
      include: [{ model: Pump, as: "pump" }],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return res
      .status(500)
      .json({ message: "Error fetching transaction", error: error.message });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { pumpId, currentIndex, shift } = req.body;

    // Verify pump exists
    const pump = await Pump.findByPk(pumpId);
    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    const previousIndex = pump.currentIndex;
    const litersDispensed = currentIndex - previousIndex;
    const pricePerLiter = pump.pricePerLiter;
    const revenue = litersDispensed * pricePerLiter;

    // Create the transaction
    const newTransaction = await Transaction.create({
      pumpId,
      previousIndex,
      currentIndex,
      litersDispensed,
      shift,
      pricePerLiter,
      revenue,
      timestamp: new Date(),
    });

    // Update pump indices and status
    await pump.update({
      previousIndex: previousIndex,
      currentIndex: currentIndex,
      status: "in_use",
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res
      .status(500)
      .json({ message: "Error creating transaction", error: error.message });
  }
};

// Generate sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = {};

    if (startDate && endDate) {
      whereClause = {
        timestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    } else if (startDate) {
      whereClause = {
        timestamp: {
          [Op.gte]: new Date(startDate),
        },
      };
    } else if (endDate) {
      whereClause = {
        timestamp: {
          [Op.lte]: new Date(endDate),
        },
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [{ model: Pump, as: "pump" }],
      order: [["timestamp", "DESC"]],
    });

    // Calculate totals
    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount),
      0
    );
    const totalLiters = transactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.liters),
      0
    );

    // Group by payment method
    const paymentMethodSummary = transactions.reduce((acc, transaction) => {
      const method = transaction.payment_method;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += parseFloat(transaction.amount);
      return acc;
    }, {});

    // Group by fuel type
    const fuelTypeSummary = transactions.reduce((acc, transaction) => {
      const fuelType = transaction.pump.fuel_type;
      if (!acc[fuelType]) {
        acc[fuelType] = { count: 0, amount: 0, liters: 0 };
      }
      acc[fuelType].count += 1;
      acc[fuelType].amount += parseFloat(transaction.amount);
      acc[fuelType].liters += parseFloat(transaction.liters);
      return acc;
    }, {});

    return res.status(200).json({
      totalTransactions: transactions.length,
      totalAmount,
      totalLiters,
      paymentMethodSummary,
      fuelTypeSummary,
      transactions,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    return res
      .status(500)
      .json({ message: "Error generating sales report", error: error.message });
  }
};
