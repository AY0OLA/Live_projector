import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type Data = {
  verse?: string;
  verse_text?: string;
  translation?: string;
};

export default function ProjectorPage() {
  const { sessionId } = useParams();

  const [verse, setVerse] = useState("");
  const [verseText, setVerseText] = useState("");
  const [translation, setTranslation] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?session=${sessionId}`,
    );

    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (event) => {
      try {
        const data: Data = JSON.parse(event.data);

        if (data.verse) setVerse(data.verse);
        if (data.verse_text) setVerseText(data.verse_text);
        if (data.translation) setTranslation(data.translation);
      } catch (err) {
        console.error("Invalid message", err);
      }
    };

    return () => socket.close();
  }, [sessionId]);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-center items-center px-10 text-center">
      {/* Connection indicator */}
      <div className="absolute top-4 right-6">
        <span
          className={`h-3 w-3 rounded-full inline-block ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      {/* Verse Reference */}
      {verse && (
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-wide">
          {verse}
        </h1>
      )}

      {/* Verse Text */}
      <p className="text-2xl md:text-4xl leading-relaxed max-w-5xl">
        {verseText || "Waiting for verse..."}
      </p>

      {/* Translation */}
      {translation && (
        <p className="mt-10 text-xl md:text-2xl text-blue-400 max-w-4xl">
          {translation}
        </p>
      )}
    </div>
  );
}
