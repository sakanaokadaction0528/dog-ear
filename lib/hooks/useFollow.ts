'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/lib/context/AuthContext'

export function useFollow(targetUserId: string) {
  const { user } = useAuthContext()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) { setLoading(false); return }

    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
    ])

    setFollowerCount(followers ?? 0)
    setFollowingCount(following ?? 0)

    if (user) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()
      setIsFollowing(!!data)
    }

    setLoading(false)
  }, [targetUserId, user])

  useEffect(() => { fetchData() }, [fetchData])

  const toggle = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) return

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
      setIsFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: targetUserId })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
  }, [isFollowing, user, targetUserId])

  return { isFollowing, followerCount, followingCount, loading, toggle }
}

export function useFollowingIds() {
  const { user } = useAuthContext()
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .then(({ data }) => {
        setFollowingIds((data ?? []).map(r => r.following_id))
      })
  }, [user])

  return followingIds
}
