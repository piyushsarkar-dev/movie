"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="bg-background min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-destructive mb-4">Oops!</h1>
          <h2 className="text-3xl font-bold text-foreground mb-3">Something went wrong</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an error while processing your request. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} className="bg-primary hover:bg-primary/90">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </main>
  )
}
