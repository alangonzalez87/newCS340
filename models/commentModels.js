const pool = require('../database/');
commentModel ={}

commentModel.addComment = async (commentText, commentAuthor, parentCommentId = null) => {
    const query = 'INSERT INTO comments (comment_text, comment_author, parent_comment_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const values = [commentText, commentAuthor, parentCommentId];
    const result = await pool.query(query, values);
    return result.rows[0];
};


commentModel.getComments = async () => {
    const query = `
        SELECT * FROM comments
        WHERE parent_comment_id IS NULL
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    const comments = result.rows;

    for (const comment of comments) {
        comment.responses = await getResponses(comment.comment_id);
    }

    return comments;
};


const getResponses = async (parentCommentId) => {
    const query = 'SELECT * FROM comments WHERE parent_comment_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [parentCommentId]);
    return result.rows;
};


module.exports = commentModel, getResponses


