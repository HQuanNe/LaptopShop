const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Tất cả các routes admin đều yêu cầu đăng nhập và có quyền admin
router.use(verifyToken, requireAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

router.get('/users', adminController.getAdminUsers);

module.exports = router;
