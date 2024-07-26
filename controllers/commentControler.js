const commentModel = require('../models/commentModels');
const utilities = require('../utilities/');


const addComment = async (commentText, commentAuthor, parentCommentId = null) => {
    try {
        console.log('Attempting to add comment:', commentText, commentAuthor, parentCommentId);

        // Query para insertar el comentario en la base de datos
        const query = `
            INSERT INTO comments (comment_text, comment_author, parent_comment_id, created_at)
            VALUES ($1, $2, $3, NOW()) RETURNING *;
        `;
        const values = [commentText, commentAuthor, parentCommentId];

        console.log('Executing query:', query, 'with values:', values);
        const result = await pool.query(query, values);
        
        console.log('Comment added successfully:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;  // Propaga el error después de registrarlo
    }
};




async function getComments(req, res) {
    try {
        console.log('Fetching comments...');
        const comments = await commentModel.getComments();
        const respond = await utilities.buildCommentList();

        console.log('Rendering comments page...');
        res.render('comment/comments', { comments, title: 'Comments', respond });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).send('Server error');
    }
}


    


        
    




module.exports = {
    getComments,
    addComment
};



