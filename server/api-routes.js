import { Evidence } from './mongodb-models.js';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { getDatabase } from './mongodb-crud.js';

export function registerAdditionalRoutes(app) {
  console.log('🔧 Registering additional API routes...');

  // Configure multer for memory storage
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Media upload endpoint for evidence
  app.post('/api/upload-media', upload.array('media'), async (req, res) => {
    try {
      console.log('🔍 Uploading media files:', req.files?.length || 0, 'files');

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const db = getDatabase();
      const bucket = new GridFSBucket(db, { bucketName: 'evidence_media' });
      const uploadedFiles = [];

      for (const file of req.files) {
        const uploadStream = bucket.openUploadStream(file.originalname, {
          metadata: {
            contentType: file.mimetype,
            uploadedAt: new Date(),
            originalName: file.originalname
          }
        });

        await new Promise((resolve, reject) => {
          uploadStream.on('error', reject);
          uploadStream.on('finish', () => {
            console.log('✅ File uploaded to GridFS:', file.originalname);
            uploadedFiles.push({
              name: file.originalname,
              url: `/api/media/${uploadStream.id}`,
              type: file.mimetype,
              uploadedAt: new Date()
            });
            resolve();
          });
          uploadStream.end(file.buffer);
        });
      }

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // Media retrieval endpoint
  app.get('/api/media/:fileId', async (req, res) => {
    try {
      const db = getDatabase();
      const bucket = new GridFSBucket(db, { bucketName: 'evidence_media' });

      const downloadStream = bucket.openDownloadStream(new db.constructor.ObjectId(req.params.fileId));

      downloadStream.on('error', (error) => {
        console.error('❌ Error downloading file:', error);
        res.status(404).json({ error: 'File not found' });
      });

      downloadStream.on('file', (file) => {
        res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${file.filename}"`);
      });

      downloadStream.pipe(res);
    } catch (error) {
      console.error('❌ Error retrieving media:', error);
      res.status(500).json({ error: 'Failed to retrieve media' });
    }
  });

  console.log('✅ Additional API routes registered successfully');
}