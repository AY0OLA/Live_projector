export default function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-10">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded bg-purple-500 transition-all duration-300 ${
            active ? "animate-pulse h-6" : "h-2"
          }`}
          style={{
            height: active ? `${Math.random() * 30 + 10}px` : "6px",
          }}
        />
      ))}
    </div>
  );
}
