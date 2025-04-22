module.exports = (app) => {
  // Get the database connection pool from the Express app instance
  const pool = app.get('pool');

  // Helper function to validate that all required fields are present
  function validateFields(fields, res) {
    for (const key in fields) {
      if (!fields[key]) {
        res.status(400).json({ message: `Missing required field: ${key}` });
        return false;
      }
    }
    return true;
  }

  // Endpoint to add a new event to the database
  app.post('/DB/events/add', (req, res) => {
    const { title, description, date, location, club_id } = req.body;
    // Validate that all required fields are provided
    if (!validateFields({ title, description, date, location, club_id }, res)) return;

    // Execute the insert query
    const query = 'INSERT INTO test.events (title, description, date, location, club_id) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [title, description, date, location, club_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
       
      // Return success response
      res.status(201).json({ message: 'Event created', id: results.insertId });
    });
  });

  // Endpoint to update an existing event by ID
  app.put('/DB/events/update/:id', (req, res) => {
    const { title, description, date, location } = req.body;
    const { id } = req.params;

    // Validate input fields
    if (!validateFields({ title, description, date, location }, res)) return;

    // Execute update query
    const query = 'UPDATE test.events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?';
    pool.query(query, [title, description, date, location, id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      // Check if any rows were affected
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });

      res.status(200).json({ message: 'Event updated successfully' });
    });
  });

  // Endpoint to delete an event by ID
  app.delete('/DB/events/delete/:id', (req, res) => {
    const { id } = req.params;
    // Execute delete query
    const query = 'DELETE FROM test.events WHERE id = ?';
    pool.query(query, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });

      res.status(200).json({ message: 'Event deleted successfully' });
    });
  });
};
