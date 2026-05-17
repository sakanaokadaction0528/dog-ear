'use client'

import { usePosts } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TopBar } from '@/components/layout/TopBar'
import { toast } from 'sonner'

export default function FeedPage() {
  const { posts, loading, toggleWant, deletePost } = usePosts()

  async function handleToggleWant(postId: string) {
    try {
      await toggleWant(postId)
    } catch {
      toast.error('エラーが発生しました')
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('この投稿を削除しますか？')) return
    try {
      await deletePost(postId)
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div>
      <TopBar title="フィード" />
      <div className="px-4 pt-4 pb-24 space-y-4">
        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <EmptyState
            title="まだ投稿がありません"
            description="本の詳細画面から「おすすめを投稿する」で投稿できます"
          />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleWant={handleToggleWant}
              onDelete={handleDelete}
              isOwner={post.user_id === 'preview'}
            />
          ))
        )}
      </div>
    </div>
  )
}
