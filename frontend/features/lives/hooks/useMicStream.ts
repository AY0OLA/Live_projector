import { useRef, useState, useEffect, useCallback } from "react";

type StreamData = {
  transcript?: string;
  translation?: string;
  verse?: string;
  verse_text?: string;
};

export default function useMicStream(sessionId?: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [verse, setVerse] = useState<string | null>(null);
  const [verseText, setVerseText] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to send audio safely
  const sendAudioChunk = useCallback((chunk: Blob) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    // send as ArrayBuffer for smaller overhead if supported
    if (chunk instanceof Blob && typeof chunk.arrayBuffer === "function") {
      chunk.arrayBuffer().then((buf) => {
        try {
          socket.send(buf);
        } catch (e) {
          console.error("Socket send failed", e);
        }
      });
    } else {
      try {
        socket.send(chunk);
      } catch (e) {
        console.error("Socket send failed", e);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn("stop recorder on unmount", e);
      }
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        socketRef.current?.close();
      } catch {}
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    setError(null);

    // Feature detection
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Browser does not support getUserMedia");
      return;
    }
    if (typeof WebSocket === "undefined") {
      setError("WebSocket not available in this environment");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // create recorder but don't start until socket open
      const options: MediaRecorderOptions = {};
      // prefer codecs if available (optional)
      // if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) options.mimeType = "audio/webm;codecs=opus";
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const base = import.meta.env.VITE_WS_URL || "";
      const url = sessionId
        ? `${base}?session=${encodeURIComponent(sessionId)}`
        : base;
      const socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        setError(null);
        try {
          // start producing chunks every 1000ms
          mediaRecorder.start(1000);
        } catch (e) {
          console.error("Failed to start MediaRecorder", e);
          setError("Failed to start recorder");
          socket.close();
          return;
        }
      };

      mediaRecorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) {
          sendAudioChunk(ev.data);
        }
      };

      mediaRecorder.onerror = (ev) => {
        console.error("MediaRecorder error", ev);
        setError("Recording error");
      };

      socket.onmessage = (event) => {
        try {
          const payload =
            typeof event.data === "string" ? JSON.parse(event.data) : null;
          if (!payload) return;
          const data = payload as StreamData;
          if (data.transcript)
            setTranscript((p) => [...p, data.transcript as string]);
          if (data.translation) setTranslation(data.translation);
          if (data.verse) setVerse(data.verse);
          if (data.verse_text) setVerseText(data.verse_text);
        } catch (e) {
          console.error("Failed to parse socket message", e);
        }
      };

      socket.onerror = (ev) => {
        console.error("WebSocket error", ev);
        setError("Connection error");
      };

      socket.onclose = () => {
        setConnected(false);
        // stop recorder if still running
        try {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }
        } catch {}
      };

      setIsRecording(true);
    } catch (err: any) {
      console.error("getUserMedia error", err);
      setError(err?.message || "Microphone access denied");
    }
  }, [isRecording, sendAudioChunk, sessionId]);

  const stopRecording = useCallback(() => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.warn("Error stopping MediaRecorder", e);
    }

    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    } catch (e) {
      console.warn("Error stopping tracks", e);
    }

    try {
      socketRef.current?.close();
    } catch (e) {
      console.warn("Error closing socket", e);
    } finally {
      socketRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
    setConnected(false);
  }, []);

  const reset = useCallback((clearTranscript = false) => {
    setError(null);
    setTranslation("");
    setVerse(null);
    setVerseText("");
    if (clearTranscript) setTranscript([]);
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    transcript,
    verse,
    verseText,
    translation,
    error,
    connected,
    reset,
  };
}
