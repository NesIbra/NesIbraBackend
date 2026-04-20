const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const router = express.Router();

// POST /api/seed — populate database with sample data + admin user
// Run once, then remove or protect this route
router.post('/', async (req, res) => {
  try {
    // Create admin user
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'CloudAI@2024!', 12);
    await supabase.from('admin_users').upsert({
      email: process.env.ADMIN_EMAIL || 'admin@cloudai.com',
      password_hash: hash,
      name: 'Admin',
    }, { onConflict: 'email' });

    // Seed projects
    await supabase.from('projects').upsert([
      {
        title: 'AI Analytics Platform',
        description: 'A comprehensive analytics platform powered by artificial intelligence for real-time business insights and predictive modeling.',
        tech_stack: ['React', 'Python', 'TensorFlow', 'PostgreSQL'],
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        category: 'AI/ML',
        featured: true,
      },
      {
        title: 'E-Commerce Suite',
        description: 'Full-featured e-commerce solution with inventory management, payment processing, and customer analytics dashboard.',
        tech_stack: ['Next.js', 'Node.js', 'Stripe', 'MongoDB'],
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        category: 'Web App',
        featured: true,
      },
      {
        title: 'Cloud Infrastructure Manager',
        description: 'Multi-cloud infrastructure management tool with automated scaling, monitoring, and cost optimization.',
        tech_stack: ['Go', 'Kubernetes', 'AWS', 'Terraform'],
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        category: 'DevOps',
        featured: true,
      },
      {
        title: 'Mobile Banking App',
        description: 'Secure mobile banking application with biometric authentication, real-time transactions, and financial insights.',
        tech_stack: ['React Native', 'Node.js', 'PostgreSQL', 'Redis'],
        image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800',
        category: 'Mobile',
        featured: false,
      },
      {
        title: 'Healthcare Portal',
        description: 'Patient management system with telemedicine, appointment scheduling, and electronic health records.',
        tech_stack: ['Vue.js', 'Django', 'PostgreSQL', 'Docker'],
        image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        category: 'Healthcare',
        featured: false,
      },
      {
        title: 'Smart IoT Dashboard',
        description: 'Real-time IoT device monitoring and management dashboard with predictive maintenance capabilities.',
        tech_stack: ['React', 'Node.js', 'InfluxDB', 'MQTT'],
        image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        category: 'IoT',
        featured: true,
      },
    ], { onConflict: 'title', ignoreDuplicates: true });

    // Seed developers
    await supabase.from('developers').upsert([
      {
        name: 'Alex Chen',
        role: 'CEO & Full-Stack Developer',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        bio: 'Visionary tech leader with 10+ years building scalable applications.',
        social_links: { github: '#', linkedin: '#', twitter: '#' },
        display_order: 1,
      },
      {
        name: 'Sarah Miller',
        role: 'Lead Frontend Engineer',
        skills: ['React', 'TypeScript', 'Next.js', 'Figma'],
        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        bio: 'Passionate about creating beautiful, accessible user interfaces.',
        social_links: { github: '#', linkedin: '#', dribbble: '#' },
        display_order: 2,
      },
      {
        name: 'James Wilson',
        role: 'Backend Architect',
        skills: ['Node.js', 'Go', 'PostgreSQL', 'Kubernetes'],
        image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'Systems architect specializing in high-performance distributed systems.',
        social_links: { github: '#', linkedin: '#' },
        display_order: 3,
      },
      {
        name: 'Emily Zhang',
        role: 'AI/ML Engineer',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
        image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        bio: 'Machine learning expert bringing AI solutions to real-world problems.',
        social_links: { github: '#', linkedin: '#', twitter: '#' },
        display_order: 4,
      },
      {
        name: 'David Park',
        role: 'DevOps Engineer',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        bio: 'Infrastructure specialist ensuring smooth deployments and 99.99% uptime.',
        social_links: { github: '#', linkedin: '#' },
        display_order: 5,
      },
      {
        name: 'Lisa Kumar',
        role: 'UI/UX Designer',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        bio: 'Design thinker creating intuitive experiences through research-driven design.',
        social_links: { dribbble: '#', linkedin: '#', behance: '#' },
        display_order: 6,
      },
    ], { onConflict: 'name', ignoreDuplicates: true });

    // Seed articles
    await supabase.from('articles').upsert([
      {
        title: 'The Future of AI in Software Development',
        content: 'Artificial intelligence is revolutionizing how we build software. From code generation to automated testing, AI tools are becoming indispensable.\n\n## Key Trends\n\n### 1. AI-Powered Code Assistants\nTools like GitHub Copilot and Claude are transforming how developers write code.\n\n### 2. Automated Testing\nAI is making testing smarter by generating test cases and identifying edge cases.\n\n### 3. Intelligent DevOps\nFrom automated deployment strategies to predictive scaling, AI is making infrastructure more efficient.\n\n## Conclusion\nThe future of software development is a collaboration between human creativity and AI capability.',
        excerpt: 'Exploring how AI is transforming software development with code assistants, automated testing, and intelligent DevOps.',
        author: 'Alex Chen',
        cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        tags: ['AI', 'Development', 'Technology'],
        published: true,
      },
      {
        title: 'Building Scalable Microservices with Node.js',
        content: 'Microservices architecture has become the standard for building large-scale applications.\n\n## Why Microservices?\n\nMonolithic applications become difficult to maintain as they grow. Microservices break applications into smaller, independent services.\n\n## Key Principles\n\n### 1. Single Responsibility\nEach microservice should do one thing well.\n\n### 2. API-First Design\nDesign your APIs before writing implementation code.\n\n### 3. Event-Driven Communication\nUse message queues for asynchronous communication between services.\n\n## Best Practices\n- Use containerization (Docker)\n- Implement circuit breakers\n- Centralize logging and monitoring\n- Use API gateways',
        excerpt: 'A guide to building scalable microservices using Node.js, Docker, and modern architecture patterns.',
        author: 'James Wilson',
        cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        tags: ['Node.js', 'Microservices', 'Architecture'],
        published: true,
      },
      {
        title: 'Design Systems: Building Consistent UI at Scale',
        content: 'A well-crafted design system is the foundation of any successful product.\n\n## What is a Design System?\n\nA collection of reusable components, guidelines, and principles.\n\n## Core Components\n\n### 1. Design Tokens\nColors, typography, spacing, and foundational values.\n\n### 2. Component Library\nReusable UI components built with accessibility in mind.\n\n### 3. Documentation\nClear guidelines on when and how to use each component.\n\n## Building Your System\n- Start small\n- Accessibility from day one\n- Responsive design patterns\n- Clear naming conventions',
        excerpt: 'How to build and maintain a design system that scales with your team.',
        author: 'Lisa Kumar',
        cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        tags: ['Design', 'UI/UX', 'Frontend'],
        published: true,
      },
    ], { onConflict: 'title', ignoreDuplicates: true });

    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

module.exports = router;
