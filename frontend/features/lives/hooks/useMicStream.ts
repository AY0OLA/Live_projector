import { useRef, useState, useEffect } from "react";

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

  useEffect(() => {
    // cleanup on unmount
    return () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        socketRef.current?.close();
      } catch {}
    };
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // include sessionId as query param if provided
      const base = import.meta.env.VITE_WS_URL || "";
      const url = sessionId
        ? `${base}?session=${encodeURIComponent(sessionId)}`
        : base;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        try {
          mediaRecorder.start(1000); // chunk every 1s
        } catch (e) {
          console.error("Failed to start MediaRecorder", e);
          setError("Failed to start recorder");
          socket.close();
          return;
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            try {
              socket.send(event.data);
            } catch (e) {
              console.error("Socket send error", e);
            }
          }
        };

        mediaRecorder.onerror = (ev) => {
          console.error("MediaRecorder error", ev);
          setError("Recording error");
        };
      };

      socket.onmessage = (event) => {
        try {
          const data: StreamData = JSON.parse(event.data);

          if (data.transcript) {
            setTranscript((prev) => [...prev, data.transcript as string]);
          }
          if (data.translation) {
            setTranslation(data.translation);
          }
          if (data.verse) {
            setVerse(data.verse);
          }
          if (data.verse_text) {
            setVerseText(data.verse_text);
          }
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
      };

      setIsRecording(true);
    } catch (err) {
      console.error("getUserMedia error", err);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
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
  };

  const reset = (clearTranscript = false) => {
    setError(null);
    setTranslation("");
    setVerse(null);
    setVerseText("");
    if (clearTranscript) setTranscript([]);
  };

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
