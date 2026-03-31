import { useEffect, useRef, useState } from "react";

type TranscriptSetter = React.Dispatch<React.SetStateAction<string[]>>;

type UseMicStreamReturn = {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isRecording: boolean;
  error: string | null;
};

export default function useMicStream(
  setTranscript: TranscriptSetter,
): UseMicStreamReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // safe cleanup on unmount
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
      mediaRecorderRef.current = null;
      socketRef.current = null;
      streamRef.current = null;
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Optional: detect a supported mimeType for MediaRecorder
      // const mimeType = detectSupportedMimeType(); // implement if needed
      // const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const options: MediaRecorderOptions = {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");
      socketRef.current = socket;

      // If server expects ArrayBuffer frames, uncomment:
      // socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        try {
          mediaRecorder.start(1000); // timeslice 1s
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
              setTranscript((prev) => [...prev, String(data.transcript)]);
            }
          } else {
            // handle binary messages if server sends them
          }
        } catch (e) {
          console.warn("Failed to parse socket message", e);
        }
      };

      socket.onerror = (ev) => {
        console.error("WebSocket error", ev);
        setError("WebSocket error");
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
        // keep isRecording state in sync if needed:
        setIsRecording(false);
      };

      mediaRecorder.ondataavailable = async (event) => {
        const sock = socketRef.current;
        if (!event.data || event.data.size === 0) return;
        if (!sock || sock.readyState !== WebSocket.OPEN) return;

        // Try sending Blob directly (server must accept it)
        try {
          sock.send(event.data);
          return;
        } catch (e) {
          console.warn("Failed to send blob directly, will try ArrayBuffer", e);
        }

        // Fallback: convert Blob to ArrayBuffer and send
        try {
          const arrayBuffer = await event.data.arrayBuffer();
          sock.send(arrayBuffer);
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
        setIsRecording(false);
      };
    } catch (err: any) {
      console.error("startRecording error:", err);
      setError(err?.message ?? "Failed to access microphone or open socket");
      // best-effort cleanup
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
      mediaRecorderRef.current = null;
      socketRef.current = null;
      streamRef.current = null;
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

  return { startRecording, stopRecording, isRecording, error };
}
