const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const validate = {}
// const accountModel = require("../models/account-model")

/*  **********************************
  *  New Classification Rules
  * ********************************* */
validate.classificationRules = () =>{
    return [
        //firstname is required and must be string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid classification.") //error message
            .custom(value => !/\s/.test(value))
            .withMessage("Please provide a valid classification.") //error message
    ]
}

/*  **********************************
  *  New Vehicle Rules
  * ********************************* */
validate.inventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a Make."),
  
      body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a Model."),
  
      body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Year.")
        .isNumeric()
        .withMessage("Year must be a number.")
        .isLength({ min: 4, max: 4 })
        .withMessage("Year must be a four-digit number."),
  
      body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Description."),
  
      body("inv_image")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide an Image path."),
  
      body("inv_thumbnail")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Thumbnail path."),
  
      body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Price.")
        .isNumeric()
        .withMessage("Price must be a number."),
  
      body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide Miles.")
        .isNumeric()
        .withMessage("Miles must be a number."),
  
      body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Color."),
  
      body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a Classification.")
        .isNumeric()
        .withMessage("Classification must be a number."),
    ]
  }
  
/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) =>{
    const {classification_name} = req.body;
    let errors = [];
    errors = validationResult(req);
    if(!errors.isEmpty()){
        let nav = await utilities.getNav();
        let tools = utilities.getTools(req);
        res.render("inventory/newClassification", {
            tools,
            nav,
            title: "Add New Classification",
            errors,
            classification_name
        });
        return;
    }
    else{
        next();
    }
}

/* ******************************
 * Check data and return errors or continue to add vehicle
 * ***************************** */
validate.checkInventory = async (req, res, next) =>{
    const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
        inv_miles, inv_color, inv_price, classification_id} = req.body;
    let errors = [];
    errors = validationResult(req);
    if(!errors.isEmpty()){
        let nav = await utilities.getNav();
        
        let classificationList = await utilities.buildClassificationList(classification_id);
        res.render("inventory/newVehicle", {
            
            nav,
            title: "Add New Vehicle",
            errors,
            inv_make, 
            inv_model, 
            inv_year, 
            inv_description, 
            inv_image, 
            inv_thumbnail,
            inv_price, 
            inv_miles, 
            inv_color, 
            classificationList
        });
        return;
    }
    else{
        next();
    }
}
//goback to the edition
validate.checkUpdateData = async (req, res, next) =>{
  const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
      inv_miles, inv_color, inv_price,inv_id, classification_id} = req.body;
  let errors = [];
  errors = validationResult(req);
  if(!errors.isEmpty()){
      let nav = await utilities.getNav();
      
      let classificationList = await utilities.buildClassificationList(classification_id);
      res.render("inventory/editInventory", {
          
          nav,
          title: "Edit Vehicle",
          errors,
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail,
          inv_price, 
          inv_miles, 
          inv_color, 
          inv_id,
          classificationList
      });
      return;
  }
  else{
      next();
  }
}





module.exports = validate
        