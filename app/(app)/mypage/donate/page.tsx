'use client'

import { Heart } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

const DONATE_URL = 'https://buymeacoffee.com/pashariartr'

export default function DonatePage() {
  return (
    <div>
      <TopBar title="作者への寄付" showBack />
      <div className="px-4 pt-6 pb-12 space-y-6 max-w-lg mx-auto">

        {/* Icon */}
        <div className="flex justify-center pt-2">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart size={32} className="text-rose-400 fill-rose-200" />
          </div>
        </div>

        {/* Message */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 text-sm text-foreground leading-relaxed">
          <p>いつもご利用いただきありがとうございます。<br />このアプリの作者です。</p>
          <p>突然ですが、作者はアプリ開発は好きなのに、収益化と経営がびっくりするほど下手です。<br />もはや「アプリは動いているのに、作者の財布だけが静かにクラッシュしている」状態です。</p>
          <p>このアプリの開発にはそれなりにお金をかけており、AI機能を使うたびに実はコストも発生しています。<br />現在はまだユーザー数が少ないため、なんとか作者の自腹で運営しています。</p>
          <p>もしこのアプリを「ちょっと応援してもいいよ」「作者の財布を再起動してあげてもいいよ」と思っていただけましたら、協賛・寄付という形でご支援いただけると本当に助かります。</p>
          <p>いただいたご支援は、アプリの改善・AI機能の維持・作者のメンタル保護に大切に使わせていただきます。</p>
          <p>無理のない範囲で、応援していただけると嬉しいです。<br />今後ともよろしくお願いいたします。</p>
        </div>

        {/* Donate button */}
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-sm"
        >
          <Heart size={16} className="fill-white" />
          作者に寄付する
        </a>

        <p className="text-xs text-muted-foreground text-center">
          外部サービスへ移動します
        </p>
      </div>
    </div>
  )
}
