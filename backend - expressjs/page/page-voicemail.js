const express = require('express');
const router = express.Router();
const db = require('@utils/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/voicemails');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voicemail-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (MP3, WAV, OGG, M4A)'));
    }
  }
});

// ============================================
// VOICEMAIL MESSAGE MANAGEMENT
// ============================================

// Get all voicemail messages
router.get('/messages', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        message_id,
        name,
        description,
        audio_url,
        duration,
        is_active,
        created_by,
        created_at
       FROM page_voicemail_messages
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    console.error('[Voicemail] Get messages error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create voicemail message
router.post('/create', upload.single('audio'), async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Message name is required'
      });
    }

    // Get audio duration (you might need ffmpeg for this, or set a default)
    // For now, we'll set a default duration
    const duration = 30; // Default 30 seconds

    // Create public URL for the audio file
    const audioUrl = `${process.env.BASE_URL}/uploads/voicemails/${req.file.filename}`;

    // Insert into database
    const result = await db.query(
      `INSERT INTO page_voicemail_messages 
       (name, description, audio_url, duration, created_by, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [name, description || null, audioUrl, duration, userId]
    );

    console.log(`[Voicemail] Created message: ${name}`);

    res.json({
      success: true,
      message: result.rows[0]
    });

  } catch (error) {
    console.error('[Voicemail] Create error:', error);
    
    // Clean up uploaded file if database insert fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('[Voicemail] Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete voicemail message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    // Get the message to find the audio file
    const messageResult = await db.query(
      `SELECT audio_url FROM page_voicemail_messages WHERE message_id = $1`,
      [messageId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voicemail message not found'
      });
    }

    // Soft delete (mark as inactive)
    await db.query(
      `UPDATE page_voicemail_messages 
       SET is_active = false 
       WHERE message_id = $1`,
      [messageId]
    );

    // Optional: Delete the actual file
    // Uncomment if you want to physically delete the file
    /*
    const audioUrl = messageResult.rows[0].audio_url;
    const filename = path.basename(audioUrl);
    const filePath = path.join(__dirname, '../../uploads/voicemails', filename);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('[Voicemail] Failed to delete audio file:', error);
    }
    */

    console.log(`[Voicemail] Deleted message: ${messageId}`);

    res.json({
      success: true,
      message: 'Voicemail message deleted'
    });

  } catch (error) {
    console.error('[Voicemail] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single voicemail message
router.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await db.query(
      `SELECT * FROM page_voicemail_messages WHERE message_id = $1`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voicemail message not found'
      });
    }

    res.json({
      success: true,
      message: result.rows[0]
    });

  } catch (error) {
    console.error('[Voicemail] Get message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update voicemail message
router.patch('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { name, description, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(messageId);

    const result = await db.query(
      `UPDATE page_voicemail_messages 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE message_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voicemail message not found'
      });
    }

    res.json({
      success: true,
      message: result.rows[0]
    });

  } catch (error) {
    console.error('[Voicemail] Update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;