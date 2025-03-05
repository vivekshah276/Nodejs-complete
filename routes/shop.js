
const path = require("path");
const express = require("express");
const router = express.Router();
const rootdir = require("../util/path.js");
const admindata = require("./admin.js")
const shopController = require("../controllers/shop.js")
const isAuth = require("../middlware/is-auth.js")

// const products = admindata.products;

router.get('/',shopController.getIndex);

router.get('/products/',shopController.getProducts)

router.get('/products/:productId',shopController.getProduct);

router.get('/cart',isAuth,shopController.getCart);

router.post('/cart',isAuth,shopController.postCart);

router.post('/cart-delete-item',isAuth,shopController.postCartDeleteProduct);

router.get('/orders',isAuth,shopController.getOrders);
router.get('/orders/:orderId',isAuth,shopController.getInvoice)

router.post('/create-order',isAuth,shopController.postOrder)

router.get('/checkout',isAuth,shopController.getCheckout)

module.exports = router;