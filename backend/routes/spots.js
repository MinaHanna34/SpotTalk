module.exports = (app, pool) => {
    // Fetch all spots
    app.get('/spots', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM spots');
        res.status(200).json(result.rows);
      } catch (error) {
        console.error('Error fetching spots:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Add a new spot
    app.post('/spots', async (req, res) => {
      const { username = 'Anonymous', lat, lng, image_url, comments = [], stars = 0 } = req.body;
  
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
  
      try {
        const result = await pool.query(
          'INSERT INTO spots (username, lat, lng, image_url, comments, stars) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [username, lat, lng, image_url, JSON.stringify(comments), stars]
        );
        res.status(201).json({ message: 'Spot added', spot: result.rows[0] });
      } catch (error) {
        console.error('Error adding spot:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Add a comment to a spot
    app.put('/spots/:id/comments', async (req, res) => {
      const { id } = req.params;
      const { comment } = req.body;
  
      try {
        const result = await pool.query(
          'UPDATE spots SET comments = comments || $1 WHERE id = $2 RETURNING *',
          [JSON.stringify([comment]), id]
        );
        res.status(200).json({ message: 'Comment added', spot: result.rows[0] });
      } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  
    // Update stars for a spot
    app.put('/spots/:id/stars', async (req, res) => {
      const { id } = req.params;
      const { stars } = req.body;
  
      if (!Number.isInteger(stars)) {
        return res.status(400).json({ error: 'Stars must be an integer' });
      }
  
      try {
        const result = await pool.query(
          'UPDATE spots SET stars = $1 WHERE id = $2 RETURNING *',
          [stars, id]
        );
        res.status(200).json({ message: 'Stars updated', spot: result.rows[0] });
      } catch (error) {
        console.error('Error updating stars:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };
  