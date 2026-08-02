import React from 'react';

export default function AboutCreator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Divye Lalwani",
    "jobTitle": "Independent Builder & AI Content Specialist",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New Delhi",
      "addressCountry": "India"
    },
    "url": "https://auction-pitch.vercel.app/about",
    "sameAs": [
      "https://www.linkedin.com/in/divyelalwani"
    ],
    "description": "Creator of Auction Pitch, an AI-powered IPL auction simulator. Independent builder and e-commerce specialist based in New Delhi."
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>About Divye Lalwani — Creator of Auction Pitch</title>
      <meta name="description" content="Learn about Divye Lalwani, the independent builder and AI specialist from New Delhi who created the Auction Pitch IPL simulator." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

          <header className="text-center mb-10 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              About the Creator
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
          </header>

          <article className="prose prose-invert prose-lg max-w-none relative z-10">
            <h2 className="text-2xl font-bold text-cyan-400">Who is Divye Lalwani?</h2>
            <p className="text-slate-300 leading-relaxed">
              I am Divye Lalwani, an independent builder, AI content strategist, and e-commerce specialist based out of New Delhi, India. I am passionate about leveraging modern web technologies and artificial intelligence to build highly engaging, interactive digital experiences. 
            </p>
            <p className="text-slate-300 leading-relaxed">
              With a deep background in content and digital strategy, I specialize in identifying unique niches and building tools that people actually want to use—bridging the gap between robust engineering and intuitive user experience.
            </p>

            <h2 className="text-2xl font-bold text-cyan-400 mt-8">Why I Built Auction Pitch</h2>
            <p className="text-slate-300 leading-relaxed">
              Like millions of Indians, I am a massive cricket fan. But beyond the actual matches, I always found the IPL mega auction to be the most fascinating aspect of the sport. It is a high-stakes game of chess involving massive budgets, deep statistical analysis, and intense psychological warfare.
            </p>
            <p className="text-slate-300 leading-relaxed">
              I realized that while fantasy cricket platforms are everywhere, there was a severe lack of high-quality, real-time multiplayer simulators that captured the raw thrill of the auction room. I built <strong>Auction Pitch</strong> to solve that. By integrating a responsive React frontend, real-time Firebase syncing, and AI-powered bidding bots, I wanted to give fans the ultimate platform to test their managerial skills against their friends or the computer—completely for free.
            </p>
          </article>

          <div className="mt-12 text-center relative z-10 flex flex-col items-center">
            <p className="text-slate-400 mb-6">Want to connect, collaborate, or talk cricket?</p>
            <a 
              href="https://www.linkedin.com/in/divyelalwani" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0077b5] hover:bg-[#005582] text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:-translate-y-1 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Connect with Divye on LinkedIn
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
