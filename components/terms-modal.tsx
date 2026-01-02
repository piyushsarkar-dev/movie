"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function TermsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has accepted terms
    const hasAccepted = localStorage.getItem("termsAccepted")
    if (!hasAccepted) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms & Conditions</DialogTitle>
          <DialogDescription>Please read and accept our terms before continuing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="space-y-3 text-sm text-foreground">
            <section>
              <h3 className="font-semibold text-base mb-2">Content Disclaimer</h3>
              <p className="text-muted-foreground">
                Free Streaming does not host any content on our servers. All movie data, posters, and metadata are
                sourced from The Movie Database (TMDB) API.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Streaming Source</h3>
              <p className="text-muted-foreground">
                Video streaming content is embedded from external third-party sources. We do not host, distribute, or
                provide direct access to any copyrighted materials.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Third-Party Services</h3>
              <p className="text-muted-foreground">
                This platform aggregates and displays information from external APIs and embeds content from third-party
                providers. We are not responsible for the availability or legality of embedded content.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Copyright Protection</h3>
              <p className="text-muted-foreground">
                Free Streaming respects intellectual property rights. We provide links to external sources and do not
                claim ownership of any content. If you believe content violates copyright laws, please contact the
                respective content provider directly.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Attribution</h3>
              <p className="text-muted-foreground">
                Movie data is provided by The Movie Database (TMDB). This product uses the TMDB API but is not endorsed
                or certified by TMDB.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">No Liability</h3>
              <p className="text-muted-foreground">
                We provide this service "as-is" without warranties. We are not responsible for any issues arising from
                embedded content or third-party services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Compliance</h3>
              <p className="text-muted-foreground">
                By using Free Streaming, you agree to comply with all applicable laws and regulations in your
                jurisdiction. You are solely responsible for ensuring your use of this platform is legal.
              </p>
            </section>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false)
              // Redirect or prevent access if needed
            }}
          >
            Decline
          </Button>
          <Button onClick={handleAccept} className="bg-primary hover:bg-primary/90">
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
