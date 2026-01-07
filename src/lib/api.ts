// API client for self-hosted Express backend

const API_BASE = '/api';

interface LoginResponse {
  token: string;
  user: { id: number; username: string };
}

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  author_id: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

// Token management
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

// Auth headers helper
function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth API
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  return response.json();
}

export async function getCurrentUser(): Promise<{ user: { id: number; username: string } } | null> {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// Posts API
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  const data = await response.json();
  return data.posts;
}

export async function getPost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE}/posts/${id}`);
  if (!response.ok) throw new Error('Failed to fetch post');
  const data = await response.json();
  return data.post;
}

export async function createPost(post: {
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
}): Promise<Post> {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create post');
  }
  
  const data = await response.json();
  return data.post;
}

export async function updatePost(id: number, post: {
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
}): Promise<Post> {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update post');
  }
  
  const data = await response.json();
  return data.post;
}

export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete post');
  }
}

export type { Post, LoginResponse };
