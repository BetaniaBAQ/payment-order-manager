import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
    </div>
  )
}
