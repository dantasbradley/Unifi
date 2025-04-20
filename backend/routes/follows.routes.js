module.exports = (app) => {
    const pool = app.get('pool');
  
    // Endpoint to follow a user
    app.post('/DB/follows/add', (req, res) => {
      const { follower_id, followee_id } = req.body;
      if (!follower_id || !followee_id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const query = 'INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)';
      pool.query(query, [follower_id, followee_id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(201).json({ message: 'Follow added', id: results.insertId });
      });
    });
  
    // Endpoint to unfollow a user
    app.delete('/DB/follows/delete', (req, res) => {
      const { follower_id, followee_id } = req.body;
      if (!follower_id || !followee_id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const query = 'DELETE FROM follows WHERE follower_id = ? AND followee_id = ?';
      pool.query(query, [follower_id, followee_id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Follow relationship not found' });
        }
        res.status(200).json({ message: 'Unfollowed successfully' });
      });
    });
  };
  