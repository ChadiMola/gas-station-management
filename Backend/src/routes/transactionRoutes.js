const express = require("express");
const transactionController = require("../controllers/transactionController");
const { verifyToken, isAdmin } = require("../middlewares/authJwt");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Transaction ID
 *         pumpId:
 *           type: string
 *           format: uuid
 *           description: ID of the pump used
 *         amount:
 *           type: number
 *           format: float
 *           description: Total transaction amount
 *         liters:
 *           type: number
 *           format: float
 *           description: Amount of fuel in liters
 *         paymentMethod:
 *           type: string
 *           description: Method of payment
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Date and time of transaction
 *         previousIndex:
 *           type: integer
 *         currentIndex:
 *           type: integer
 *         litersDispensed:
 *           type: number
 *           format: float
 *         shift:
 *           type: string
 *         pricePerLiter:
 *           type: number
 *           format: float
 *         revenue:
 *           type: number
 *           format: float
 *       example:
 *         id: "b4e1e3f0-1234-4c1e-9b2a-123456789abc"
 *         pumpId: "a1b2c3d4-5678-90ab-cdef-123456789abc"
 *         amount: 1500
 *         liters: 1000
 *         paymentMethod: cash
 *         timestamp: "2025-04-29T08:16:37.891Z"
 *         previousIndex: 0
 *         currentIndex: 1000
 *         litersDispensed: 1000
 *         shift: morning
 *         pricePerLiter: 1.5
 *         revenue: 1500
 *     TransactionRequest:
 *       type: object
 *       required:
 *         - pumpId
 *         - currentIndex
 *         - shift
 *       properties:
 *         pumpId:
 *           type: string
 *           format: uuid
 *         currentIndex:
 *           type: integer
 *         shift:
 *           type: string
 *       example:
 *         pumpId: "a1b2c3d4-5678-90ab-cdef-123456789abc"
 *         currentIndex: 1000
 *         shift: morning
 *     SalesReport:
 *       type: object
 *       properties:
 *         totalTransactions:
 *           type: integer
 *         totalAmount:
 *           type: number
 *           format: float
 *         totalLiters:
 *           type: number
 *           format: float
 *         paymentMethodSummary:
 *           type: object
 *         fuelTypeSummary:
 *           type: object
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *       example:
 *         totalTransactions: 2
 *         totalAmount: 58500
 *         totalLiters: 30000
 *         paymentMethodSummary:
 *           cash: { count: 2, amount: 58500 }
 *         fuelTypeSummary:
 *           Diesel: { count: 2, amount: 58500, liters: 30000 }
 *         transactions: []
 */

// Apply verifyToken middleware to all transaction routes
router.use(verifyToken);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering transactions
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering transactions
 *       - in: query
 *         name: pumpId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by pump ID
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", transactionController.getAllTransactions);

/**
 * @swagger
 * /api/transactions/report:
 *   get:
 *     summary: Get sales report
 *     description: Generate a sales report with statistics
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Sales report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesReport'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/report", transactionController.getSalesReport);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     description: Retrieve transaction details by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:id", transactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Record a new fuel purchase transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", transactionController.createTransaction);

module.exports = router;
