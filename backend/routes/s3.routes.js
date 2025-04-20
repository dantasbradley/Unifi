const { PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

module.exports = (app) => {
  const s3 = app.get('s3');
  const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';

  app.get('/S3/get/upload-signed-url', async (req, res) => {
    const { filePath } = req.query;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ContentType: 'image/jpeg',
    });

    try {
      const url = await getSignedUrl(s3, command, { expiresIn: 300 });
      res.json({ url });
    } catch (err) {
      res.status(500).json({ error: 'Error creating signed URL' });
    }
  });

  app.get('/S3/get/image', async (req, res) => {
    const { filePath, defaultPath } = req.query;

    try {
      const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: filePath });
      await s3.send(headCommand);
      const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: filePath });
      const url = await getSignedUrl(s3, getCommand, { expiresIn: 60 });
      res.json({ url });
    } catch (err) {
      if (err.name === 'NotFound') {
        const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: defaultPath });
        const url = await getSignedUrl(s3, getCommand, { expiresIn: 60 });
        res.json({ url });
      } else {
        res.status(500).json({ error: 'Error accessing S3', details: err });
      }
    }
  });
};
