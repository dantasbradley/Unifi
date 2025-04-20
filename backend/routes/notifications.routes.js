module.exports = (app) => {
    const pool = app.get('pool');
  
    // Add notification
    app.post('/DB/notifications/add', (req, res) => {
      const { recipient_id, type, message } = req.body;
      if (!recipient_id || !type || !message) {
        return res.status(400).json({ message: 'Missing required field' });
      }
  
      const query = 'INSERT INTO test.notifications (recipient_id, type, message) VALUES (?, ?, ?)';
      pool.query(query, [recipient_id, type, message], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        res.status(201).json({ message: 'Notification created', id: results.insertId });
      });
    });
  
    // Delete notification
    app.delete('/DB/notifications/delete/:id', (req, res) => {
      const notifId = req.params.id;
      const query = 'DELETE FROM test.notifications WHERE id = ?';
      pool.query(query, [notifId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Notification not found' });
        }
  
        res.status(200).json({ message: 'Notification deleted' });
      });
    });
  };
  