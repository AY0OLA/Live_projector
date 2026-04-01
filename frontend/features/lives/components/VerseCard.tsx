type Props = {
  reference: string;
  text: string;
  onSave?: () => void;
};

export default function VerseCard({ reference, text, onSave }: Props) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-purple-500 shadow-lg">
      <h2 className="text-lg font-semibold">{reference}</h2>

      <p className="text-gray-300 mt-3 whitespace-pre-line">{text}</p>

      <div className="flex gap-4 mt-4 text-sm">
        <button onClick={onSave} className="hover:text-purple-400">
          ❤️ Save
        </button>
        <button className="hover:text-purple-400">🔗 Share</button>
      </div>
    </div>
  );
}
