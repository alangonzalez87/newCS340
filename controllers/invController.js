const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */


invCont.buildByClassificationId = async function (req, res, next) {
  const classificationId = parseInt(req.params.classificationId);
  let tools = utilities.getTools(req);
  console.log("Controller received classificationId:", classificationId);

  if (isNaN(classificationId)) {
    console.error("Invalid classificationId:", req.params.classificationId);
    req.flash("error", "Invalid classification ID");
    return res.redirect("/inv");
  }

  try {
    let nav = await utilities.getNav();
    let tools = utilities.getTools(req);
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
      tools,
      grid,
      data
    });
  } catch (error) {
    console.error("Error at: /inv/type/" + classificationId, error);
    req.flash("error", "Sorry, we appear to have lost the selected classification.");
    
  }
};


/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByVehicleId = async function (req, res, next) {
  const vehicle_id = req.params.vehicleId;
  
  try {
    
    const data = await invModel.getVehicleById(vehicle_id);
    let tools = utilities.getTools(req);
   
    const html = utilities.buildVehicleDetailHTML(data);
    let nav = await utilities.getNav();
    const vehicleName = `${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/detail", {
      title: vehicleName,
      nav,
      tools,
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
  let tools = utilities.getTools(req);
  const classificationSelect = await utilities.buildClassificationList();
  const links = {
    "classification": "/inv/add-classification",
    "inventory": "/inv/add-inventory"
  }
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      tools,
      classificationSelect,
      links    
  });
} 

invCont.buildManagementView = async (req, res, next)=>{
  let nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management",{
      nav,
      tools,
      classificationSelect,
      title: "Inventory Management"
  });
}

invCont.buildNewClassificationView = async (req, res, next)=>{
  let nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  res.render("./inventory/newClassification",{
      nav,
      tools,
      title: "Add New Classification",
      errors: null
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
  let tools = utilities.getTools(req);
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    tools,
    errors: null,
  })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const saveResult = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  if (saveResult){
    
    req.flash("success", `Classification ${classification_name} was successfully added.`);
    res.status(201).render("inventory/management",{
        nav,
        tools,
        title: "Inventory Management",
        errors: null
    });
}else{
  
  req.flash("notice",`Sorry, something went wrong adding ${classification_name}.`)
  res.status(501).render("inventory/newClassification",{
      nav,
      tools,
      title: "Add New Classification",
      errors: null,
      classification_name
  })
}
}


invCont.addNewVehicle = async (req, res) => {
  const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
    inv_miles, inv_color, inv_price, classification_id} = req.body;
    
  const saveResult = await invModel.addInventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
    inv_price,inv_miles, inv_color, classification_id)
  
  const nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  const vars = {
    title: "Add new inventory item",
    nav,
    tools,
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
    res.status(201).render("inventory/newVehicle", vars)
  } else {
    req.flash("notice",
      `Sorry, an inventory item - ${req.body.inv_make} ${req.body.inv_model} was not saved.`)
    res.status(501).render("inventory/newVehicle", vars)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inventory_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async (req, res, next) =>{
  const inventory_id = req.params.inventory_id;
  let nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  const itemData = await invModel.getInventoryDetailsById(inventory_id);
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id);
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render("./inventory/editInventory",{
      title: "Edit "+itemName,
      nav,
      tools,
      errors: null,
      classificationList: classificationSelect,
      inventory_id: itemData[0].inventory_id,
      inv_make: itemData[0].inv_make,
      inv_model: itemData[0].inv_model,
      inv_year: itemData[0].inv_year,
      inv_description: itemData[0].inv_description,
      inv_image: itemData[0].inv_image,
      inv_thumbnail: itemData[0].inv_thumbnail,
      inv_price: itemData[0].inv_price,
      inv_miles: itemData[0].inv_miles,
      inv_color: itemData[0].inv_color,
      inv_isvisible: itemData[0].inv_isvisible,
      classification_id: itemData[0].classification_id
  });
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteInventory = async (req, res, next) =>{
  const inventory_id = req.params.inventory_id;
  let nav = await utilities.getNav();
  let tools = utilities.getTools(req);
  const itemData = await invModel.getInventoryDetailsById(inventory_id);
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render("./inventory/deleteInventory",{
      title: "Delete "+itemName,
      nav,
      tools,
      errors: null,
      inv_id: itemData[0].inv_id,
      inv_make: itemData[0].inv_make,
      inv_model: itemData[0].inv_model,
      inv_year: itemData[0].inv_year,
      inv_price: itemData[0].inv_price
  });
}

invCont.updateInventory = async (req, res, next) =>{
  const {inventory_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,  classification_id} = req.body;
  const modelResult = await invModel.updateVehicle(inventory_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

  if (modelResult){
      req.flash("success", `Vehicle ${inv_model} was successfully updated.`);
      res.status(201).redirect("/inv/management");
  }
  else{
      let nav = await utilities.getNav();
      let tools = utilities.getTools(req);
      let classificationList = await utilities.buildClassificationList(classification_id);
      req.flash("notice",`Sorry, something went wrong updating ${inv_model}.`)
      res.status(501).render("inventory/editInventory",{
          nav,
          tools,
          title: `Edit Vehicle ${inv_make} ${inv_model}`,
          errors: null,
          inv_id,
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price,
          inv_miles, 
          inv_color,
          inv_isvisible, 
          classificationList
      })
  }
}

/* ***************************
 *  Delete an inventory item
 * ************************** */
invCont.deleteInventory = async (req, res, next) =>{
    const {inventory_id, inv_make, inv_model, inv_year, inv_price} = req.body;
    const modelResult = await invModel.deleteVehicle(inventory_id);

    if (modelResult){
        req.flash("success", `Vehicle ${inv_model} was successfully deleted.`);
        res.redirect("/inv/management");
    }
    else{
        let nav = await utilities.getNav();
        let tools = utilities.getTools(req);
        const itemName = inv
        req.flash("notice",`Sorry, something went wrong deleting ${inv_model}.`)
        res.status(501).render("inventory/deleteInventory",{
            nav,
            tools,
            title: `Delete ${itemName}`,
            errors: null,
            inv_id,
            inv_make, 
            inv_model, 
            inv_year, 
            inv_price
        });
    }
}








module.exports = invCont