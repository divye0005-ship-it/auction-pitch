import React from 'react';

export default function IplAuctionSimulator() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "IPL Auction Simulator | Free Online Cricket Auction Game",
        "description": "Experience the thrill of the IPL mega auction with Auction Pitch, the ultimate free AI-powered IPL auction simulator. Build your dream team today!",
        "url": "https://auction-pitch.vercel.app/ipl-auction-simulator"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is an IPL auction simulator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An IPL auction simulator is an online game that replicates the real-life Indian Premier League player auction. You are given a virtual purse and must bid against other users or AI to build your squad within a set budget."
            }
          },
          {
            "@type": "Question",
            "name": "Is this IPL auction game free to play?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Auction Pitch is completely free to play. You can start an auction, bid on players, and build your ultimate cricket team without any hidden charges."
            }
          },
          {
            "@type": "Question",
            "name": "Can I play with my friends?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. You can create a private room and share the room code with your friends to host a multiplayer IPL mock auction."
            }
          },
          {
            "@type": "Question",
            "name": "How does the AI bidding work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our intelligent AI bots analyze player stats, roles, and remaining team purse to place realistic bids, giving you a challenging and authentic auction experience."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>IPL Auction Simulator | Free Online Cricket Auction Game</title>
      <meta name="description" content="Experience the thrill of the IPL mega auction with Auction Pitch, the ultimate free AI-powered IPL auction simulator. Build your dream team today!" />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
            IPL Auction Simulator
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Step into the shoes of a franchise owner with the most realistic, AI-powered online cricket auction game. Build your dream T20 squad, manage your purse, and outsmart the competition.
          </p>
          <div className="mt-8">
            <a href="https://auction-pitch.vercel.app/" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all transform hover:scale-105">
              Start Auction Free
            </a>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Experience the Ultimate Cricket Manager Game</h2>
          <p>
            Have you ever watched the IPL mega auction on television and thought, "I could build a better team"? 
            Now is your chance to prove it. The <strong>IPL auction simulator</strong> by Auction Pitch brings the high-stakes drama of the real auction room straight to your screen. Whether you are a die-hard cricket fan, a fantasy sports enthusiast, or just someone who loves strategy games, this platform offers the perfect blend of cricket knowledge and financial planning.
          </p>
          <p>
            Unlike static fantasy leagues where you simply pick players based on a fixed credit system, an auction requires dynamic decision-making. You must value players, anticipate what your opponents will do, and know exactly when to walk away from a bidding war.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Why Play an IPL Mock Auction?</h2>
          <p>
            An <strong>IPL mock auction</strong> is not just a game; it is the ultimate test of your cricket acumen. Here is why thousands of fans are jumping into our simulator:
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>Realistic Dynamics:</strong> Players are presented randomly, and you must make split-second decisions. Do you spend big on a marquee fast bowler early on, or save your purse for a solid middle-order batsman later?</li>
            <li><strong>AI-Powered Bots:</strong> Don't have friends online right now? No problem. Our advanced AI bots act as rival franchise owners. They analyze player stats, roles, and their own remaining purse to bid strategically against you.</li>
            <li><strong>Multiplayer Thrills:</strong> Host a private room and invite your friends. There is nothing quite like outbidding your best friend for their favorite superstar player.</li>
            <li><strong>Purse Management:</strong> You start with a massive budget, but it drains faster than you think. Learn the art of building a balanced squad—batters, bowlers, all-rounders, and a wicketkeeper—without going bankrupt.</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">How to Build Your Dream T20 Team</h2>
          <p>
            Success in this <strong>cricket manager game</strong> requires a solid strategy. Before you jump in, make sure you understand the rules. You can check out our detailed <a href="/how-to-play" className="text-cyan-400 hover:underline">How to Play</a> guide for a complete breakdown of the mechanics.
          </p>
          <p>
            A good rule of thumb is to identify your core players early. Decide which two or three premium players you want to anchor your franchise, and allocate your funds accordingly. However, be prepared to pivot. If a bidding war pushes a player's price beyond their actual value, let them go. There is always another talented player waiting in the wings.
          </p>

          <h3 className="text-2xl font-bold text-white mt-10 mb-4">Features of Auction Pitch</h3>
          <p>
            Our simulator is packed with features designed to give you the most authentic experience possible:
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>Live Timer:</strong> Just like the real auctioneer, the hammer falls when time runs out. You must act fast.</li>
            <li><strong>Comprehensive Player Database:</strong> Featuring top international stars and exciting uncapped talents.</li>
            <li><strong>Real-time Leaderboard:</strong> Track who has the strongest squad on paper based on overall player ratings and auction performance.</li>
            <li><strong>Seamless UI:</strong> A dark-mode optimized, neon-accented interface that keeps you immersed in the action.</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Ready to Raise Your Paddle?</h2>
          <p>
            The stage is set, the players are waiting, and the auctioneer is ready. It is time to step up and show the world your team-building skills. Whether you are practicing for your fantasy league draft or just looking for a fun way to engage with the sport you love, Auction Pitch is your go-to destination.
          </p>
          <p className="mt-6 text-center">
            <a href="https://auction-pitch.vercel.app/" className="text-cyan-400 font-bold hover:underline text-xl">
              Launch the IPL Auction Simulator Now
            </a>
          </p>
        </article>

        <section className="mt-16 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-cyan-400">What is an IPL auction simulator?</h3>
              <p className="text-slate-300 mt-2">An IPL auction simulator is an online game that replicates the real-life Indian Premier League player auction. You are given a virtual purse and must bid against other users or AI to build your squad within a set budget.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">Is this IPL auction game free to play?</h3>
              <p className="text-slate-300 mt-2">Yes! Auction Pitch is completely free to play. You can start an auction, bid on players, and build your ultimate cricket team without any hidden charges.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">Can I play with my friends?</h3>
              <p className="text-slate-300 mt-2">Absolutely. You can create a private room and share the room code with your friends to host a multiplayer IPL mock auction.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">How does the AI bidding work?</h3>
              <p className="text-slate-300 mt-2">Our intelligent AI bots analyze player stats, roles, and remaining team purse to place realistic bids, giving you a challenging and authentic auction experience.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
