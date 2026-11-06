const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// S3 er sathe connect - EC2 te ei 4 te boshate hobe
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET = process.env.S3_BUCKET_NAME;

// Local e na, memory te niye S3 te pathabo
const upload = multer({ storage: multer.memoryStorage() });

// Upload -> S3 te jabe
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileName = Date.now() + '-' + req.file.originalname;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));
    res.json({ message: 'Uploaded', name: fileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List -> S3 theke dekhabe
app.get('/files', async (req, res) => {
  try {
    const data = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
    const files = [];
    for (const f of (data.Contents || [])) {
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: f.Key }), { expiresIn: 3600 });
      files.push({ name: f.Key, url: url });
    }
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('TitliDrive EC2 + S3 te cholche'));
