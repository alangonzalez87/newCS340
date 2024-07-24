const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation')


router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/logout", utilities.handleErrors(accountController.logout));
router.get("/update", utilities.handleErrors(accountController.update));
router.post("/update",
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount));

router.post("/updatePassword",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePassword,
  utilities.handleErrors(accountController.updatePassword));  


// router.get('/login', accountController.buildLogin)
router.get("/register", utilities.handleErrors(accountController.buildRegister));


// Process the registration data

router.post('/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


// Process the login request
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))




module.exports = router;