const express = require('express')
const router = express.Router()
const controller = require('../controllers/orderController')
const passport = require('passport')
const authorize = require('../middleware/authorize')
const checkId = require('../middleware/checkId')


router.use(passport.authenticate('jwt', { session: false }))
/**
 * Get information about all orders
 */
router.route('/info')
  .get(authorize, controller.getOrdersInfo)

/**
 * Get all orders
 * &&
 * Create new orders
 */
router.route('/')
  .get(controller.getAllOrders)
  .post(controller.createOrder)

/**
 * Get order by id,
 * Update order state and
 * Delete order by ID
 */
router.route('/:id')
  .get(checkId, controller.getOrderById)
  .patch(authorize, controller.updateOrder)
  .delete(checkId, controller.deleteOrder)

module.exports = router
