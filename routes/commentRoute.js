const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentControler');
const validate = require('../utilities/commentValidation'); 
const utilities = require("../utilities/");


router.get('/comments', commentController.getComments);


router.post('/comments',
    validate.addCommentRules(),
    validate.checkCommentData,
    commentController.addComment
);


module.exports = router;
