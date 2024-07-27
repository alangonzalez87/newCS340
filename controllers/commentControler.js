const commentModel = require('../models/commentModels');
const utilities = require('../utilities/');


const commentController={};


commentController.getComments = async (req, res) => {
    try {
        console.log('Fetching comments...');
        const comments = await commentModel.getComments();
        console.log('Comments fetched:', comments);
        console.log('Rendering comments page...');
        res.render('comment/comments', { comments, title: 'Comments', });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).send('Server error');
    }
};


commentController.addComment = async (req, res) => {
    try {
        const { comment_text, comment_author, parentCommentId } = req.body;
        console.log('Adding comment:', comment_text, comment_author, parentCommentId);

       const newComment= await commentModel.addComment(comment_text, comment_author, parentCommentId);

        console.log('Comment added successfully. Redirecting...', newComment);
        res.redirect('/comment/comments'); 
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Server error');
    }
};

module.exports = commentController







    


        
    






