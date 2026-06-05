import { PostForm } from "@/components/admin/post-form";
import { AdminHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";

export default async function NewPost() {
  const categories = await db.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <AdminHeader title="Novo artigo" />
      <PostForm categories={categories} />
    </div>
  );
}
