
// Exporting function to define notification-related routes on app instance
module.exports = (app) => {
    // Get the database connection pool from the Express app instance
    const pool = app.get('pool');
  
    // Add notification
    app.post('/DB/notifications/add', (req, res) => {
      const { recipient_id, type, message } = req.body;
      // Check if all required fields are provided
      if (!recipient_id || !type || !message) {
        return res.status(400).json({ message: 'Missing required field' });
      }
  
       // SQL query to insert a new notification
      const query = 'INSERT INTO test.notifications (recipient_id, type, message) VALUES (?, ?, ?)';
      pool.query(query, [recipient_id, type, message], (err, results) => {
         // Handle database error
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        res.status(201).json({ message: 'Notification created', id: results.insertId });
      });
    });
  
    // Delete notification
    app.delete('/DB/notifications/delete/:id', (req, res) => {
      // Get notification ID from URL parameter
      const notifId = req.params.id;
      // SQL query to delete the notification by ID
      const query = 'DELETE FROM test.notifications WHERE id = ?';
      pool.query(query, [notifId], (err, result) => {
        // Handle database error
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
  
        // If no rows were affected, notification was not found
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Notification not found' });
        }
  
         //success
        res.status(200).json({ message: 'Notification deleted' });
      });
    });
  };
  