// routes/s3endpoints.routes.js
const {
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
  } = require('@aws-sdk/client-s3');
  const { getSignedUrl: getSignedUrlAws } = require('@aws-sdk/s3-request-presigner');
  
  module.exports = function (app) {
    const s3 = app.get('s3');
    const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';
  
    // Generate a signed PUT URL
    app.get('/S3/get/upload-signed-url', async (req, res) => {
      const { filePath } = req.query;
      if (!filePath) return res.status(400).json({ error: 'filePath is required' });
  
      try {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: filePath,
          ContentType: 'image/jpeg',
        });
        const url = await getSignedUrlAws(s3, command, { expiresIn: 300 });
        res.json({ url });
      } catch (err) {
        console.error('Error generating upload signed URL:', err);
        res.status(500).json({ error: 'Error generating upload signed URL' });
      }
    });
  
    // Retrieve a signed GET URL for image
    app.get('/S3/get/image', async (req, res) => {
      const { filePath, defaultPath } = req.query;
      if (!filePath) return res.status(400).json({ error: 'filePath is required' });
  
      try {
        // First, check if the requested image exists
        const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: filePath });
        await s3.send(headCommand);
  
        // If found, get signed URL
        const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: filePath });
        const url = await getSignedUrlAws(s3, getCommand, { expiresIn: 60 });
        res.json({ url });
      } catch (err) {
        if (err.name === 'NotFound') {
          if (defaultPath) {
            try {
              const fallbackCommand = new GetObjectCommand({ Bucket: bucketName, Key: defaultPath });
              const url = await getSignedUrlAws(s3, fallbackCommand, { expiresIn: 60 });
              return res.json({ url });
            } catch (fallbackErr) {
              console.error('Error accessing fallback S3 image:', fallbackErr);
              return res.status(500).json({ error: 'Error accessing S3 fallback image' });
            }
          } else {
            return res.status(404).json({ error: 'File not found in S3 and no fallback provided' });
          }
        } else {
          console.error('Error accessing S3:', err);
          return res.status(500).json({ error: 'Error accessing S3' });
        }
        
      }
    });
  };
  