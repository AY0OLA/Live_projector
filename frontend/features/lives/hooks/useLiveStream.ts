import { useEffect, useRef, useState } from "react";

type StreamData = {
  transcript: string;
  verse?: string | null;
  translation?: string | null;
};

type UseLiveStreamReturn = {
  transcript: string[];
  verse: string | null;
  translation: string;
  connected: boolean;
  error: string | null;
};

export default function useLiveStream(
  url = "ws://127.0.0.1:8000/ws/audio",
  autoReconnect = true,
  maxReconnectAttempts = 5,
): UseLiveStreamReturn {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [verse, setVerse] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = () => {
      setError(null);
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        if (!mounted) return;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        if (!mounted) return;
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          // Defensive checks
          if (data && typeof data.transcript === "string") {
            setTranscript((prev) => [...prev, data.transcript]);
          }
          if (data && (data.verse ?? null) !== undefined) {
            setVerse(data.verse ?? null);
          }
          if (data && (data.translation ?? null) !== undefined) {
            setTranslation(data.translation ?? "");
          }
        } catch (e) {
          console.warn("Failed to parse WS message", e);
        }
      };

      ws.onerror = (ev) => {
        console.error("WebSocket error", ev);
        if (!mounted) return;
        setError("WebSocket error");
      };

      ws.onclose = (ev) => {
        if (!mounted) return;
        setConnected(false);
        // attempt reconnect with exponential backoff
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          const attempt = ++reconnectAttemptsRef.current;
          const delay = Math.min(30000, 500 * 2 ** (attempt - 1)); // 500ms, 1s, 2s, 4s...
          reconnectTimerRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Max reconnect attempts reached");
        }
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      try {
        socketRef.current?.close();
      } catch {}
      socketRef.current = null;
    };
    // Intentionally empty deps: connect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoReconnect, maxReconnectAttempts]);

  return { transcript, verse, translation, connected, error };
}
