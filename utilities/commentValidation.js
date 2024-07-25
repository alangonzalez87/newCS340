const { body, validationResult } = require('express-validator');

const checkCommentData = () => {
    return [
        body('commentText').notEmpty().withMessage('Comment text is required'),
    ];
};

const checkComment = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        return res.redirect('/comments');
    }
    next();
};

module.exports = {
    checkCommentData,
    checkComment
};

