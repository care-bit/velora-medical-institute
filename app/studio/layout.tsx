import { StudioSidebar } from '@/components/studio/sidebar'

export const metadata = {
  title: 'AI Video Studio | Sightline',
  description: 'Create short-form videos with AI',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#060607]">
      <StudioSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
