const { body, validationResult } = require('express-validator');
const validate = {}

// const checkCommentData = () => {
//     return [
//         body('commentText').notEmpty().withMessage('Comment text is required'),
//     ];
// };

// const checkComment = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         req.flash('errors', errors.array());
//         return res.redirect('/comments');
//     }
//     next();
// };


validate.addCommentRules = () => {
    return [
        
        body('comment_text')
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage('Please provide a comment text.'),
        
        
        body('comment_author')
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage('Please provide a comment author.')
    ];
};


validate.checkCommentData = async (req, res, next) => {
    const { comment_text, comment_author, parent_comment_id } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('comment/comments', {
            errors: errors.array(),
            title: 'Add Comment',
            comment_text,
            comment_author,
            parent_comment_id
        });
        return;
    }
      
    next();
};

module.exports =  validate

