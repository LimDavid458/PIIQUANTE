const validator = require('email-validator');

module.exports = (req, res, next) => {
    const emailValid = validator.validate(req.body.email);
    if (emailValid) {
      next();  
    } else {
      return res.status(400).json( { message: "Please provide a valid email address."} );
    }   
}