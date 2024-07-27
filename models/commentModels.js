const pool = require('../database/');
commentModel ={}

// commentModel.addComment = async (commentText, commentAuthor, parentCommentId = null) => {
//     const query = 'INSERT INTO comments (comment_text, comment_author, parent_comment_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
//     const values = [commentText, commentAuthor, parentCommentId];
//     console.log('Executing query:', query, 'with values:', values);
//     const result = await pool.query(query, values);
//     console.log('Query result:', result.rows[0]);
//     return result.rows[0];
// };
commentModel.addComment = async (commentText, account_id, parent_comment_id = null) => {
    try {
      const query = `
        INSERT INTO comments (comment_text, comment_author, parent_comment_id, created_at) 
        VALUES ($1, $2, $3, NOW()) 
        RETURNING *`;
      const values = [commentText, account_id, parent_comment_id];
      console.log('Executing query:', query, 'with values:', values);
      const result = await pool.query(query, values);
      console.log('Query result:', result.rows[0]);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error adding commentary:', error);
      throw error; 
    }
  };


commentModel.getComments = async () => {
    const query = `
        SELECT * FROM comments
        WHERE parent_comment_id IS NULL
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    const comments = result.rows;
    console.log('Top-level comments fetched:', comments);

    for (const comment of comments) {
        comment.responses = await getResponses(comment.comment_id);
        console.log('Responses for comment ID', comment.comment_id, ':', comment.responses);
    }

    return comments;
};

const getResponses = async (parentCommentId) => {
    const query = 'SELECT * FROM comments WHERE parent_comment_id = $1 ORDER BY created_at DESC';
    console.log('Executing query:', query, 'with value:', parentCommentId);
    const result = await pool.query(query, [parentCommentId]);
    console.log('Responses fetched for parent comment ID', parentCommentId, ':', result.rows);
    return result.rows;
};


module.exports = commentModel, getResponses
// commentModel.getComments = async (comment_id) => {
//     try {
      
//       const commentQuery = `
//         SELECT * FROM comments 
//         WHERE comment_id = $1`;
//       const commentResult = await pool.query(commentQuery, [comment_id]);
      
//       if (commentResult.rows.length === 0) {
//         throw new Error('Comment not found');
//       }
  
//       const comments = commentResult.rows[0];
  
     
//       const responsesQuery = `
//         SELECT * FROM comments 
//         WHERE parent_comment_id = $1 
//         ORDER BY created_at DESC`;
//       const responsesResult = await pool.query(responsesQuery, [comment_id]);
  
//       comments.responses = responsesResult.rows;
//       return comments;
//     } catch (error) {
//       console.error('Error fetching commentary by ID:', error);
//       throw error; 
//     }
//   };





