const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken");

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ]
}
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  // account-validation.js
validate.loginRules = () =>{
    return  [
        
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("An valid email must be informed")
            .custom(async (account_email)=>{
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (!emailExists){
                    throw new Error("Email not registered. Please register to log in.");
                }
            }),
        
        
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage("Password does not meet requirements.")
    ]
}


validate.checkClassification = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flashMessage: req.flash('flashMessage'),
      errors: errors.array(),
    })
  } else {
    next()
  }
}
validate.checkLoginData = async (req, res, next) =>{
  const {account_email} = req.body;
  let  errors = [];
  errors = validationResult(req);
  if(!errors.isEmpty()){
      let nav = await utilities.getNav();
      res.render("account/login",{
          errors,
          title: "Login",
          nav,
          account_email
      })
      return;
  }
  else{
      next();
  }
}

// validate.checkInventory = async (req, res, next) => {
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     let nav = await utilities.getNav()
//       let classificationList = await utilities.buildClassificationList();
//       res.render("inventory/add-inventory", {
//           title: "Add New Inventory",
//           nav,
//           classificationList,
//           errors 
//       });
//   } else {
//     next()
//   }
// }

module.exports = validate

  
 