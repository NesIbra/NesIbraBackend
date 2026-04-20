require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const developerRoutes = require('./routes/developers');
const articleRoutes = require('./routes/articles');
const contactRoutes = require('./routes/contacts');
const seedRoutes = require('./routes/seed');

const app = express();
const PORT = process.env.PORT || 5000;

const normalizeOrigin = (value) => value ? value.replace(/\/$/, '') : value;
const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
const frontendHost = frontendOrigin ? new URL(frontendOrigin).host : null;
const frontendPreviewPrefix = frontendHost?.endsWith('.vercel.app')
  ? `${frontendHost.replace('.vercel.app', '')}-`
  : null;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (frontendOrigin && normalizedOrigin === frontendOrigin) {
      callback(null, true);
      return;
    }

    if (frontendPreviewPrefix) {
      try {
        const { host } = new URL(normalizedOrigin);
        if (host.endsWith('.vercel.app') && host.startsWith(frontendPreviewPrefix)) {
          callback(null, true);
          return;
        }
      } catch (error) {
        callback(new Error('Invalid origin'));
        return;
      }
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, try again later.' },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/seed', seedRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
