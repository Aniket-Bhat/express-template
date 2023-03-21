const express = require("express")
const router = express.Router()
const User = require("../controller/user.controller")
const { validate } = require('../middleware/validationHandler')
const { body, param, query } = require('express-validator');
const { verifyAccess } = require("../middleware/auth");


// When fetching private user information, it's best to fetch it via user data.
router.get("/", verifyAccess, User.getByJWT)

// If you wanted to fetch a publicly available user data 
// you can pass the userID in params, or in the body of the request
// !!!Make sure to keep this route at the end!!!
router.get("/:username", User.getByUsername)

// To update a document, use the put or patch
// PUT when you want to update the entire document
// PATCH when you might want to update partial changes
router.patch('/', verifyAccess, User.edit)

// To delete a document, use the DELETE method
router.delete('/', verifyAccess, User.deleteUser)

// Note while we can replace any of these with POST, it is better to use recommended HTTP protocols
// you can also pass sort order, search query and limit in the body of the requrest
router.post("/login", User.login)
router.post("/logout", verifyAccess, User.logout)
router.post("/login-status", verifyAccess, User.isLogin)



module.exports = router


// Validators: see: https://express-validator.github.io/docs/validation-chain-api
// for options see: https://github.com/validatorjs/validator.js
function validSearchQuery() {
  return [
    query('search')
      .exists()
      .withMessage('Search query is required')
  ]
}

function isUsername() {
  return [body('username')
    .exists().withMessage('Username is required')
    .isAlphanumeric('en-US')
    .withMessage('Username must be alphanumeric.')
    .isLength({max:12})
    .withMessage(`Username can't be longer than 12 characters.`)]
}

function isEmail() {
  return [body('emailID')
    .exists().withMessage('Email is required')
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email')]
}

function isOTP() {
  return body('otp')
    .exists().withMessage('OTP is required')
    .isAlpha('en-US')
    .withMessage('Invalid OTP')
    .isLength({min:6,max:6})
    .withMessage('Invalid OTP')
    // ideal to use the .bail() function before a custom validator. 
    // Also use them if you have many stages of validation
    .bail()
    .custom(async(value, { req }) =>{
      const [token, error] = await promiseMe(OTPToken.findOne({ token:value, email:req.body.emailID }))
      if(!token) return Promise.reject('Token Expired')
      if(error) return Promise.reject('Error in fetching OTP')
      req.locals.token = token;
    })
}


