const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query;

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('featured', true);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Project not found' });

    res.json(data);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('tech_stack').isArray().withMessage('tech_stack must be an array'),
  body('category').trim().notEmpty().withMessage('Category required'),
];

// POST /api/projects (admin)
router.post('/', auth, projectValidation, validate, async (req, res) => {
  try {
    const { title, description, tech_stack, image_url, category, featured } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .insert({ title, description, tech_stack, image_url, category, featured: featured || false })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tech_stack, image_url, category, featured } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, tech_stack, image_url, category, featured, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found' });

    res.json(data);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
