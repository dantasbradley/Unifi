module.exports = (app) => {
     // Get the MySQL connection pool from the Express app instance
    const pool = app.get('pool');
  
    //function to check for missing required fields
    function validateFields(fields, res) {
      for (const key in fields) {
        if (!fields[key]) {
          res.status(400).json({ message: `Missing required field: ${key}` });
          return false;
        }
      }
      return true;
    }
  
    //Add a new post
    app.post('/DB/posts/add', (req, res) => {
      const { content, club_id, author_id } = req.body;

      // Validate required fields
      if (!validateFields({ content, club_id, author_id }, res)) return;
  
      // SQL query to insert a new post
      const query = 'INSERT INTO test.posts (content, club_id, author_id) VALUES (?, ?, ?)';
      pool.query(query, [content, club_id, author_id], (err, results) => {
        if (err) {
          // Handle database error
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
         // success response with inserted post ID
        res.status(201).json({ message: 'Post created', id: results.insertId });
      });
    });
  
    //Delete a post by ID
    app.delete('/DB/posts/delete/:id', (req, res) => {
      const postId = req.params.id;
      // SQL query to delete a post by ID
      const query = 'DELETE FROM test.posts WHERE id = ?';
      pool.query(query, [postId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        // If no post was found to delete, return 404
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
  
        res.status(200).json({ message: 'Post deleted' });
      });
    });

    //Update an existing post's content
    app.put('/DB/posts/update/:post_id', (req, res) => {
      const { post_id } = req.params;
      const { content } = req.body;
    
      // Ensure content is provided
      if (!content) {
        return res.status(400).json({ error: 'Missing post content' });
      }
    
      const pool = app.get('pool');

      // SQL query to update the post's content
      const sql = 'UPDATE Posts SET content = ? WHERE id = ?';
    
      pool.query(sql, [content, post_id], (err, result) => {
        if (err) {
          console.error('DB error on post update:', err);
          return res.status(500).json({ error: 'Failed to update post.' });
        }
    
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
    
        res.status(200).json({ message: 'Post updated successfully.' });
      });
    });
    
  };
  