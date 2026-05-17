'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { usePosts } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PostCardSkeleton } from '@/components/shared/Skeleton'
import { TopBar } from '@/components/layout/TopBar'
import { toast } from 'sonner'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function FeedPage() {
  const { user } = useAuthContext()
  const { posts, loading, toggleWant, deletePost, refetch } = usePosts()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

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
      <TopBar
        title="フィード"
        rightAction={
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />
      <div className="px-4 pt-4 pb-24 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[0,1,2].map(i => <PostCardSkeleton key={i} />)}
          </div>
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
              isOwner={post.user_id === 'preview' || post.user_id === user?.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
