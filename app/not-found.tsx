import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Page Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Go Home</Button>
            </Link>
            <Link href="/genres">
              <Button variant="outline">Browse Genres</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
