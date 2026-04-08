export default function DesktopOnly() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white text-center p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Desktop Required 💻</h1>
        <p className="text-gray-300">
          This app is designed for desktop use only. Please open it on a laptop
          or computer.
        </p>
      </div>
    </div>
  );
}
