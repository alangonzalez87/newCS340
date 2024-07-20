const utilities = require('../utilities/index.js');
const accountModel = require('../models/account-model.js') 
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {};

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

  /* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,

  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

// accountController.accountLogin = async (req, res) => {
//   let nav = await utilities.getNav()
//   const { account_email, account_password } = req.body;
//   const vars = {
//     title: "Login",
//     nav,
//     errors: null,
//     account_email,
    
//   };
//   const accountData = await accountModel.getAccountByEmail(account_email);

//   if (!accountData) {
//     req.flash("notice", "Please check your credentials and try again.");
//     return res.status(400).render("account/login", vars);
//   } else if (accountData.is_blocked) {
//     req.flash("error", "Your account is blocked. Please contact Admin for further assistance.");
//     return res.status(403).render("account/login", vars);
//   }

//   try {
//     if (await bcrypt.compare(account_password, accountData.account_password)) {
//       const jwtData = utilities.getDataForJWT(accountData);
//       res.cookie("jwt", jwtData.accessToken, jwtData.options);

//       return res.redirect("/account/");
//     } else {
//       req.flash("error", "Password is incorrect.");
//       return res.redirect("/account/login");
//     }
//   } catch (error) {
//     console.error(error);
//     return new Error('Access Forbidden')
//   }
// }

//  * Build account management view
//  *************/
// accountController.buildManagement = async function(req, res){
//     let nav = await utilities.getNav();
    
//     try{
//         const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
//         const userData = await accountModel.getAccountById(cookieData.account_id);
//         res.render("./account/management",{
//             title: "Account Management",
           
//             nav,
//             errors: null,
//             account_firstname: userData.account_firstname,
//             account_lastname: userData.account_lastname,
//             account_email: userData.account_email,
//             account_id: userData.account_id,
//             cookieData
//         });
//     }
//     catch (error){
//         throw new Error (error);
//     }
// }
async function buildManagement(req, res) {
  let nav;

  try {
      nav = await utilities.getNav();

      const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      const userData = await accountModel.getAccountById(cookieData.account_id);

      res.render("./account/management", {
          title: "Account Management",
          nav,
          errors: null,
          account_firstname: userData.account_firstname,
          account_lastname: userData.account_lastname,
          account_email: userData.account_email,
          account_id: userData.account_id,
          cookieData
      });
  } catch (error) {
      console.error("Error building account management view:", error);
      res.status(500).send("Server Error");
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountController, buildManagement,accountLogin }