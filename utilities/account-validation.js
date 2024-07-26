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
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("must be at least 8 characters and contain at least 1 number, 1 capital letter and 1 special character, ")
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


validate.checkClassification = async  (req, res, next) => {
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

/*  **********************************
  *  Update Password Rules
  * ********************************* */
validate.updatePasswordRules = () =>{
  return [
      
      body("account_password")
          .trim()
          .notEmpty()
          .isStrongPassword({
              minLength: 8,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
          })
          .withMessage("Password does not meet requirements.")
  ]
}


validate.updateAccountRules = () =>{
    return [
        //firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), 
        
       
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:2 })
            .withMessage("Please provide a last name."), //error message

        //valid email is required and cannot already exist in db
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid mail is required.") //error message
            .custom(async (account_email)=>{
                const modelResult = await accountModel.checkExistingEmail(account_email);
                if (modelResult.account_email != body.account_email ){
                    throw new Error("Email exists. Please log in or use a different email.");
                }
            })
    ]
}

/* ******************************
 * Check update data and return errors or continue to update account
 * ***************************** */
validate.checkAccountUpdateData = async (req, res, next) =>{
  const {account_firstname, account_lastname, account_email, account_id} = req.body;
  let errors = [];
  errors = validationResult(req);
  if(!errors.isEmpty()){
      let nav = await utilities.getNav();
      let tools = utilities.getTools(req);
      const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      res.render("account/management",{
          errors,
          title: "Account Management",
          tools,
          nav,
          account_firstname,
          account_lastname,
          account_email,
          account_id,
          cookieData
      });
      return
  }
  next();
}


validate.checkUpdatePassword = async (req, res, next) =>{
 
  let errors = [];
  errors = validationResult(req);
  if(!errors.isEmpty()){
      let nav = await utilities.getNav();
      let tools = utilities.getTools(req);
      const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      console.log(cookieData)
      res.render("account/management",{
          errors,
          title: "Account Management",
          tools,
          nav,
          account_firstname: cookieData.account_firstname,
          account_lastname: cookieData.account_lastname,
          account_email: cookieData.account_email,
          account_id: cookieData.account_id,
          cookieData
      });
      return
  }
  next();
}
module.exports = validate

  
 