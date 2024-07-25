const pool = require('../database/');



const addComment = async (commentText, accountId, parentCommentId = null) => {
    const query = 'INSERT INTO comments (comment_text, account_id, parent_comment_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [commentText, accountId, parentCommentId];
    const result = await pool.query(query, values);
    return result.rows[0];
};


const getComments = async () => {
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

module.exports = {
    addComment,
    getComments,
    getResponses
};

