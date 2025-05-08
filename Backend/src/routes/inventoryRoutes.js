const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const { verifyToken, isAdmin } = require("../middlewares/authJwt");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Inventory item ID
 *         name:
 *           type: string
 *           description: Name of the inventory item
 *         category:
 *           type: string
 *           description: Category of the item
 *         quantity:
 *           type: integer
 *           description: Current quantity in stock
 *         minThreshold:
 *           type: integer
 *           description: Minimum threshold for low stock alerts
 *         costPrice:
 *           type: number
 *           format: float
 *           description: Cost price per unit
 *         sellingPrice:
 *           type: number
 *           format: float
 *           description: Selling price per unit
 *         supplier:
 *           type: string
 *           description: Supplier name
 *         lastRestocked:
 *           type: string
 *           format: date-time
 *           description: Date and time when last restocked
 *       example:
 *         id: 1
 *         name: Snickers
 *         category: Candy
 *         quantity: 45
 *         minThreshold: 10
 *         costPrice: 0.75
 *         sellingPrice: 1.50
 *         supplier: ABC Distributors
 *         lastRestocked: "2025-04-15T10:30:00Z"
 *     InventoryRequest:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - quantity
 *         - minThreshold
 *         - costPrice
 *         - sellingPrice
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the inventory item
 *         category:
 *           type: string
 *           description: Category of the item
 *         quantity:
 *           type: integer
 *           description: Current quantity in stock
 *         minThreshold:
 *           type: integer
 *           description: Minimum threshold for low stock alerts
 *         costPrice:
 *           type: number
 *           format: float
 *           description: Cost price per unit
 *         sellingPrice:
 *           type: number
 *           format: float
 *           description: Selling price per unit
 *         supplier:
 *           type: string
 *           description: Supplier name
 *       example:
 *         name: Snickers
 *         category: Candy
 *         quantity: 45
 *         minThreshold: 10
 *         costPrice: 0.75
 *         sellingPrice: 1.50
 *         supplier: ABC Distributors
 */

// Apply verifyToken middleware to all inventory routes
router.use(verifyToken);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     description: Retrieve a list of all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", inventoryController.getAllInventory);

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get low stock items
 *     description: Retrieve a list of inventory items with stock below their minimum threshold
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of low stock items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/low-stock", inventoryController.getLowStockItems);

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get an inventory item by ID
 *     description: Retrieve inventory item details by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: Inventory item not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:id", inventoryController.getInventoryById);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     description: Add a new inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryRequest'
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       500:
 *         description: Server error
 */
router.post("/", isAdmin, inventoryController.createInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     description: Update an existing inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryRequest'
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.put("/:id", isAdmin, inventoryController.updateInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     description: Delete an inventory item (Admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", isAdmin, inventoryController.deleteInventory);

module.exports = router;
