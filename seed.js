// seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear old data so re-seeding is safe
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  // ── Create unique index on email ────────────────────────────────────────
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // ── Users ────────────────────────────────────────────────────────────────
  const hash1 = await bcrypt.hash('happymuazz', 10);
  const hash2 = await bcrypt.hash('muazzhappy', 10);

  const u1 = await db.collection('users').insertOne({
    email: 'ahsan@mail.com',   // fixed typo
    passwordHash: hash1,       // FIXED
    name: 'ahsan',
    createdAt: new Date()
  });

  const u2 = await db.collection('users').insertOne({
    email: 'ali@mail.com',
    passwordHash: hash2,       // FIXED
    name: 'ali',
    createdAt: new Date()
  });

  const ahsanId = u1.insertedId;
  const aliId   = u2.insertedId;

  // ── Projects ─────────────────────────────────────────────────────────────
  const p1 = await db.collection('projects').insertOne({
    ownerId: ahsanId,
    name: 'FYP',
    description: 'Final year project',
    archived: false,
    createdAt: new Date('2024-01-10')
  });

  const p2 = await db.collection('projects').insertOne({
    ownerId: ahsanId,
    name: 'Website',
    description: 'Personal website',
    archived: false,
    createdAt: new Date('2026-04-27')
  });

  const p3 = await db.collection('projects').insertOne({
    ownerId: aliId,
    name: 'Mobile App',
    description: 'Sleep cycle app',
    archived: false,
    createdAt: new Date('2026-04-27')
  });

  const p4 = await db.collection('projects').insertOne({
    ownerId: aliId,
    name: 'Blog',
    description: 'Old blog project',
    archived: false,
    createdAt: new Date('2023-11-20')
  });

  const fyp = p1.insertedId;
  const web = p2.insertedId;
  const app = p3.insertedId;
  const blog = p4.insertedId;

  // ── Tasks ────────────────────────────────────────────────────────────────
  await db.collection('tasks').insertOne({
    ownerId: ahsanId,
    projectId: fyp,
    title: 'Write literature review',
    status: 'in-progress',
    priority: 3,
    tags: ['writing', 'research'],
    subtasks: [
      { title: 'Collect 10 papers', done: true },
      { title: 'Write summary', done: false },
      { title: 'Finalize draft', done: false }
    ],
    dueDate: new Date('2026-04-30'),
    createdAt: new Date('2026-01-12')
  });

  await db.collection('tasks').insertOne({
    ownerId: ahsanId,
    projectId: fyp,
    title: 'Set up development environment',
    status: 'done',
    priority: 2,
    tags: ['setup'],
    subtasks: [
      { title: 'Install Node.js', done: true },
      { title: 'Install MongoDB', done: true }
    ],
    createdAt: new Date('2024-01-11')
  });

  await db.collection('tasks').insertOne({
    ownerId: ahsanId,
    projectId: web,
    title: 'Design homepage layout',
    status: 'todo',
    priority: 2,
    tags: ['design', 'frontend'],
    subtasks: [
      { title: 'Sketch wireframe', done: false },
      { title: 'Choose color palette', done: false }
    ],
    dueDate: new Date('2026-04-15'),
    createdAt: new Date('2026-04-20')
  });

  await db.collection('tasks').insertOne({
    ownerId: aliId,
    projectId: app,
    title: 'Implement login screen',
    status: 'in-progress',
    priority: 3,
    tags: ['android', 'auth'],
    subtasks: [
      { title: 'Design UI', done: true },
      { title: 'Connect to backend', done: false }
    ],
    createdAt: new Date('2024-04-28')
  });

  await db.collection('tasks').insertOne({
    ownerId: aliId,
    projectId: blog,
    title: 'Export blog posts to markdown',
    status: 'todo',
    priority: 1,
    tags: ['content', 'export'],
    subtasks: [
      { title: 'Write export script', done: false }
    ],
    dueDate: new Date('2026-06-01'),
    createdAt: new Date('2024-12-01') // fixed future mistake
  });

  // ── Notes ────────────────────────────────────────────────────────────────
  await db.collection('notes').insertOne({
    ownerId: ahsanId,
    projectId: fyp,
    title: 'Meeting notes',
    body: 'muazz is bad boy',
    tags: ['meeting'],
    createdAt: new Date('2024-01-18')
  });

  await db.collection('notes').insertOne({
    ownerId: ahsanId,
    projectId: web,
    title: 'Design ideas',
    body: 'muazz is beautiful',
    tags: ['design'],
    createdAt: new Date('2024-02-22')
  });

  await db.collection('notes').insertOne({
    ownerId: ahsanId,
    title: 'Personal note',
    body: 'muazz is private boy',
    tags: ['personal'],
    createdAt: new Date('2024-01-05')
  });

  await db.collection('notes').insertOne({
    ownerId: aliId,
    projectId: app,
    title: 'API endpoints',
    body: 'POST /auth/login, GET /summary',
    tags: ['api'],
    createdAt: new Date('2024-03-03')
  });

  await db.collection('notes').insertOne({
    ownerId: aliId,
    title: 'Daily standup',
    body: 'Yesterday / Today / Blockers',
    tags: ['meeting'],
    createdAt: new Date('2024-03-10')
  });

  console.log('✓ Seed complete!');
  console.log('Users:');
  console.log('  ahsan@mail.com / happymuazz');
  console.log('  ali@mail.com   / muazzhappy');

  process.exit(0);
})();