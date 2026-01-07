import { useState } from 'react';
import { Post } from '@/lib/api';
import { Image, Link as LinkIcon, X } from 'lucide-react';

interface PostFormProps {
  initialData?: Partial<Post>;
  onSubmit: (data: {
    title: string;
    content: string;
    image_url?: string;
    link_url?: string;
    link_text?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PostForm({ initialData, onSubmit, onCancel, isLoading }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || '');
  const [linkText, setLinkText] = useState(initialData?.link_text || '');
  const [showImageField, setShowImageField] = useState(!!initialData?.image_url);
  const [showLinkFields, setShowLinkFields] = useState(!!initialData?.link_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      content,
      image_url: imageUrl || undefined,
      link_url: linkUrl || undefined,
      link_text: linkText || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input"
          placeholder="Enter post title..."
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="admin-input min-h-[200px] resize-y"
          placeholder="Write your post content here..."
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowImageField(!showImageField)}
          className={`btn-ghost flex items-center gap-2 ${showImageField ? 'bg-muted' : ''}`}
        >
          <Image className="h-4 w-4" />
          Add Image
        </button>
        <button
          type="button"
          onClick={() => setShowLinkFields(!showLinkFields)}
          className={`btn-ghost flex items-center gap-2 ${showLinkFields ? 'bg-muted' : ''}`}
        >
          <LinkIcon className="h-4 w-4" />
          Add Link
        </button>
      </div>

      {showImageField && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground">
              Image URL
            </label>
            <button
              type="button"
              onClick={() => {
                setShowImageField(false);
                setImageUrl('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="admin-input"
            placeholder="https://example.com/image.jpg"
          />
          {imageUrl && (
            <div className="mt-3">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {showLinkFields && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Related Link</span>
            <button
              type="button"
              onClick={() => {
                setShowLinkFields(false);
                setLinkUrl('');
                setLinkText('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label htmlFor="linkUrl" className="block text-sm text-muted-foreground mb-1">
              URL
            </label>
            <input
              id="linkUrl"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="admin-input"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="linkText" className="block text-sm text-muted-foreground mb-1">
              Link Text (optional)
            </label>
            <input
              id="linkText"
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="admin-input"
              placeholder="Click here to learn more"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Post' : 'Create Post'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
