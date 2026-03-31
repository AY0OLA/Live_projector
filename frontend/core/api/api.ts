export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/v1${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
