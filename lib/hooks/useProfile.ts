'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/lib/context/AuthContext'

export interface Profile {
  id: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null
  bookshelf_public: boolean
}

export function useProfile() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, bio, bookshelf_public')
      .eq('id', user.id)
      .maybeSingle()
    setProfile(data as Profile | null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = useCallback(async (updates: {
    nickname?: string
    bio?: string
    avatar_url?: string | null
    bookshelf_public?: boolean
  }) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
    if (error) throw error
    setProfile(prev => ({
      id: user.id,
      nickname: null,
      avatar_url: null,
      bio: null,
      bookshelf_public: false,
      ...prev,
      ...updates,
    }))
  }, [user])

  return { profile, loading, updateProfile, refetch: fetchProfile }
}
