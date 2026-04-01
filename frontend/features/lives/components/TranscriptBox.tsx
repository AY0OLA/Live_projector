import { useRef, useEffect } from "react";

interface TranscriptBoxProps {
  transcript: string[];
}

export default function TranscriptBox({ transcript }: TranscriptBoxProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "auto" });
  }, [transcript.length]);

  return (
    <div className="bg-card p-4 rounded-xl space-y-2 max-h-80 overflow-y-auto">
      {transcript.length === 0 ? (
        <p className="text-sm text-gray-500">
          No transcript yet. Tap "Start Listening" to begin.
        </p>
      ) : (
        transcript.map((line, i) => (
          <p key={i} className="text-sm text-gray-300">
            {line}
          </p>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
