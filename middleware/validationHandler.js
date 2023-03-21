const { validationResult } = require('express-validator');

module.exports = {
  validate: function validate (req, res, next){
    const errors = validationResult(req)
    console.log('errors', errors)
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
}