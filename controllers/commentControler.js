const commentModel = require('../models/commentModels');
const utilities = require('../utilities/');




const getComments = async (req, res) => {
    try {
        const comments = await commentModel.getComments();
        res.render('comment/comments', { comments, title: 'Comments' });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).send('Server error');
    }
};


const addComment = async (req, res) => {
    const { commentText, parentCommentId } = req.body;
    const accountId = req.user.id; 
    try {
        await commentModel.addComment(commentText, accountId, parentCommentId);
        res.redirect('/comment/comments');
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getComments,
    addComment
};



