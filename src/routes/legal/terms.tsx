import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
    </div>
  )
}
