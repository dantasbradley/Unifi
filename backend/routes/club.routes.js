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
      pool.query(adminQuery, [admin_id, club_id], (adminError) => {
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

  // Generic delete route for testing
  app.delete('/DB/:table/delete/:id1=:val1/:id2=:val2', (req, res) => {
    const { table, id1, val1, id2, val2 } = req.params;

    const query = `DELETE FROM ?? WHERE ?? = ? AND ?? = ?`;
    pool.query(query, [table, id1, val1, id2, val2], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to delete data from ' + table });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'No records found to delete' });
      }
      res.status(200).json({ message: `Successfully deleted from ${table}` });
    });
  });
};
