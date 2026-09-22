const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { optionalToken } = require('../middleware/authMiddleware');

router.get('/metadata', productController.getMetadata);
router.get('/featured', productController.getFeaturedProducts);
router.get('/compare', productController.compareProducts);
router.get('/', productController.getAllProducts);
router.get('/:idOrSlug', optionalToken, productController.getProductByIdOrSlug);

module.exports = router;
