const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// GET /api/developers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get developers error:', err);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

// GET /api/developers/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Developer not found' });

    res.json(data);
  } catch (err) {
    console.error('Get developer error:', err);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

const devValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('role').trim().notEmpty().withMessage('Role required'),
  body('skills').isArray().withMessage('skills must be an array'),
];

// POST /api/developers (admin)
router.post('/', auth, devValidation, validate, async (req, res) => {
  try {
    const { name, role, skills, image_url, bio, social_links, display_order } = req.body;

    const { data, error } = await supabase
      .from('developers')
      .insert({ name, role, skills, image_url, bio, social_links: social_links || {}, display_order: display_order || 0 })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Create developer error:', err);
    res.status(500).json({ error: 'Failed to create developer' });
  }
});

// PUT /api/developers/:id (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, role, skills, image_url, bio, social_links, display_order } = req.body;

    const { data, error } = await supabase
      .from('developers')
      .update({ name, role, skills, image_url, bio, social_links, display_order, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Developer not found' });

    res.json(data);
  } catch (err) {
    console.error('Update developer error:', err);
    res.status(500).json({ error: 'Failed to update developer' });
  }
});

// DELETE /api/developers/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('developers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Developer deleted' });
  } catch (err) {
    console.error('Delete developer error:', err);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

module.exports = router;
