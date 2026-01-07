import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, deletePost, Post } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      if (!id) return;
      try {
        const data = await getPost(parseInt(id));
        setPost(data);
      } catch (err) {
        setError('Post not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [id]);

  async function handleDelete() {
    if (!post) return;
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deletePost(post.id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-24"></div>
          <div className="h-10 bg-muted rounded w-3/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Post Not Found
        </h1>
        <p className="text-muted-foreground mb-6">{error || "The post you're looking for doesn't exist."}</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all posts
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.created_at}>{formattedDate}</time>
          {post.author_name && (
            <>
              <span>•</span>
              <span>By {post.author_name}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        {isAuthenticated && (
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <Link
              to={`/admin`}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Edit2 className="h-4 w-4" />
              Edit in Dashboard
            </Link>
            <button
              onClick={handleDelete}
              className="btn-ghost flex items-center gap-2 text-sm text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </header>

      {post.image_url && (
        <figure className="mb-8 -mx-4 md:mx-0">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full rounded-lg md:rounded-xl object-cover max-h-[500px]"
          />
        </figure>
      )}

      <div className="prose prose-lg max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {post.link_url && (
        <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-2">Related Link</p>
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ExternalLink className="h-5 w-5" />
            {post.link_text || post.link_url}
          </a>
        </div>
      )}

      <footer className="mt-12 pt-8 border-t border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>
      </footer>
    </article>
  );
}
