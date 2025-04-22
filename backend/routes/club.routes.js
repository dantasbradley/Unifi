module.exports = (app) => {
  const pool = app.get('pool');

  // function to validate required fields
  function validateFields(fields, res) {
    for (const key in fields) {
      if (!fields[key]) {
        res.status(400).json({ message: `Missing required field: ${key}` });
        return false;
      }
    }
    return true;
  }

  // Route to create a new club and assign an admin to it
  app.post('/DB/clubs/add', (req, res) => {
    const { name, location, admin_id } = req.body;
    if (!validateFields({ name, location, admin_id }, res)) return;

    // SQL query to insert the club into the database
    const query = 'INSERT INTO test.clubs (name, location) VALUES (?, ?)';
    pool.query(query, [name, location], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Database error', error });
      }

      // Once club is inserted, use the new club ID to create a club_admin entry
      const club_id = results.insertId;
      const adminQuery = 'INSERT INTO test.club_admins (admin_id, club_id) VALUES (?, ?)';
      pool.query(adminQuery, [admin_id, club_id], (adminError) => {
        if (adminError) {
          return res.status(500).json({ message: 'Error adding admin to club', error: adminError });
        }

        // Return success response with new club ID
        res.status(201).json({
          message: 'Club and admin added successfully',
          id: club_id,
        });
      });
    });
  });

  // delete route for testing
  app.delete('/DB/:table/delete/:id1=:val1/:id2=:val2', (req, res) => {
    const { table, id1, val1, id2, val2 } = req.params;

    const query = `DELETE FROM ?? WHERE ?? = ? AND ?? = ?`;
    // Return 500 on SQL execution error
    // Return 404 if no matching records found
    // Return 200 Successful deletion
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

  // update attribute route
  app.post('/DB/:table/update/attribute', (req, res) => {
    const { table } = req.params;
    const { id, attribute, value } = req.body;

    if (!id || !attribute || value === undefined) {
      return res.status(400).json({ message: 'id, attribute, and value are required.' });
    }

    const query = `UPDATE ?? SET ?? = ? WHERE id = ?`;
    // Return 500 on SQL execution error
    // Return 404 if no matching records found
    // Return 200 Successful updation
    pool.query(query, [table, attribute, value, id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: `Failed to update ${attribute} in ${table}` });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: `No record found in ${table} with the provided ID` });
      }

      res.json({ message: `${attribute} updated successfully in ${table}` });
    });
  });
};
