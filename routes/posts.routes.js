const express = require("express")
const router = express.Router()
const Post = require("../controller/posts.controller")
const { validate } = require('../middleware/validationHandler')
const { body, param, query } = require('express-validator');
const { verifyAccess } = require("../middleware/auth");

// The method it self indicated that this will fetch something
// the path indicates that this endpoint will return a search result
// If you want to sort order, search query and limit you can use params
router.get("/", Post.getPostsWithQuery)
// for e.g. '/api/posts?limit=5&sortOder="higestVoted"'


// Note while we can replace any of these with POST, it is better to use recommended HTTP protocols
// you can also pass sort order, search query and limit in the body of the requrest
router.post("/search", Post.getPostsByRequestBody)
// for eg.
// body: { search:'how to search in mongo', limit:5, sort:'Unanswered' }


// !!!!!!Make sure to always keep your /:routes at the end. Otherwise it will pick other routes first. !!!!!!
// If you wanted to fetch a specfic post with an Id, use params
router.get("/:id", Post.getById)

// To update a document, use the put or patch
// PUT when you want to update the entire document/create a new document
// PATCH when you might want to update partial changes
router.patch('/:id', Post.editPostById)
// !!!!!!Make sure to always keep your /:routes at the end. Otherwise it will pick other routes first. !!!!!!


// using verifyAccess we make sure that the end point can only be called by an authenticated user
// this middleware will also provide you with the user-id of the user in res.locals.user
// any other data you choose to store in the jwt will also be found in res.locals.user
// this way there is no need to fetch user based on email, 
// and the endpoint will only e able to post by the authenticated user
// verifyAccess must be at the start of an endpoint to make sure we don't waste resources on 
// validPost is a function that will validate if certain criteria is met
// validate is a function that will process the response from any number of validators put in the route
// the validate function must be put at the end of all validation
router.put('/', [ verifyAccess, validPost(), validate ], Post.create)


// To delete a document, use the DELETE method
router.delete('/:id', Post.deletePostById)


module.exports = router


// Validators: see: https://express-validator.github.io/docs/validation-chain-api
// for options see: https://github.com/validatorjs/validator.js
function validPost() {
  return [
    body('title')
      .exists()
      .withMessage('Post must have title')
      .isLength({min:20, max:200})
      .withMessage('Title must be 20-200 characters long'),
    body('body')
      .exists()
      .withMessage('Post must have body')
      .isLength({min:20, max:2000})
      .withMessage('Title must be 20-2000 characters long'),
    body('tags')
      .exists()
      .withMessage('Post must have tags')
      .isArray({min:1,max:5})
      .withMessage('Post must have 1-5 tags')
  ]
}

function validLimit() {
  return [body('limit')
    .isNumeric()
    .withMessage('Username must be alphanumeric.')
  ]
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


