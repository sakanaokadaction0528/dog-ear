'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewPosts, previewWants } from '@/lib/preview/store'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { Post } from '@/lib/types/app.types'

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'
const PREVIEW_USER_ID = 'preview'

let postsCache: (Post & { is_wanted: boolean })[] | null = null

export function usePosts() {
  const { isGuest } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const [posts, setPosts] = useState<(Post & { is_wanted: boolean })[]>(postsCache ?? [])
  const [loading, setLoading] = useState(postsCache === null)

  const fetchPosts = useCallback(async () => {
    if (IS_PREVIEW) {
      const all = previewPosts.getAll()
      const hydrated = all.map((p) => ({
        ...p,
        is_wanted: previewWants.hasWanted(p.id, PREVIEW_USER_ID),
      }))
      postsCache = hydrated
      setPosts(hydrated)
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) { setLoading(false); return }
    const fallback = setTimeout(() => setLoading(false), 4000)
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        const hydrated = data.map((p: Post) => ({ ...p, is_wanted: false }))
        postsCache = hydrated
        setPosts(hydrated)
      }
    } catch { /* ignore */ } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const createPost = useCallback(async (values: {
    book_id: string | null
    book_title: string
    book_author: string
    comment: string
    image_url: string | null
  }) => {
    if (IS_PREVIEW) {
      const post = previewPosts.create(values)
      const hydrated = { ...post, is_wanted: false }
      postsCache = [hydrated, ...(postsCache ?? [])]
      setPosts((prev) => [hydrated, ...prev])
      return post
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...values, user_id: session.user.id })
      .select()
      .single()
    if (error) throw error
    postsCache = null
    await fetchPosts()
    return data
  }, [fetchPosts])

  const toggleWant = useCallback(async (postId: string) => {
    if (IS_PREVIEW) {
      const wanted = previewWants.toggle(postId, PREVIEW_USER_ID)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_wanted: wanted, want_count: p.want_count + (wanted ? 1 : -1) }
            : p
        )
      )
      if (postsCache) {
        postsCache = postsCache.map((p) =>
          p.id === postId
            ? { ...p, is_wanted: wanted, want_count: p.want_count + (wanted ? 1 : -1) }
            : p
        )
      }
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    const userId = session.user.id

    const { data: existing } = await supabase
      .from('wants')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('wants').delete().eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('wants').insert({ post_id: postId, user_id: userId })
      if (error) throw error
    }

    const wanted = !existing
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_wanted: wanted, want_count: p.want_count + (wanted ? 1 : -1) }
          : p
      )
    )
    if (postsCache) {
      postsCache = postsCache.map((p) =>
        p.id === postId
          ? { ...p, is_wanted: wanted, want_count: p.want_count + (wanted ? 1 : -1) }
          : p
      )
    }
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    if (IS_PREVIEW) {
      previewPosts.delete(postId)
      postsCache = (postsCache ?? []).filter((p) => p.id !== postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase not available')
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error
    postsCache = null
    await fetchPosts()
  }, [fetchPosts])

  return { posts, loading, createPost, toggleWant, deletePost, refetch: fetchPosts }
}
