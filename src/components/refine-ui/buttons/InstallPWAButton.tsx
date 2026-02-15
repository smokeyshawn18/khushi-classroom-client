import Logo from "@/assets/LOGO.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share } from "lucide-react";
import { useState, useEffect } from "react";

const PWA_DISMISSED_KEY = "pwa-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    setShowTrigger(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const wasDismissed = sessionStorage.getItem(PWA_DISMISSED_KEY);
      if (!wasDismissed) setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (isStandalone()) setShowTrigger(false);
  }, []);

  const handleInstall = async () => {
    setOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem(PWA_DISMISSED_KEY, "1");
  };

  const handleOpenInstall = () => setOpen(true);

  if (!showTrigger || isStandalone()) return null;

  const iosMode = isIOS();

  return (
    <>
      <button
        onClick={handleOpenInstall}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
        aria-label="Install app"
      >
        <Download className="size-4" />
        Install app
      </button>

      <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
        <DialogContent showCloseButton={true} className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="flex justify-center">
              <img
                src={Logo}
                alt="Khushi Edu"
                className="h-20 w-20 rounded-xl object-cover shadow-md"
              />
            </div>
            <DialogTitle className="pt-2">Install Khushi Edu</DialogTitle>
            <DialogDescription>
              {iosMode
                ? "Tap Share, then 'Add to Home Screen' to install."
                : "Add to your home screen for quick access and a better experience."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center pt-2">
            <Button variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
            {iosMode ? (
              <Button onClick={handleDismiss}>
                <Share className="size-4" />
                Got it
              </Button>
            ) : (
              <Button onClick={handleInstall}>
                <Download className="size-4" />
                Install
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
