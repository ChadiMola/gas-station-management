const express = require("express");
const pumpController = require("../controllers/pumpController");
const { verifyToken, isAdmin } = require("../middlewares/authJwt");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pump:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Pump ID
 *         name:
 *           type: string
 *           description: Pump name
 *         fuel_type:
 *           type: string
 *           description: Type of fuel (e.g., Diesel, Regular)
 *         status:
 *           type: string
 *           enum: [available, in_use, maintenance]
 *           description: Current status of the pump
 *         currentIndex:
 *           type: integer
 *           description: Current index
 *         previousIndex:
 *           type: integer
 *           description: Previous index
 *         pricePerLiter:
 *           type: number
 *           format: float
 *           description: Current price per liter
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *       example:
 *         id: "a1b2c3d4-5678-90ab-cdef-123456789abc"
 *         name: "Pompe 1"
 *         fuel_type: "Diesel"
 *         status: "available"
 *         currentIndex: 30000
 *         previousIndex: 1000
 *         pricePerLiter: 1.5
 *         transactions: []
 *     PumpRequest:
 *       type: object
 *       required:
 *         - name
 *         - fuel_type
 *         - pricePerLiter
 *       properties:
 *         name:
 *           type: string
 *         fuel_type:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, in_use, maintenance]
 *         currentIndex:
 *           type: integer
 *         previousIndex:
 *           type: integer
 *         pricePerLiter:
 *           type: number
 *           format: float
 *       example:
 *         name: "Pompe 1"
 *         fuel_type: "Diesel"
 *         status: "available"
 *         currentIndex: 30000
 *         previousIndex: 1000
 *         pricePerLiter: 1.5
 */

// Apply verifyToken middleware to all pump routes
router.use(verifyToken);

/**
 * @swagger
 * /api/pumps:
 *   get:
 *     summary: Get all pumps
 *     description: Retrieve a list of all gas pumps
 *     tags: [Pumps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pumps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pump'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", pumpController.getAllPumps);

/**
 * @swagger
 * /api/pumps/{id}:
 *   get:
 *     summary: Get a pump by ID
 *     description: Retrieve pump details by ID
 *     tags: [Pumps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pump ID
 *     responses:
 *       200:
 *         description: Pump details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pump'
 *       404:
 *         description: Pump not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:id", pumpController.getPumpById);

/**
 * @swagger
 * /api/pumps:
 *   post:
 *     summary: Create a new pump
 *     description: Add a new gas pump (Admin only)
 *     tags: [Pumps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PumpRequest'
 *     responses:
 *       201:
 *         description: Pump created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pump'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       500:
 *         description: Server error
 */
router.post("/", isAdmin, pumpController.createPump);

/**
 * @swagger
 * /api/pumps/{id}:
 *   put:
 *     summary: Update a pump
 *     description: Update an existing pump (Admin only)
 *     tags: [Pumps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pump ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PumpRequest'
 *     responses:
 *       200:
 *         description: Pump updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pump'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Pump not found
 *       500:
 *         description: Server error
 */
router.put("/:id", isAdmin, pumpController.updatePump);

/**
 * @swagger
 * /api/pumps/{id}:
 *   delete:
 *     summary: Delete a pump
 *     description: Delete a gas pump (Admin only)
 *     tags: [Pumps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pump ID
 *     responses:
 *       200:
 *         description: Pump deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Pump not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", isAdmin, pumpController.deletePump);

module.exports = router;
