const pool = require('../database/');



// const addComment = async (commentText, accountId, parentCommentId = null) => {
//     const query = 'INSERT INTO comments (comment_text, account_id, parent_comment_id) VALUES ($1, $2, $3) RETURNING *';
//     const values = [commentText, accountId, parentCommentId];
//     const result = await pool.query(query, values);
//     return result.rows[0];
// };


// const getComments = async () => {
//     const query = `
//         SELECT * FROM comments
//         WHERE parent_comment_id IS NULL
//         ORDER BY created_at DESC
//     `;
//     const result = await pool.query(query);
//     const comments = result.rows;

//     for (const comment of comments) {
//         comment.responses = await getResponses(comment.comment_id);
//     }

//     return comments;
// };


// const getResponses = async (parentCommentId) => {
//     const query = 'SELECT * FROM comments WHERE parent_comment_id = $1 ORDER BY created_at DESC';
//     const result = await pool.query(query, [parentCommentId]);
//     return result.rows;
// };

const addComment = async (commentText, accountId, parentCommentId = null) => {
    try {
        console.log('Attempting to add comment:', { commentText, accountId, parentCommentId });

        const query = 'INSERT INTO comments (comment_text, account_id, parent_comment_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [commentText, accountId, parentCommentId];

        console.log('Executing query:', query, 'with values:', values);
        const result = await pool.query(query, values);

        console.log('Comment added successfully:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;  // Re-throw the error after logging it
    }
};

const getComments = async () => {
    try {
        console.log('Fetching top-level comments...');

        const query = `
            SELECT * FROM comments
            WHERE parent_comment_id IS NULL
            ORDER BY created_at DESC
        `;
        console.log('Executing query:', query);
        const result = await pool.query(query);
        const comments = result.rows;

        console.log('Top-level comments fetched:', comments.length);

        for (const comment of comments) {
            console.log('Fetching responses for comment ID:', comment.comment_id);
            comment.responses = await getResponses(comment.comment_id);
            console.log('Responses for comment ID', comment.comment_id, ':', comment.responses);
        }

        return comments;
    } catch (error) {
        console.error('Error getting comments:', error);
        throw error;
    }
};

const getResponses = async (parentCommentId) => {
    try {
        console.log('Fetching responses for parent comment ID:', parentCommentId);

        const query = 'SELECT * FROM comments WHERE parent_comment_id = $1 ORDER BY created_at DESC';
        console.log('Executing query:', query, 'with value:', parentCommentId);
        const result = await pool.query(query, [parentCommentId]);

        console.log('Responses fetched for parent comment ID', parentCommentId, ':', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error getting responses:', error);
        throw error;
    }
};


module.exports = {
    addComment,
    getComments,
    getResponses
};

