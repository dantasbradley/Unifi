module.exports = (app) => {
    const pool = app.get('pool');
  
    function validateFields(fields, res) {
      for (const key in fields) {
        if (!fields[key]) {
          res.status(400).json({ message: `Missing required field: ${key}` });
          return false;
        }
      }
      return true;
    }
  
    app.post('/DB/posts/add', (req, res) => {
      const { content, club_id, author_id } = req.body;
      if (!validateFields({ content, club_id, author_id }, res)) return;
  
      const query = 'INSERT INTO test.posts (content, club_id, author_id) VALUES (?, ?, ?)';
      pool.query(query, [content, club_id, author_id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        res.status(201).json({ message: 'Post created', id: results.insertId });
      });
    });
  
    app.delete('/DB/posts/delete/:id', (req, res) => {
      const postId = req.params.id;
      const query = 'DELETE FROM test.posts WHERE id = ?';
      pool.query(query, [postId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
  
        res.status(200).json({ message: 'Post deleted' });
      });
    });
  };
  