import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";

type Props = {
  url: string;
  size?: number;
  className?: string;
  showCopy?: boolean;
};

export default function QRCodeDisplay({
  url,
  size = 180,
  className = "",
  showCopy = true,
}: Props): ReactElement {
  const [copied, setCopied] = useState(false);

  const isValidUrl = useMemo(() => {
    if (!url) return false;
    try {
      // allow relative URLs by providing base when available
      // eslint-disable-next-line no-new
      new URL(
        url,
        typeof window !== "undefined" ? window.location.href : undefined,
      );
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const handleCopy = async () => {
    if (!isValidUrl) return;
    try {
      if (!navigator.clipboard) {
        setCopied(false);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!isValidUrl) {
    return (
      <div
        className={`bg-white p-4 rounded-xl inline-block text-sm text-red-600 ${className}`}
        role="status"
        aria-live="polite"
      >
        <strong>Invalid or missing URL</strong>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-xl inline-block ${className}`}>
      <div aria-hidden="true" style={{ width: size, height: size }}>
        <QRCode value={url} size={size} />
      </div>

      <span className="sr-only" aria-live="polite">
        QR code for {url}
      </span>

      {showCopy && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            aria-label="Copy link to clipboard"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
            aria-label="Open link in new tab"
          >
            Open link
          </a>
        </div>
      )}
    </div>
  );
}
