'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { User } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { PostCard } from '@/components/posts/PostCard'
import { PostCardSkeleton } from '@/components/shared/Skeleton'
import { useAuthContext } from '@/lib/context/AuthContext'
import { usePosts } from '@/lib/hooks/usePosts'
import { useFollow } from '@/lib/hooks/useFollow'
import { cn } from '@/lib/utils/cn'
import type { Post } from '@/lib/types/app.types'

type Profile = {
  id: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuthContext()
  const { posts, loading: postsLoading, toggleWant } = usePosts()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { isFollowing, followerCount, followingCount, loading: followLoading, toggle } = useFollow(userId)

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    async function fetchProfile() {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) { setProfileLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, bio')
        .eq('id', userId)
        .single()
      setProfile(data)
      setProfileLoading(false)
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
