const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// Stricter rate limit for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages. Please try again later.' },
});

// POST /api/contacts (public)
router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 255 }).escape(),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message required').isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters').escape(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, message } = req.body;

      const { data, error } = await supabase
        .from('contacts')
        .insert({ name, email, message, status: 'unread' })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'Message sent successfully', id: data.id });
    } catch (err) {
      console.error('Submit contact error:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// GET /api/contacts (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/stats (admin)
router.get('/stats', auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('status');
    if (error) throw error;

    const total = data.length;
    const unread = data.filter((c) => c.status === 'unread').length;
    const read = data.filter((c) => c.status === 'read').length;

    res.json({ total, unread, read });
  } catch (err) {
    console.error('Get contact stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// PUT /api/contacts/:id/status (admin — mark read/unread)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['read', 'unread'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "read" or "unread"' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Contact not found' });

    res.json(data);
  } catch (err) {
    console.error('Update contact status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/contacts/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Contact deleted' });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
