import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostCardData } from "@/lib/queries/blog";

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-sticker border border-border bg-card shadow-sticker-1 transition-all hover:-translate-y-1 hover:shadow-sticker-3"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.category ? (
            <span className="font-semibold text-primary">{post.category.name}</span>
          ) : null}
          {post.publishedAt ? <span>· {formatDate(post.publishedAt)}</span> : null}
          {post.readingMinutes ? <span>· {post.readingMinutes} min</span> : null}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}
