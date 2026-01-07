import { Link } from 'react-router-dom';
import { Post } from '@/lib/api';
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="blog-card group">
      {post.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.created_at}>{formattedDate}</time>
          {post.author_name && (
            <>
              <span>•</span>
              <span>{post.author_name}</span>
            </>
          )}
        </div>

        <h2 className="blog-title mb-3 line-clamp-2">
          <Link to={`/post/${post.id}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>

        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.content.substring(0, 200)}...
        </p>

        <div className="flex items-center justify-between">
          <Link
            to={`/post/${post.id}`}
            className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
          >
            Read more
            <ArrowRight className="h-4 w-4" />
          </Link>

          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {post.link_text || 'Related link'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
