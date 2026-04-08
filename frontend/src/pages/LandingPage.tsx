export default function LandingPage() {
  return (
    <div className="bg-black text-white">
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold">
          Real-Time Bible Verses <br /> During Sermons
        </h1>

        <p className="text-gray-400 mt-4 max-w-xl">
          Instantly display scripture, translate messages, and engage your
          congregation live.
        </p>

        <div className="flex gap-4 mt-6">
          <a href="/login" className="bg-accent px-6 py-3 rounded-full">
            Try Live Demo
          </a>

          <a href="/presentation" className="border px-6 py-3 rounded-full">
            View Presentation
          </a>
        </div>
      </section>

      <section className="p-10 grid md:grid-cols-3 gap-6">
        <Feature
          title="📖 Auto Verse Detection"
          desc="Detects Bible verses instantly from speech."
        />
        <Feature
          title="🌍 Live Translation"
          desc="Translate sermons in real-time."
        />
        <Feature
          title="📡 Audience Mode"
          desc="Members follow on their phones."
        />
      </section>

      <section className="p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">How It Works</h2>

        <p className="text-gray-400">
          Start the app, speak normally, and let the system display verses and
          translations instantly.
        </p>
      </section>

      <section className="p-10 text-center">
        <h2 className="text-2xl font-bold">
          Ready to Transform Your Services?
        </h2>

        <a
          href="/login"
          className="mt-4 inline-block bg-purple-600 px-6 py-3 rounded-full"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}

function Feature({ title, desc }: any) {
  return (
    <div className="bg-card p-6 rounded-xl">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-2">{desc}</p>
    </div>
  );
}
