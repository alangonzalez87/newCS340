// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const validate = require("../utilities/account-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route for vehicle detail
router.get('/detail/:vehicleId', invController.buildByVehicleId)

// Ruta para la vista de gestión de inventario
router.get("/management", invController.buildManagement)

router.get('/add-classification', invController.buildAddClassification)
router.post('/add-classification', validate.classificationRules(), validate.checkClassification, invController.addClassification)

module.exports = router;