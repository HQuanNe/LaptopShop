const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

router.post('/', optionalToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/:orderCode', orderController.getOrderByCode);

module.exports = router;
