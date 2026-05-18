'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Moon, Sun, User, Library } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { toast } from 'sonner'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/lib/hooks/useProfile'
import { useAuthContext } from '@/lib/context/AuthContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

async function compressAvatar(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const SIZE = 400
      const scale = Math.min(1, SIZE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { profile, loading, updateProfile } = useProfile()
  const { theme, setTheme } = useTheme()

  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [bookshelfPublic, setBookshelfPublic] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname ?? '')
      setBio(profile.bio ?? '')
      setBookshelfPublic(profile.bookshelf_public ?? false)
      setAvatarUrl(profile.avatar_url ?? null)
    }
  }, [profile])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const compressed = await compressAvatar(file)
      const supabase = getSupabaseBrowserClient()
      if (supabase && user) {
        const path = `${user.id}/avatar.jpg`
        const { error } = await supabase.storage
          .from('avatars')
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: true })
        if (!error) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
        }
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateProfile({
        nickname: nickname.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl,
        bookshelf_public: bookshelfPublic,
      })
      toast.success('プロフィールを保存しました')
      router.push('/mypage')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <div>
      <TopBar title="プロフィール編集" showBack />
      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* アバター */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="アバター"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                <User size={40} className="text-primary" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              {uploading
                ? <Loader2 size={14} className="text-white animate-spin" />
                : <Camera size={14} className="text-white" />
              }
            </div>
          </button>
          <p className="text-xs text-muted-foreground">タップして写真を変更</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* ニックネーム */}
        <div className="space-y-1.5">
          <Label htmlFor="nickname">ニックネーム</Label>
          <Input
            id="nickname"
            placeholder="例：読書好き太郎"
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{nickname.length}/30</p>
        </div>

        {/* 紹介文 */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">紹介文</Label>
          <Textarea
            id="bio"
            placeholder="読んでいるジャンルや読書の目標など..."
            rows={4}
            maxLength={150}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
        </div>

        {/* テーマ設定 */}
        <div className="flex items-center justify-between py-3 px-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon size={16} className="text-muted-foreground shrink-0" />
            ) : (
              <Sun size={16} className="text-muted-foreground shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">ダークモード</p>
              <p className="text-xs text-muted-foreground">画面の明暗を切り替えます</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 本棚公開設定 */}
        <div className="flex items-center justify-between py-3 px-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <Library size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">本棚を公開する</p>
              <p className="text-xs text-muted-foreground">他のユーザーが本棚を閲覧できます</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBookshelfPublic(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${bookshelfPublic ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${bookshelfPublic ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={saving || uploading}
        >
          {saving ? '保存中...' : '保存する'}
        </Button>
      </div>
    </div>
  )
}
