const express = require("express");
const router = express.Router();
const path = require("path");
const rootdir = require("../util/path.js")
const adminController = require("../controllers/admin.js")
const isAuth = require("../middlware/is-auth.js")
const {body} = require("express-validator")



router.get('/add-product',isAuth,adminController.getAddProduct)

router.get('/products',adminController.getProducts);

router.post(
    '/add-product',
    [
      body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
     
      body('price').isFloat(),
      body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],
    isAuth,
    adminController.postAddProduct
  );
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct)

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

// module.exports = router;

exports.routes = router;
// exports.products = products;