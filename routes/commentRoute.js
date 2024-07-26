const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControler');
const validate = require('../utilities/commentValidation'); 
const utilities = require("../utilities/");

// Ruta para obtener todos los comentarios
router.get('/comments', commentController.getComments);

// Ruta para agregar un nuevo comentario
router.post('/comments', validate.checkCommentData, utilities.handleErrors(commentController.addComment));

module.exports = router;
