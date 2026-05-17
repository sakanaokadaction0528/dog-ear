'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { usePosts } from '@/lib/hooks/usePosts'
import { useFollowingIds } from '@/lib/hooks/useFollow'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PostCardSkeleton } from '@/components/shared/Skeleton'
import { TopBar } from '@/components/layout/TopBar'
import { toast } from 'sonner'
import { useAuthContext } from '@/lib/context/AuthContext'
import { cn } from '@/lib/utils/cn'

type FeedTab = 'all' | 'following'

export default function FeedPage() {
  const { user } = useAuthContext()
  const { posts, loading, toggleWant, deletePost, refetch } = usePosts()
  const followingIds = useFollowingIds()
  const [tab, setTab] = useState<FeedTab>('all')
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

  const visiblePosts = tab === 'following'
    ? posts.filter(p => followingIds.includes(p.user_id))
    : posts

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

      {/* Tabs */}
      {user && (
        <div className="flex border-b border-border px-4">
          {(['all', 'following'] as FeedTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'py-2.5 px-4 text-sm font-medium transition-colors border-b-2 -mb-px',
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'all' ? '全員' : 'フォロー中'}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 pb-24 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map(i => <PostCardSkeleton key={i} />)}
          </div>
        ) : visiblePosts.length === 0 ? (
          <EmptyState
            title={tab === 'following' ? 'フォロー中の投稿がありません' : 'まだ投稿がありません'}
            description={tab === 'following' ? 'ユーザーをフォローすると投稿が表示されます' : '本の詳細画面から「おすすめを投稿する」で投稿できます'}
          />
        ) : (
          visiblePosts.map((post) => (
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
