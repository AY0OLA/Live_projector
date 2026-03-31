import { useEffect, useRef, useState } from "react";

type TranscriptCallback = (line: string) => void;

type UseMicStreamReturn = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isRecording: boolean;
  transcript: string[];
  error: string | null;
};

export default function useMicStream(
  onTranscript?: TranscriptCallback,
): UseMicStreamReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // safe cleanup
      try {
        const mr = mediaRecorderRef.current;
        if (mr && mr.state !== "inactive") mr.stop();
      } catch {}
      try {
        socketRef.current?.close();
      } catch {}
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  const detectMimeType = (): string | undefined => {
    // prefer widely supported Opus in WebM if available
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const m of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m))
        return m;
    }
    return undefined;
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = detectMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");
      socketRef.current = socket;
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        try {
          mediaRecorder.start(1000); // 1s timeslice
          setIsRecording(true);
        } catch (e) {
          console.error("MediaRecorder start failed", e);
          setError("Failed to start recorder");
        }
      };

      socket.onmessage = (event) => {
        try {
          if (typeof event.data === "string") {
            const data = JSON.parse(event.data);
            if (data?.transcript) {
              const line = String(data.transcript);
              setTranscript((p) => [...p, line]);
              onTranscript ? onTranscript(line) : null;
            }
          } else {
            // handle binary responses if your server sends them
          }
        } catch (e) {
          console.warn("Failed to parse socket message", e);
        }
      };

      socket.onerror = (ev) => {
        console.error("WebSocket error", ev);
        setError("WebSocket error");
      };

      socket.onclose = (ev) => {
        console.log("WebSocket closed", ev);
        // ensure UI reflects stopped state
        setIsRecording(false);
      };

      mediaRecorder.ondataavailable = async (event) => {
        const sock = socketRef.current;
        if (!event.data || event.data.size === 0) return;
        if (!sock || sock.readyState !== WebSocket.OPEN) return;

        // Convert Blob to ArrayBuffer for consistent binary frames
        try {
          const buffer = await event.data.arrayBuffer();
          sock.send(buffer);
        } catch (e) {
          console.error("Failed to send audio chunk", e);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop());
        } catch {}
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };
    } catch (err: any) {
      console.error("startRecording error:", err);
      if (err && err.name === "NotAllowedError") {
        setError("Microphone permission denied");
      } else {
        setError(err?.message ?? "Failed to access microphone or open socket");
      }
      // best-effort cleanup
      try {
        mediaRecorderRef.current?.state !== "inactive" &&
          mediaRecorderRef.current?.stop();
      } catch {}
      try {
        socketRef.current?.close();
      } catch {}
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    } catch (e) {
      console.warn("Error stopping media recorder", e);
    }
    try {
      socketRef.current?.close();
    } catch (e) {
      console.warn("Error closing socket", e);
    }
    setIsRecording(false);
  };

  return { startRecording, stopRecording, isRecording, transcript, error };
}
