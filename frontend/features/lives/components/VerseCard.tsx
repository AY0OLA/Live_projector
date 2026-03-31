type Props = {
  reference: string;
};

export default function VerseCard({ reference }: Props) {
  return (
    <div className="bg-card p-5 rounded-2xl shadow-lg border border-purple-500">
      <h2 className="text-lg font-semibold">{reference}</h2>
      <p className="text-sm text-gray-300 mt-2">
        Verse text will come from API...
      </p>
    </div>
  );
}
