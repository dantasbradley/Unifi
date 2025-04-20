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
      const { title, date, start_time, end_time, location, description, club_id } = req.body;
  
      if (!validateFields({ title, date, start_time, end_time, location, description, club_id }, res)) return;
  
      const query = `
        INSERT INTO test.events (title, date, start_time, end_time, location, description, club_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
  
      const params = [title, date, start_time, end_time, location, description, club_id];
  
      pool.query(query, params, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Database error', error });
        }
  
        res.status(201).json({
          message: 'Event added successfully',
          id: results.insertId
        });
      });
    });
  };
  