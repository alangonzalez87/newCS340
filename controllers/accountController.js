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
  async function update(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update",
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
  const { account_firstname, 
          account_lastname, 
          account_email, 
          account_password 
        } = req.body

  
  let hashedPassword
  try {
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
    hashedPassword
  );

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
     } 
          else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
                }
                return res.redirect("/account/")
   }
  } catch (error) {
        return new Error('Access Forbidden')
  }
 }


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

 /************************
 * Process logout request
 **********************/
 async function logout (req, res, next){
  if(req.cookies.jwt){
      req.flash("success", "Have a great day!")
      res.clearCookie("jwt")
      return res.status(200).redirect("/");
  }
  else{
      req.flash("notice", "You are not logged in")
      return res.status(401).redirect("/account/login");
  }
}

/* ***************************
 *  Update Account
 * ************************** */



async function updateAccount(req, res, next) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body;

  try {
    
    const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

    
    const modelResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);

    if (modelResult) {
      
      res.clearCookie("jwt");

      
      delete modelResult.account_password;

      
      const accessToken = jwt.sign(modelResult, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

      
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV !== 'development'
      };
      res.cookie("jwt", accessToken, cookieOptions);

      // Mostrar mensaje de éxito y redirigir
      req.flash("success", `${modelResult.account_firstname}, your account was successfully updated.`);
      res.redirect("/account/");
    } else {
      // En caso de fallo, renderizar la vista de gestión de cuenta con un mensaje de error
      const nav = await utilities.getNav();
      const tools = utilities.getTools(req);
      req.flash("notice", `Sorry, ${account_firstname} something went wrong.`);
      res.status(501).render("./account/management", {
        nav,
        tools,
        title: `Account Management`,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        cookieData
      });
    }
  } catch (error) {
    
    res.status(500).send('Server error');
    throw error
    
  }
}



/* ***************************
 *  Update Password
 * ************************** */

async function updatePassword(req, res, next) {
  const {
    account_password,
    account_id
  } = req.body;

  try {
    
    const cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

    // Hashear la nueva contraseña de forma asíncrona
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Actualizar la contraseña en la base de datos
    const modelResult = await accountModel.updateAccountPassword(hashedPassword, account_id);

    if (modelResult) {
      req.flash("success", `${cookieData.account_firstname}, your password was successfully updated.`);
      res.redirect("/account/");
    } else {
      const nav = await utilities.getNav();
      const tools = utilities.getTools(req);
      
      req.flash("notice", `Sorry, ${cookieData.account_firstname} something went wrong.`);
      res.status(501).render("account/management", {
        nav,
        tools,
        title: `Account Management`,
        errors: null,
        account_firstname: cookieData.account_firstname,
        account_lastname: cookieData.account_lastname,
        account_email: cookieData.account_email,
        account_id: cookieData.account_id,
        cookieData
      });
    }
  } catch (error) {
    // Manejar errores, como problemas con la verificación JWT
    console.error(error);
    res.status(500).send('Server error');
  }
}

// async function updatePassword (req, res, next) {
//   const {
//       account_password,
//       account_id
//   } = req.body;
//   let cookieData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
//   const hashedPassword = await bcrypt.hashSync(account_password, 10);
//   const modelResult = await accountModel.updateAccountPassword(hashedPassword, account_id);

//   if (modelResult){
//       req.flash("success", `${cookieData.account_firstname}, your passsord was successfully updated.`);
//       res.redirect("/account/");
//   }
//   else{
//       let nav = await utilities.getNav();
//       let tools = utilities.getTools(req);
      
//       req.flash("notice",`Sorry, ${account_firstname} something went wrong.`)
//       res.status(501).render("account/management",{
//           nav,
//           tools,
//           title: `Account Management`,
//           errors: null,
//           account_firstname: cookieData.account_firstname,
//           account_lastname: cookieData.account_lastname,
//           account_email: cookieData.account_email,
//           account_id: cookieData.account_id,
//           cookieData
//       })
//   }
// }


module.exports = { buildLogin,
   buildRegister, 
   registerAccount,
   accountController, 
   buildManagement,
   accountLogin,
   logout,
   updatePassword,
   updateAccount,
   update,
    }