const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */


invCont.buildByClassificationId = async function (req, res, next) {
  const classificationId = parseInt(req.params.classificationId);
  console.log("Controller received classificationId:", classificationId);

  if (isNaN(classificationId)) {
    console.error("Invalid classificationId:", req.params.classificationId);
    req.flash("error", "Invalid classification ID");
    return res.redirect("/inv");
  }

  try {
    let nav = await utilities.getNav();
    let data = await invModel.getInventoryByClassificationId(classificationId);
    const grid = await utilities.buildClassificationGrid(data)
    console.log("Data received from model:", data);

    if (data.length === 0) {
      console.error("No inventory found for classification ID:", classificationId);
      throw new Error("No inventory found for the selected classification");
    }

    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      data
    });
  } catch (error) {
    console.error("Error at: /inv/type/" + classificationId, error);
    req.flash("error", "Sorry, we appear to have lost the selected classification.");
    
  }
};

// invCont.buildByClassificationId = async function (req, res, next) {
//   const classification_id = req.params.classification_Id
//   console.log("controller received classificationId", classification_id);
//   const data = await invModel.getInventoryByClassificationId(classification_id)
//   if(data.length > 0){
//      const grid = await utilities.buildClassificationGrid(data)
//      let nav = await utilities.getNav()
//     const className = data[0].classification_name
//     res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//     errors: null,
//   });
//   }
//   else{
//     next({status: 500, message: "Sorry, we appear to have lost the selected classification."});
//   }
  
// }

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByVehicleId = async function (req, res, next) {
  const vehicle_id = req.params.vehicleId;
  
  try {
    
    const data = await invModel.getVehicleById(vehicle_id);
    
   
    const html = utilities.buildVehicleDetailHTML(data);
    let nav = await utilities.getNav();
    const vehicleName = `${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/detail", {
      title: vehicleName,
      nav,
      html,
    });
  } catch (error) {
    
    next(error);
  }
};
/* ***************************
 *  Build inventory management view
 * ************************** */

invCont.buildManagement = async (req, res, next) =>{
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();
  const links = {
    "classification": "/inv/add-classification",
    "inventory": "/inv/add-inventory"
  }
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      links    
  });
} 

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddNewVehicleView = async (req, res, next)=>{
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/newVehicle",{
      nav,
     
      title: "Add New Vehicle",
      classificationList,
      errors: null
  });
}
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const saveResult = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav();
  if (saveResult){
    
    req.flash("success", `Classification ${classification_name} was successfully added.`);
    res.status(201).render("inventory/management",{
        nav,
       
        title: "Inventory Management",
        errors: null
    });
}else{
  
  req.flash("notice",`Sorry, something went wrong adding ${classification_name}.`)
  res.status(501).render("inventory/newClassification",{
      nav,
      title: "Add New Classification",
      errors: null,
      classification_name
  })
}
}

// invCont.addNewVehicle = async (req, res, next) => {
//   const {inv_make, inv_model, inv_year, inv_description, 
//     inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, 
//     classification_id} = req.body;

//   const modelResult = await invModel.addInventory(
//     inv_make, inv_model, inv_year, inv_description, 
//     inv_image, inv_thumbnail, inv_price, inv_miles, 
//     inv_color, classification_id);

//   if (modelResult){
//       let nav = await utilities.getNav();
      
//       req.flash("success", `Vehicle ${inv_model} was successfully added.`);
//       res.status(201).render("inventory/management",{
//           nav,
//           title: "Inventory Management",
//       });
//   }
//   else{
//       let nav = await utilities.getNav();
      
//       let classificationList = await utilities.buildClassificationList(classification_id);
//       req.flash("notice",`Sorry, something went wrong adding ${inv_model}.`)
//       res.status(501).render("inventory/newVehicle",{
//           nav,
//           tools,
//           title: "Add New Vehicle",
//           errors: null,
//           inv_make, 
//           inv_model, 
//           inv_year, 
//           inv_description, 
//           inv_image, 
//           inv_thumbnail, 
//           inv_price,
//           inv_miles, 
//           inv_color, 
//           classificationList
//       })
//   }
// }

invCont.addNewVehicle = async (req, res) => {
  const saveResult = await invModel.saveInventory(req.body)
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  const vars = {
    title: "Add new inventory item",
    nav,
    classificationList,
    errors: null,
    formData: req.body
  }

  if (saveResult) {
    req.flash(
      "notice",
      `Congratulations, a new inventory item - 
      ${req.body.inv_make} ${req.body.inv_model} was successfully saved.`
    )
    res.status(201).render("inventory/add-inventory", vars)
  } else {
    req.flash("notice",
      `Sorry, an inventory item - ${req.body.inv_make} ${req.body.inv_model} was not saved.`)
    res.status(501).render("inventory/add-inventory", vars)
  }
}


module.exports = invCont