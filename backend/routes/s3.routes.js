// Import required AWS S3 command classes
const { PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
// Import the method used to generate pre-signed URLs
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = (app) => {
  // Retrieve the S3 client instance from the app
  const s3 = app.get('s3');
  const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';

  //Generates a pre-signed URL that allows clients to upload an image file directly to S3
  app.get('/S3/get/upload-signed-url', async (req, res) => {
    const { filePath } = req.query; // Path/key of the file to be uploaded
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: 'image/jpeg',
    });

    try {
      const url = await getSignedUrl(s3, command, { expiresIn: 300 });
      res.json({ url }); // Return the signed URL to the client
    } catch (err) {
      res.status(500).json({ error: 'Error creating signed URL' });
    }
  });

  //Retrieves a pre-signed URL for downloading an image from S3
  //If the requested file is not found, falls back to a default image
  app.get('/S3/get/image', async (req, res) => {
    const { filePath, defaultPath } = req.query;

    try {
       //check if the file exists in the bucket
      const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: filePath });
      await s3.send(headCommand);

      // File exists, generate a signed URL
      const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: filePath });
      const url = await getSignedUrl(s3, getCommand, { expiresIn: 60 });
      res.json({ url }); // Return signed URL
    } catch (err) {
      if (err.name === 'NotFound') {
        //If the file is not found, use the defaultPath
        const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: defaultPath });
        const url = await getSignedUrl(s3, getCommand, { expiresIn: 60 });
        res.json({ url });
      } else {
        res.status(500).json({ error: 'Error accessing S3', details: err });
      }
    }
  });
};
