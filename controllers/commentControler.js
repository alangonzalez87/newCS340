const commentModel = require('../models/commentModels');
const utilities = require('../utilities/');



// Mostrar todos los comentarios
const getComments = async (req, res) => {
    try {
        const comments = await commentModel.getComments();
        res.render('comments', { comments, title: 'Comments' });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).send('Server error');
    }
};

// Agregar un nuevo comentario
const addComment = async (req, res) => {
    const { commentText, parentCommentId } = req.body;
    const accountId = req.user.id; // Asegúrate de tener el ID del usuario en req.user
    try {
        await commentModel.addComment(commentText, accountId, parentCommentId);
        res.redirect('/comments');
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getComments,
    addComment
};



