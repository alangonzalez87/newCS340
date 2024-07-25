const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControler');
const validate = require('../utilities/commentValidation'); 
const utilities = require("../utilities/");

// Ruta para obtener todos los comentarios
router.get('/comment/comments', commentController.getComments);

// Ruta para agregar un nuevo comentario
router.post('/comments/add', validate.checkCommentData, utilities.handleErrors(commentController.addComment));

module.exports = router;
