import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../src/lib/firebase";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-800">
      <h1 className="font-bold">SermonLive</h1>

      <div className="flex gap-4 text-sm">
        <Link to="/">Live</Link>
        <a href="/landing">Home</a>
        <Link to="/saved">Saved</Link>
        <Link to="/settings">Settings</Link>
        <a href="/presentation" target="_blank">
          Presentation
        </a>
        <a href="/audience" target="_blank">
          Audience
        </a>
        <Link to="/history">History</Link>
        <Link to="/analytics">Analytics</Link>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>
    </div>
  );
}
