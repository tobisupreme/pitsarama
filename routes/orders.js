const express = require('express')
const router = express.Router()
const orderModel = require('../models/orderModel')

/**
 * Get information about all orders
 */
router.get('/info', async (req, res, next) => {
  try {
    const orders = await orderModel.find({})
    const resObj = {}
    resObj.numberOfOrders = orders.length
    resObj.states = orders.reduce((obj, x) => {
      if (!obj[x.state]) obj[x.state] = 0
      obj[x.state]++
      return obj
    }, {})
    return res.json({ status: true, data: resObj })
  } catch (err) {
    next(err)
  }
})

/**
 * Get all orders
 */
router.get('/', async (req, res, next) => {
  try {
    const orders = await orderModel.find({})

    return res.json({ status: true, orders })
  } catch (err) {
    next(err)
  }
})

/**
 * Get order by id
 */
router.get('/:orderId', async (req, res, next) => {
  const { orderId } = req.params
  try {
    const order = await orderModel.findById(orderId)
    if (!order) {
      return res.status(404).json({ status: false, order: null })
    }
    return res.json({ status: true, order })
  } catch (err) {
    next(err)
  }
})

/**
 * Create a new order
 */
router.post('/', async (req, res) => {
  const body = req.body

  const total_price = body.items.reduce((prev, curr) => {
    return (prev += curr.quantity * curr.price)
  }, 0)

  const orderObject = {
    items: body.items,
    total_price,
  }

  const order = new orderModel(orderObject)
  order
    .save()
    .then((result) => {
      return res.status(201).json({ status: true, result })
    })
    .catch((err) => {
      res.status(500)
      console.log('Error creating order', err.message)
      return res.json({ error: 'Error creating order' })
    })
})

/**
 * Update order state
 */
router.patch('/:id', async (req, res, next) => {
  const { id } = req.params
  const { state } = req.body

  try {
    const order = await orderModel.findById(id)

    if (!order) {
      return res.status(404).json({ status: false, order: null })
    }

    if (state < order.state) {
      return res.status(422).json({ status: false, order: null, message: 'Invalid operation' })
    }

    order.state = state

    await order.save()

    return res.json({ status: true, order })
  } catch (err) {
    next(err)
  }
})

/**
 * Delete order
 */
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const order = await orderModel.findOne({ _id: id })
    const deleted = await order.remove()
    if (deleted) {
      return res.status(204).json({ status: true })
    }
  } catch (err) {
    next(err)
  }
})

/**
 * Error handler middleware
 */
 const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Unable to lookup order with provided ID' })
  }

  return res.status(500).send({ error: 'Sorry, error occured' })
}

router.use(errorHandler)

module.exports = router
