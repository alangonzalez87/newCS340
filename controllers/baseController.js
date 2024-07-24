const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  let tools = utilities.getTools(req);
  
  res.render("index", {title: "Home", nav, tools})
  req.flash("notice", "This is a flash message.")
 
}

module.exports = baseController