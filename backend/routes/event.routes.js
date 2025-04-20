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

  app.post('/DB/events/add', (req, res) => {
    const { title, description, date, location, club_id } = req.body;
    if (!validateFields({ title, description, date, location, club_id }, res)) return;

    const query = 'INSERT INTO test.events (title, description, date, location, club_id) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [title, description, date, location, club_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ message: 'Event created', id: results.insertId });
    });
  });

  app.put('/DB/events/update/:id', (req, res) => {
    const { title, description, date, location } = req.body;
    const { id } = req.params;

    if (!validateFields({ title, description, date, location }, res)) return;

    const query = 'UPDATE test.events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?';
    pool.query(query, [title, description, date, location, id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });

      res.status(200).json({ message: 'Event updated successfully' });
    });
  });

  app.delete('/DB/events/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM test.events WHERE id = ?';

    pool.query(query, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });

      res.status(200).json({ message: 'Event deleted successfully' });
    });
  });
};
