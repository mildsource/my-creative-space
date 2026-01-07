import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, run } from '../db/index.js';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = queryOne<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/auth/me', authMiddleware, (req: AuthRequest, res) => {
  const user = queryOne<{ id: number; username: string }>(
    'SELECT id, username FROM users WHERE id = ?',
    [req.userId]
  );
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
});

// Get all posts (public)
router.get('/posts', (req, res) => {
  try {
    const posts = query(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post (public)
router.get('/posts/:id', (req, res) => {
  try {
    const post = queryOne(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post (protected)
router.post('/posts', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { title, content, image_url, link_url, link_text } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const result = run(
      'INSERT INTO posts (title, content, image_url, link_url, link_text, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, image_url || null, link_url || null, link_text || null, req.userId]
    );
    
    const newPost = queryOne('SELECT * FROM posts WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post (protected)
router.put('/posts/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { title, content, image_url, link_url, link_text } = req.body;
    
    const existingPost = queryOne('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    run(
      'UPDATE posts SET title = ?, content = ?, image_url = ?, link_url = ?, link_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, image_url || null, link_url || null, link_text || null, req.params.id]
    );
    
    const updatedPost = queryOne('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    res.json({ post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (protected)
router.delete('/posts/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const existingPost = queryOne('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
