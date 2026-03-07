import { useState, useCallback, useRef } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCw, Volume2 } from "lucide-react";
import { fetchVideoToken } from "../api";
import { Button } from "@/shared/ui/button";
import type { VideoToken } from "../types";

const isBunnyEmbed = (url: string) =>
  url.includes("iframe.mediadelivery.net") || url.includes("/embed/");

interface VideoPlayerProps {
  videoId: number;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
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
      setErrorMsg("Failed to load video. Please try again.");
      setStatus("error");
    }
  }, [videoId]);

  // Run once on mount
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
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-xl">
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
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
            <Volume2 className="absolute inset-0 m-auto h-5 w-5 text-white/50" />
          </div>
          <p className="text-white/50 text-sm">Loading video...</p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 px-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <div>
            <p className="text-white font-medium mb-1">Could not load video</p>
            <p className="text-white/60 text-sm">{errorMsg}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadToken}
            className="border-white/30 text-white hover:bg-white/10 cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
