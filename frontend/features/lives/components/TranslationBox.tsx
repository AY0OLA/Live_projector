type Props = {
  text: string;
};

export default function TranslationBox({ text }: Props) {
  return (
    <div className="bg-card p-4 rounded-xl border border-blue-500">
      <h3 className="text-sm text-blue-400 mb-2">🌍 Translation</h3>
      <p className="text-sm text-gray-300">
        {text || "Translation will appear here..."}
      </p>
    </div>
  );
}
