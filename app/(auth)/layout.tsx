// Auth pages check session and redirect — must be dynamic
export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* App logo/title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📖</div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dog Ear</h1>
          <p className="text-sm text-muted-foreground mt-1">読書を、行動に変える</p>
        </div>
        {children}
      </div>
    </div>
  )
}
