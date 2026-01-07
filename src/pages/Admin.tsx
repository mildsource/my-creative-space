import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PostForm } from '@/components/PostForm';
import { getPosts, createPost, updatePost, deletePost, Post } from '@/lib/api';
import { Plus, Edit2, Trash2, Calendar, ExternalLink, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  async function loadPosts() {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data: Parameters<typeof createPost>[0]) {
    setIsSaving(true);
    try {
      await createPost(data);
      toast.success('Post created successfully');
      setIsFormOpen(false);
      loadPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(data: Parameters<typeof updatePost>[1]) {
    if (!editingPost) return;
    setIsSaving(true);
    try {
      await updatePost(editingPost.id, data);
      toast.success('Post updated successfully');
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deletePost(post.id);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const formattedDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your blog posts
          </p>
        </div>
        {!isFormOpen && !editingPost && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Post
          </button>
        )}
      </div>

      {(isFormOpen || editingPost) && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-6">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <PostForm
            initialData={editingPost || undefined}
            onSubmit={editingPost ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPost(null);
            }}
            isLoading={isSaving}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold">All Posts ({posts.length})</h2>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create your first post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate(post.created_at)}
                      </span>
                      {post.image_url && (
                        <span className="flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          Has image
                        </span>
                      )}
                      {post.link_url && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Has link
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
