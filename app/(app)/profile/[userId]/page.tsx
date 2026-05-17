'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { User, ChevronDown, ChevronUp, Library } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { PostCard } from '@/components/posts/PostCard'
import { PostCardSkeleton } from '@/components/shared/Skeleton'
import { useAuthContext } from '@/lib/context/AuthContext'
import { usePosts } from '@/lib/hooks/usePosts'
import { useFollow } from '@/lib/hooks/useFollow'
import { cn } from '@/lib/utils/cn'
import { BOOK_STATUS_LABELS } from '@/lib/types/app.types'
import type { Post } from '@/lib/types/app.types'

type Profile = {
  id: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null
  bookshelf_public: boolean
}

type BookRow = {
  id: string
  title: string
  author: string
  status: 'unread' | 'reading' | 'finished' | 'review'
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuthContext()
  const { posts, loading: postsLoading, toggleWant } = usePosts()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { isFollowing, followerCount, followingCount, loading: followLoading, toggle } = useFollow(userId)
  const [books, setBooks] = useState<BookRow[]>([])
  const [booksOpen, setBooksOpen] = useState(false)

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    async function fetchProfile() {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) { setProfileLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, bio, bookshelf_public')
        .eq('id', userId)
        .single()
      setProfile(data)
      setProfileLoading(false)

      if (data?.bookshelf_public) {
        const { data: booksData } = await supabase
          .from('books')
          .select('id, title, author, status')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        setBooks((booksData ?? []) as BookRow[])
      }
    }
    fetchProfile()
  }, [userId])

  const userPosts = posts.filter((p: Post & { is_wanted: boolean }) => p.user_id === userId)
  const displayName = profile?.nickname ?? '匿名'

  return (
    <div>
      <TopBar title="プロフィール" showBack />
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-3 py-2">
          {profileLoading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="アバター" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{displayName}</p>
                {profile?.bio && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-relaxed">{profile.bio}</p>
                )}
              </div>

              {/* Follow counts */}
              <div className="flex items-center gap-6 mt-1">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{followerCount}</p>
                  <p className="text-xs text-muted-foreground">フォロワー</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">フォロー中</p>
                </div>
              </div>

              {/* Follow button (not shown on own profile) */}
              {!isOwnProfile && user && !followLoading && (
                <button
                  onClick={toggle}
                  className={cn(
                    'mt-1 px-6 py-1.5 rounded-full text-sm font-medium transition-colors',
                    isFollowing
                      ? 'bg-secondary text-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  )}
                >
                  {isFollowing ? 'フォロー中' : 'フォローする'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Bookshelf (collapsible) */}
        {profile?.bookshelf_public && books.length > 0 && (
          <section>
            <button
              onClick={() => setBooksOpen(v => !v)}
              className="w-full flex items-center justify-between py-2 mb-2"
            >
              <div className="flex items-center gap-2">
                <Library size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">本棚</span>
                <span className="text-xs text-muted-foreground">({books.length}冊)</span>
              </div>
              {booksOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {booksOpen && (
              <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                {books.map(book => (
                  <div key={book.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      {book.author && <p className="text-xs text-muted-foreground truncate">{book.author}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-2 py-0.5 rounded-full">
                      {BOOK_STATUS_LABELS[book.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Posts */}
        <section>
          <p className="text-sm font-semibold text-foreground mb-3">投稿一覧</p>
          {postsLoading ? (
            <div className="space-y-4">
              {[0, 1].map(i => <PostCardSkeleton key={i} />)}
            </div>
          ) : userPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">まだ投稿がありません</p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleWant={toggleWant}
                  isOwner={post.user_id === user?.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
