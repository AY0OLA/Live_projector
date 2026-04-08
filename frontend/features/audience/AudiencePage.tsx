import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type Data = {
  transcript?: string;
  translation?: string;
  verse?: string;
  verse_text?: string;
};

export default function AudiencePage() {
  const { sessionId } = useParams();

  const [transcript, setTranscript] = useState<string[]>([]);
  const [translation, setTranslation] = useState("");
  const [verse, setVerse] = useState("");
  const [verseText, setVerseText] = useState("");
  const [connected, setConnected] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const connect = () => {
      const socket = new WebSocket(
        `${import.meta.env.VITE_WS_URL}?session=${sessionId}`,
      );

      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        console.log("Connected");
      };

      socket.onclose = () => {
        setConnected(false);
        console.log("Disconnected");

    
        reconnectTimeout.current = setTimeout(connect, 2000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };

      socket.onmessage = (event) => {
        try {
          const data: Data = JSON.parse(event.data);

          if (data.transcript) {
            setTranscript((prev) => {
              const updated = [...prev, data.transcript!];
              return updated.slice(-50);
            });
          }

          if (data.translation) {
            setTranslation(data.translation);
          }

          if (data.verse) setVerse(data.verse);
          if (data.verse_text) setVerseText(data.verse_text);
        } catch (err) {
          console.error("Invalid message:", err);
        }
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [sessionId]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <h1 className="text-xl font-semibold">Live Service</h1>
      </div>

      <div className="w-full max-w-xl space-y-4">
        {verse ? (
          <div className="bg-[#1A1A1A] p-5 rounded-2xl shadow-lg border border-white/5">
            <h2 className="font-semibold text-lg tracking-wide">{verse}</h2>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              {verseText}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            Waiting for verse...
          </div>
        )}

        <div className="bg-[#1A1A1A] p-4 rounded-2xl">
          <p className="text-blue-400 text-sm">
            {translation || "Waiting for translation..."}
          </p>
        </div>

        <div
          ref={transcriptRef}
          className="bg-[#1A1A1A] p-4 rounded-2xl max-h-64 overflow-y-auto space-y-1"
        >
          {transcript.length === 0 && (
            <p className="text-gray-500 text-xs">Listening for speech...</p>
          )}

          {transcript.map((line, i) => (
            <p
              key={i}
              className={`text-xs ${
                i === transcript.length - 1 ? "text-white" : "text-gray-500"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
