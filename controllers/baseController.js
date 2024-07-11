const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  req.flash("notice", "This is a flash message.")
  console.log("Flash message set:", req.flash("notice")); // Mensaje de depuración
  res.render("index", {title: "Home", nav})
 

}

module.exports = baseController