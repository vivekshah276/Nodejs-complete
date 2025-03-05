const express = require("express");
const authController = require('../controllers/auth')
const { check,body } = require("express-validator")
const User = require("../models/user.js")

const router = express.Router();

router.get('/login',authController.getLogin)

router.post('/login',
[
    check('email').isEmail().withMessage("please enter valid mail"),
    body('password',"wrong password")

],authController.postLogin)

router.get('/signup',authController.getSignup)
router.post('/signup',
    [
        check('email').isEmail().withMessage("please enter valid mail").custom((value,{req})=>{
            return User.findOne({email: value})
            .then((user)=>{
                if(user){
                    return Promise.reject("Email is already exist")
                }
               
            })
        }),
        body('password',"wrong password").isLength({min:5, max:12}).isAlphanumeric(),
        body('confirmPassword').custom((value, {req})=>{
            if(value !== req.body.password){
                throw new Error("password not matched")
            }
            return true
        })
    ]
    ,authController.postSignup)
router.post('/logout',authController.postLogout)
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)

module.exports = router;