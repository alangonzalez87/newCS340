const commentModel = require('../models/commentModels');
const utilities = require('../utilities/');


const commentController={};


commentController.getComments = async (req, res) => {
    try {
        console.log('Fetching comments...');
        const comments = await commentModel.getComments();
        const highlightedCommentId = comments.length > 0 ? comments[0].comment_id : null;
        const commentsWithHighlight = comments.map(comment => ({
            ...comment,
            is_current: comment.comment_id === highlightedCommentId
        }));
        console.log('Comments fetched:', comments);
        console.log('Rendering comments page...');
        res.render('comment/comments', { comments: commentsWithHighlight, title: 'Comments', });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).send('Server error');
    }
};
// invCont.getComments = async (req, res) => {
//     const comments = await getCommentsFromDatabase(); // Función que obtiene comentarios

//     // Lógica para determinar el comentario destacado (por ejemplo, el más reciente)
//     const highlightedCommentId = comments.length > 0 ? comments[0].comment_id : null; // Ejemplo: destacar el primer comentario

//     // Añadir un atributo is_current a los comentarios
//     const commentsWithHighlight = comments.map(comment => ({
//         ...comment,
//         is_current: comment.comment_id === highlightedCommentId
//     }));

//     res.render('comments', { comments: commentsWithHighlight });
// };




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







    


        
    






