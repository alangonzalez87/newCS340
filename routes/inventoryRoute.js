// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const validate = require("../utilities/account-validation")
const invValidate = require("../utilities/inventory-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route for vehicle detail
router.get('/detail/:vehicleId', invController.buildByVehicleId)

// Ruta para la vista de gestión de inventario
router.get("/management", invController.buildManagement)

router.get('/add-classification', invController.buildAddClassification)
router.post('/add-classification', validate.classificationRules(), validate.checkClassification, invController.addClassification)

// router.get('/add-inventory', invController.renderAddInventory)
router.get("/add-inventory", invController.buildAddNewVehicleView);
router.post('/add-inventory',
invValidate.inventoryRules(),
invValidate.checkInventory,
invController.addNewVehicle)

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory));

router.post("/update", invController.updateInventory)

router.get("/delete/:inventory_id",  utilities.handleErrors(invController.buildDeleteInventory));
//Route to delete an inventory item
router.post("/delete", utilities.handleErrors(invController.deleteInventory))

module.exports = router;