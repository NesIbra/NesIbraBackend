const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

// GET /api/articles (public — only published)
router.get('/', async (req, res) => {
  try {
    const { tag, search } = req.query;

    let query = supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (tag) query = query.contains('tags', [tag]);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/all (admin — includes drafts)
router.get('/all', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get all articles error:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Article not found' });

    res.json(data);
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

const articleValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('content').trim().notEmpty().withMessage('Content required'),
  body('author').trim().notEmpty().withMessage('Author required'),
];

// POST /api/articles (admin)
router.post('/', auth, articleValidation, validate, async (req, res) => {
  try {
    const { title, content, excerpt, author, cover_image, tags, published } = req.body;

    const { data, error } = await supabase
      .from('articles')
      .insert({ title, content, excerpt, author, cover_image, tags: tags || [], published: published || false })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/:id (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, excerpt, author, cover_image, tags, published } = req.body;

    const { data, error } = await supabase
      .from('articles')
      .update({ title, content, excerpt, author, cover_image, tags, published, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Article not found' });

    res.json(data);
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Article deleted' });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
