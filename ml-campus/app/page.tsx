import Link from 'next/link';
import { mitCurriculum } from '@/lib/degree/mitCurriculum';

export default function Home() {
  const courseCount = mitCurriculum.courses.length;
  const nodeCount = mitCurriculum.courses.reduce((sum, c) => sum + c.nodes.length, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">ML Campus</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block text-xs font-medium text-indigo-400 bg-indigo-900/40 border border-indigo-800 rounded-full px-3 py-1 mb-6">
          AI-Guided · MIT Machine Learning Curriculum
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Don't take a course.
          <br />
          Navigate a degree.
        </h1>
        <p className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Bring an AI guide that learns who you are, maps your knowledge against the full
          ML degree graph, and finds your path — not a fixed syllabus, but a personalized
          route to mastery.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/onboarding"
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Start Your Degree →
          </Link>
          <Link
            href="/login"
            className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Knows You', desc: 'A diagnostic builds your knowledge state before you start.' },
          { title: 'Maps Your Path', desc: 'The agent recommends what to study next based on what you already know.' },
          { title: 'Teaches Adaptively', desc: "Explains at your level, challenges you when you're ready." },
          { title: 'Unlocks by Mastery', desc: 'Pass checkpoints to unlock downstream concepts in the graph.' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Curriculum preview */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">The Degree</h2>
          <p className="text-sm text-gray-500">{courseCount} courses · {nodeCount} concept nodes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mitCurriculum.courses.map((course, i) => (
            <div
              key={course.id}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
            >
              <span className="text-gray-600 font-mono text-sm w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate">{course.title}</p>
                <p className="text-xs text-gray-500">{course.nodes.length} nodes</p>
              </div>
              <span className="text-xs text-gray-600 font-mono shrink-0">{course.mitEquivalent}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Show the agent who you are.</h2>
        <p className="text-gray-400 mt-3">We'll find your path.</p>
        <Link
          href="/onboarding"
          className="inline-block mt-8 bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Begin →
        </Link>
      </section>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-600">
        ML Campus · AI-Guided Degree Navigator
      </footer>
    </div>
  );
}
