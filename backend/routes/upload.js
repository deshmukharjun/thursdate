const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Profile picture upload attempt for user ID:', req.user.userId);
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer ? req.file.buffer.length : 0
    });

    // Validate file size
    if (req.file.size > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size too large. Maximum 20MB allowed.' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'luyona/profile-pictures',
      public_id: `user_${req.user.userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    console.log('Upload successful:', {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Upload lifestyle image
router.post('/lifestyle-image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Lifestyle image upload attempt for user ID:', req.user.userId);
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer ? req.file.buffer.length : 0
    });

    // Validate file size
    if (req.file.size > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size too large. Maximum 20MB allowed.' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'luyona/lifestyle-images',
      public_id: `user_${req.user.userId}_lifestyle_${Date.now()}`,
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    console.log('Lifestyle upload successful:', {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Lifestyle upload error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

module.exports = router; 