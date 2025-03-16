const { put } = require('@vercel/blob');
const { v4: uuidv4 } = require('uuid');

module.exports = (app, pool) => {
  // Fetch all spots
  app.get('/spots', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM spots');
      const spots = result.rows.map(spot => ({
        ...spot,
        images: Array.isArray(spot.image_url)
          ? spot.image_url // If it's already an array, use it
          : typeof spot.image_url === 'string'
          ? [spot.image_url] // Wrap a single string in an array
          : [], // Default to an empty array
      }));
      res.status(200).json(spots);
    } catch (error) {
      console.error('Error fetching spots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Fetch single spot by ID
  app.get('/spots/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM spots WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Spot not found' });
      }

      const spot = result.rows[0];
      // Transform the spot data to match the frontend expectations
      const transformedSpot = {
        ...spot,
        images: Array.isArray(spot.image_url)
          ? spot.image_url
          : typeof spot.image_url === 'string'
          ? [spot.image_url]
          : [],
        comments: Array.isArray(spot.comments)
          ? spot.comments
          : typeof spot.comments === 'string'
          ? JSON.parse(spot.comments)
          : []
      };

      res.status(200).json(transformedSpot);
    } catch (error) {
      console.error('Error fetching spot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  app.post('/spots', async (req, res) => {
    const {
      username = 'Anonymous',
      lat,
      lng,
      name,
      description,
      images = [], // Base64 encoded images from the frontend
      stars = 0,
      comments = [],
    } = req.body;

    if (!lat || !lng || !name) {
      return res.status(400).json({ error: 'Latitude, longitude, and name are required' });
    }

    try {
      // Upload images to Vercel Blob
      const imageUrls = [];
      for (const imageBase64 of images) {
        if (!imageBase64) continue;

        // Generate unique filename
        const fileName = `spots-images/${uuidv4()}.png`;

        // Convert Base64 to Buffer
        const buffer = Buffer.from(imageBase64.split(',')[1], 'base64'); // Split to remove metadata part

        // Upload to Vercel Blob
        const blob = await put(fileName, buffer, { access: 'public' });
        if (!blob || !blob.url) {
          throw new Error('Failed to upload image to Vercel Blob');
        }

        // Add uploaded image URL to array
        imageUrls.push(blob.url);
      }

      // Save spot details in the database
      const result = await pool.query(
        'INSERT INTO spots (username, lat, lng, name, description, image_url, stars, comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [
          username,
          lat,
          lng,
          name,
          description,
          JSON.stringify(imageUrls), // Save URLs as JSON array
          stars,
          JSON.stringify(comments),
        ]
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
};
