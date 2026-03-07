import { useState, useCallback, useRef } from "react";
import Hls from "hls.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { AlertCircle, RefreshCw, Volume2 } from "lucide-react";
import { fetchVideoToken } from "../api";
import type { VideoToken } from "../types";

const isBunnyEmbed = (url: string) =>
  url.includes("iframe.mediadelivery.net") || url.includes("/embed/");

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
        <Volume2 className="absolute inset-0 m-auto h-6 w-6 text-white/60" />
      </div>
      <p className="text-white/60 text-sm">Loading video...</p>
    </div>
  );
}

function ErrorOverlay({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 px-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <div>
        <p className="text-white font-medium mb-1">Could not load video</p>
        <p className="text-white/60 text-sm">{msg}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}
        className="border-white/30 text-white hover:bg-white/10 cursor-pointer">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );
}

function VideoPlayer({ videoId }: { videoId: number }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hlsRef = useRef<Hls | null>(null);

  const [status, setStatus] = useState<"loading" | "iframe" | "hls" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    setStatus("loading");
    setErrorMsg("");
    setPlaybackUrl(null);
    try {
      const token: VideoToken = await fetchVideoToken(videoId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => loadToken(), token.expiresInSeconds * 800);
      setPlaybackUrl(token.playbackUrl);
      setStatus(isBunnyEmbed(token.playbackUrl) ? "iframe" : "hls");
    } catch {
      setErrorMsg("Could not load video. Please try again.");
      setStatus("error");
    }
  }, [videoId]);

  useState(() => { void loadToken(); });

  const onVideoMounted = useCallback((el: HTMLVideoElement | null) => {
    if (!el || !playbackUrl) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(playbackUrl);
      hls.attachMedia(el);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) { setErrorMsg("Playback error."); setStatus("error"); }
      });
    } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = playbackUrl;
    } else {
      setErrorMsg("Your browser does not support this video format.");
      setStatus("error");
    }
  }, [playbackUrl]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
      {status === "iframe" && playbackUrl && (
        <iframe
          src={playbackUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
      {status === "hls" && (
        <video ref={onVideoMounted} controls playsInline className="absolute inset-0 w-full h-full" />
      )}
      {status === "loading" && <LoadingOverlay />}
      {status === "error" && <ErrorOverlay msg={errorMsg} onRetry={loadToken} />}
    </div>
  );
}

interface VideoLessonModalProps {
  open: boolean;
  onClose: () => void;
  videoId: number;
  lessonTitle: string;
}

export default function VideoLessonModal({
  open,
  onClose,
  videoId,
  lessonTitle,
}: VideoLessonModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl bg-zinc-950 border-zinc-800">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-zinc-800">
          <DialogTitle className="text-base font-semibold text-white leading-tight truncate">
            {lessonTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {open && <VideoPlayer key={videoId} videoId={videoId} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
