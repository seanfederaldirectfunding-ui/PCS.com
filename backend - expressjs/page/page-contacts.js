const express = require('express');
const router = express.Router();
const db = require('@utils/database');

// Get contacts with pagination
router.get('/', async (req, res) => {
  try {
    const { userId, page = 1, limit = 50, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['c.user_id = $1'];
    let params = [userId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereConditions.push(`(
        c.name ILIKE $${paramCount} OR 
        c.phone ILIKE $${paramCount} OR 
        c.email ILIKE $${paramCount} OR 
        c.company ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    if (status && status !== 'all') {
      paramCount++;
      whereConditions.push(`c.status = $${paramCount}`);
      params.push(status);
    }

    // Get total count
    const countQuery = await db.query(
      `SELECT COUNT(*) FROM page_contacts c WHERE ${whereConditions.join(' AND ')}`,
      params
    );

    const totalCount = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated contacts
    params.push(limit, offset);
    const contactsQuery = await db.query(
      `SELECT c.contact_id, c.name, c.phone, c.email, c.company, 
              c.address, c.status, c.lead_score as "leadScore", c.tags, c.notes,
              c.last_contacted, c.assigned_to as "assignedTo", c.assigned_at as "assignedAt",
              c.created_at
       FROM page_contacts c 
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY c.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );

    res.json({
      success: true,
      contacts: contactsQuery.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
});

// Upload contacts (process in batches)
router.post('/upload', async (req, res) => {
  try {
    const { userId, contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        error: 'Contacts array is required'
      });
    }

    // Process in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    let successfulInserts = 0;
    let duplicatesSkipped = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      for (const contact of batch) {
        try {
          // Check for duplicate phone number for this user
          const existing = await db.query(
            'SELECT contact_id FROM page_contacts WHERE user_id = $1 AND phone = $2',
            [userId, contact.phone]
          );

          if (existing.rows.length === 0) {
            await db.query(
              `INSERT INTO page_contacts 
               (user_id, name, phone, email, company, address, lead_score, assigned_to) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                userId,
                contact.name || `Contact ${successfulInserts + 1}`,
                contact.phone,
                contact.email || '',
                contact.company || '',
                contact.address || '',
                contact.leadScore || 0,
                'unassigned'
              ]
            );
            successfulInserts++;
          } else {
            duplicatesSkipped++;
          }
        } catch (contactError) {
          console.error('Error inserting contact:', contactError);
          // Continue with next contact even if one fails
        }
      }

      // Small delay between batches to reduce load
      if (i + batchSize < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    res.json({
      success: true,
      message: `Contacts processed successfully`,
      stats: {
        successful: successfulInserts,
        duplicatesSkipped,
        totalProcessed: successfulInserts + duplicatesSkipped
      }
    });

  } catch (error) {
    console.error('Upload contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload contacts'
    });
  }
});

// Update contact status after call
router.patch('/:contactId/status', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, notes } = req.body;

    await db.query(
      `UPDATE page_contacts 
       SET status = $1, notes = COALESCE($2, notes), last_contacted = NOW(), updated_at = NOW()
       WHERE contact_id = $3`,
      [status, notes, contactId]
    );

    res.json({
      success: true,
      message: 'Contact status updated'
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
});

// Delete contacts
router.delete('/batch', async (req, res) => {
  try {
    const { userId, contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs array is required'
      });
    }

    // Delete in batches to avoid large IN clauses
    const batchSize = 100;
    let totalDeleted = 0;

    for (let i = 0; i < contactIds.length; i += batchSize) {
      const batch = contactIds.slice(i, i + batchSize);
      const placeholders = batch.map((_, index) => `$${index + 2}`).join(',');
      
      const result = await db.query(
        `DELETE FROM page_contacts 
         WHERE user_id = $1 AND contact_id IN (${placeholders})`,
        [userId, ...batch]
      );

      totalDeleted += result.rowCount;
    }

    res.json({
      success: true,
      message: `Deleted ${totalDeleted} contacts`
    });

  } catch (error) {
    console.error('Delete contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contacts'
    });
  }
});

// Assign contacts to AI or Human
router.post('/assign', async (req, res) => {
  try {
    const { userId, contactIds, assignTo } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs array is required'
      });
    }

    // Update contacts assignment
    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < contactIds.length; i += batchSize) {
      const batch = contactIds.slice(i, i + batchSize);
      const placeholders = batch.map((_, index) => `$${index + 3}`).join(',');
      
      const result = await db.query(
        `UPDATE page_contacts 
         SET assigned_to = $1, assigned_at = NOW(), updated_at = NOW()
         WHERE user_id = $2 AND contact_id IN (${placeholders})`,
        [assignTo, userId, ...batch]
      );

      totalUpdated += result.rowCount;
    }

    res.json({
      success: true,
      message: `Assigned ${totalUpdated} contacts to ${assignTo}`
    });

  } catch (error) {
    console.error('Assign contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign contacts'
    });
  }
});

// Get contact statistics
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;

    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN assigned_to = 'ai' THEN 1 END) as ai_assigned,
        COUNT(CASE WHEN assigned_to = 'human' THEN 1 END) as human_assigned,
        COUNT(CASE WHEN assigned_to = 'unassigned' THEN 1 END) as unassigned,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_contacts,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted
       FROM page_contacts 
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      stats: stats.rows[0]
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contact statistics'
    });
  }
});

// Update contact details
router.put('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { name, phone, email, company, address, status, notes, tags } = req.body;

    const result = await db.query(
      `UPDATE page_contacts 
       SET name = $1, phone = $2, email = $3, company = $4, address = $5, 
           status = $6, notes = $7, tags = $8, updated_at = NOW()
       WHERE contact_id = $9
       RETURNING contact_id, name, phone, email, company, address, status, 
                 lead_score as "leadScore", tags, notes, assigned_to as "assignedTo",
                 assigned_at as "assignedAt", created_at`,
      [name, phone, email, company, address, status, notes, tags, contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      contact: result.rows[0]
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
});

// Get single contact
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await db.query(
      `SELECT contact_id, name, phone, email, company, address, status, 
              lead_score as "leadScore", tags, notes, assigned_to as "assignedTo",
              assigned_at as "assignedAt", last_contacted, created_at
       FROM page_contacts 
       WHERE contact_id = $1`,
      [contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      contact: result.rows[0]
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contact'
    });
  }
});

// Bulk update contact status
router.post('/bulk-status', async (req, res) => {
  try {
    const { userId, contactIds, status, notes } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs array is required'
      });
    }

    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < contactIds.length; i += batchSize) {
      const batch = contactIds.slice(i, i + batchSize);
      const placeholders = batch.map((_, index) => `$${index + 4}`).join(',');
      
      const result = await db.query(
        `UPDATE page_contacts 
         SET status = $1, notes = COALESCE(CONCAT(notes, ' | ', $2), notes), 
             last_contacted = NOW(), updated_at = NOW()
         WHERE user_id = $3 AND contact_id IN (${placeholders})`,
        [status, notes || `Bulk update: ${new Date().toISOString()}`, userId, ...batch]
      );

      totalUpdated += result.rowCount;
    }

    res.json({
      success: true,
      message: `Updated status for ${totalUpdated} contacts`
    });

  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact statuses'
    });
  }
});

// Search contacts with advanced filtering
router.get('/search/advanced', async (req, res) => {
  try {
    const { 
      userId, 
      page = 1, 
      limit = 50, 
      search = '', 
      status = '',
      assignedTo = '',
      minLeadScore = 0,
      maxLeadScore = 100,
      tags = ''
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = ['c.user_id = $1'];
    let params = [userId];
    let paramCount = 1;

    // Search term
    if (search) {
      paramCount++;
      whereConditions.push(`(
        c.name ILIKE $${paramCount} OR 
        c.phone ILIKE $${paramCount} OR 
        c.email ILIKE $${paramCount} OR 
        c.company ILIKE $${paramCount} OR
        c.notes ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    // Status filter
    if (status && status !== 'all') {
      paramCount++;
      whereConditions.push(`c.status = $${paramCount}`);
      params.push(status);
    }

    // Assignment filter
    if (assignedTo && assignedTo !== 'all') {
      paramCount++;
      whereConditions.push(`c.assigned_to = $${paramCount}`);
      params.push(assignedTo);
    }

    // Lead score range
    paramCount++;
    whereConditions.push(`c.lead_score >= $${paramCount}`);
    params.push(minLeadScore);

    paramCount++;
    whereConditions.push(`c.lead_score <= $${paramCount}`);
    params.push(maxLeadScore);

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      paramCount++;
      whereConditions.push(`c.tags && $${paramCount}`);
      params.push(tagArray);
    }

    // Get total count
    const countQuery = await db.query(
      `SELECT COUNT(*) FROM page_contacts c WHERE ${whereConditions.join(' AND ')}`,
      params
    );

    const totalCount = parseInt(countQuery.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated contacts
    params.push(limit, offset);
    const contactsQuery = await db.query(
      `SELECT c.contact_id, c.name, c.phone, c.email, c.company, 
              c.address, c.status, c.lead_score as "leadScore", c.tags, c.notes,
              c.last_contacted, c.assigned_to as "assignedTo", c.assigned_at as "assignedAt",
              c.created_at
       FROM page_contacts c 
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY c.lead_score DESC, c.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );

    res.json({
      success: true,
      contacts: contactsQuery.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        status,
        assignedTo,
        minLeadScore,
        maxLeadScore,
        tags
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search contacts'
    });
  }
});

module.exports = router;