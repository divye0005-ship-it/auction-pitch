import React from 'react';

export default function FreeOnlineCricketAuction() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Free Online Cricket Auction Game | No Sign-up Required",
        "description": "Play the best free online cricket auction game directly in your browser. Build your T20 team, bid against AI or friends, and enjoy endless cricket management fun.",
        "url": "https://auction-pitch.vercel.app/free-online-cricket-auction-game"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Do I need to download an app to play?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No downloads are required! Auction Pitch is a web-based game that runs smoothly directly in your mobile or desktop browser."
            }
          },
          {
            "@type": "Question",
            "name": "Are there any hidden costs or in-app purchases?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely not. Our online cricket auction game is 100% free to play. You have full access to all players and multiplayer rooms without spending a dime."
            }
          },
          {
            "@type": "Question",
            "name": "Can I play against the computer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our Solo Mode matches you against intelligent AI bots, so you can practice your bidding skills anytime, even if your friends are offline."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>Free Online Cricket Auction Game | Play Instantly in Browser</title>
      <meta name="description" content="Play the best free online cricket auction game directly in your browser. Build your T20 team, bid against AI or friends, and enjoy endless cricket management fun." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
            Free Online Cricket Auction Game
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            No downloads. No hidden fees. Just pure, unadulterated cricket management strategy right in your web browser. Start bidding in seconds.
          </p>
          <div className="mt-8">
            <a href="https://auction-pitch.vercel.app/" className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105">
              Play For Free Now
            </a>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Accessible Cricket Strategy for Everyone</h2>
          <p>
            Finding a high-quality sports management simulation usually means paying for a premium app or dealing with heavy downloads and intrusive advertisements. We believe the thrill of team building should be accessible to every fan, which is why Auction Pitch is a completely <strong>free online cricket auction game</strong>.
          </p>
          <p>
            Whether you are on a lunch break using your smartphone, or relaxing at home on your laptop, you can jump straight into the action. The game is highly optimized to run flawlessly in any modern web browser.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">What Makes This The Best Free Auction Game?</h2>
          <p>
            Despite being free, we have packed this platform with features that rival paid simulators:
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>Zero Pay-to-Win Mechanics:</strong> Your success depends entirely on your strategy, budget management, and cricket knowledge. You cannot buy "extra purse" or "skip tokens" with real money. It is a level playing field.</li>
            <li><strong>Real-Time Multiplayer:</strong> Connect with friends across the globe in private, secure auction rooms with zero lag.</li>
            <li><strong>AI Solo Mode:</strong> Want to play at 3 AM? Our AI bots are always ready for a fierce bidding war.</li>
            <li><strong>Clean, Neon Interface:</strong> We designed the UI to be visually stunning, using a dark theme with vibrant neon accents that keep you focused on the numbers.</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">How to Get Started in 30 Seconds</h2>
          <p>
            We have stripped away all the friction. You do not need to fill out long registration forms or verify emails to start playing against the AI. 
          </p>
          <p>
            Simply visit the homepage, choose whether you want to play a Solo game or host a Multiplayer room, and you are immediately taken to the auction dashboard. If you need a quick primer on how the bidding buttons and purse management work, our <a href="/how-to-play" className="text-green-400 hover:underline">How to Play</a> section will get you up to speed in two minutes.
          </p>

          <h3 className="text-2xl font-bold text-white mt-10 mb-4">Educational and Fun</h3>
          <p>
            Beyond being highly entertaining, this <strong>cricket bidding game</strong> is surprisingly educational. It teaches basic economic principles like supply and demand, budget allocation, and value assessment. It is a fantastic tool for young fans to understand the business side of franchise cricket.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Join the Community</h2>
          <p>
            Thousands of cricket fans have already made Auction Pitch their go-to destination for mock drafts. With major updates planned for future tournament cycles, the platform is continually evolving. And yes, it will always remain free to play.
          </p>
          <p className="mt-6 text-center">
            <a href="https://auction-pitch.vercel.app/" className="text-green-400 font-bold hover:underline text-xl">
              Start Your Free Auction Experience
            </a>
          </p>
        </article>

        <section className="mt-16 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-green-400">Do I need to download an app to play?</h3>
              <p className="text-slate-300 mt-2">No downloads are required! Auction Pitch is a web-based game that runs smoothly directly in your mobile or desktop browser.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400">Are there any hidden costs or in-app purchases?</h3>
              <p className="text-slate-300 mt-2">Absolutely not. Our online cricket auction game is 100% free to play. You have full access to all players and multiplayer rooms without spending a dime.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400">Can I play against the computer?</h3>
              <p className="text-slate-300 mt-2">Yes, our Solo Mode matches you against intelligent AI bots, so you can practice your bidding skills anytime, even if your friends are offline.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
