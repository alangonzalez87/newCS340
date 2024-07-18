const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classification_Id
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

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
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flashMessage: req.flash("este es un mensaje flash"),
  });
} 

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    flashMessage: req.flash('flashMessage')
  })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    req.flash('flashMessage', 'Classification added successfully.')
    res.redirect('/inv/management')
  } catch (error) {
    req.flash('flashMessage', 'Failed to add classification.')
    res.redirect('/inv/add-classification')
  }
}

invCont.renderAddInventory = async function (req, res, next) {
  try {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList();
      res.render("inventory/add-inventory", {
          title: "Add New Inventory",
          nav,
          classificationList,
          formData: {}
      });
  } catch (err) {
        console.error("Error at: /inv/add-inventory", error)
        res.status(500).send("Server Error")
      next(err);
  }
};

invCont.addInventory = async function (req, res, next) {
  try {
      const {
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image_default,
          inv_thumbnail_default,
          inv_price,
          inv_miles,
          inv_color,
          classification_id,
      } = req.body;

      const inv_image = req.file ? req.file.path : inv_image_default;
      const inv_thumbnail = req.file ? req.file.path : inv_thumbnail_default;

      
      await invModel.addInventory({
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image, 
          inv_thumbnail, 
          inv_price,
          inv_miles,
          inv_color,
          classification_id,
      });
      if (result.rowCount === 1) {
        req.flash("message", "Vehicle added successfully");
        res.redirect("/inv/management");
      } else {
        req.flash("message", "Failed to add vehicle");
        res.redirect("/inv/add-inventory");
      }
    } catch (err) {
      console.error("Error at: /inv/add-inventory", err);
      req.flash("message", "Server error");
      res.redirect("/inv/add-inventory");
    }
};


module.exports = invCont