module.exports = (app) => {
  // Get database connection pool from the Express app instance
    const pool = app.get('pool');
  
     // Helper function to validate required fields in the request body
    function validateFields(fields, res) {
      for (const key in fields) {
        if (!fields[key]) {
          res.status(400).json({ message: `Missing required field: ${key}` });
          return false;
        }
      }
      return true;
    }
  
    //add like
    app.post('/DB/likes/add', (req, res) => {
      const { user_id, post_id } = req.body;
      // Validate required fields
      if (!validateFields({ user_id, post_id }, res)) return;
  
      // SQL query to insert a new like into the likes table
      const query = 'INSERT INTO test.likes (user_id, post_id) VALUES (?, ?)';
      pool.query(query, [user_id, post_id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(201).json({ message: 'Like added' });
      });
    });
  
    //remove like
    app.delete('/DB/likes/delete', (req, res) => {
      const { user_id, post_id } = req.body;
      // Validate required fields
      if (!validateFields({ user_id, post_id }, res)) return;
  
      // SQL query to delete a like based on user_id and post_id
      const query = 'DELETE FROM test.likes WHERE user_id = ? AND post_id = ?';
      pool.query(query, [user_id, post_id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Like not found' });
        }
  
        res.status(200).json({ message: 'Like removed' });
      });
    });
  };
  