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

  app.post('/DB/clubs/add', (req, res) => {
    const { name, location, admin_id } = req.body;
    if (!validateFields({ name, location, admin_id }, res)) return;

    const query = 'INSERT INTO test.clubs (name, location) VALUES (?, ?)';
    pool.query(query, [name, location], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Database error', error });
      }

      const club_id = results.insertId;
      const adminQuery = 'INSERT INTO test.club_admins (admin_id, club_id) VALUES (?, ?)';
      pool.query(adminQuery, [admin_id, club_id], (adminError, adminResults) => {
        if (adminError) {
          return res.status(500).json({ message: 'Error adding admin to club', error: adminError });
        }

        res.status(201).json({
          message: 'Club and admin added successfully',
          id: club_id,
        });
      });
    });
  });

  // ✅ New DELETE endpoint
  app.delete('/DB/clubs/delete/:club_id', (req, res) => {
    const { club_id } = req.params;
    if (!club_id) {
      return res.status(400).json({ message: 'Club ID is required.' });
    }

    const query = 'DELETE FROM test.clubs WHERE id = ?';
    pool.query(query, [club_id], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Database error', error });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'No club found with the provided ID.' });
      }

      res.json({ message: 'Club deleted successfully', club_id });
    });
  });
};
