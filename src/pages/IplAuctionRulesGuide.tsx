import React from 'react';

export default function IplAuctionRulesGuide() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "IPL Auction Game Rules & Purse Management Guide",
        "description": "Master the rules of the IPL auction game. Learn essential purse management strategies, bidding increments, and squad building constraints to win your draft.",
        "url": "https://auction-pitch.vercel.app/ipl-auction-game-rules-purse-management-guide"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the maximum number of players I can buy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Depending on the custom room settings, you generally must build a squad of 11 to 15 players. The simulation will warn you if you are running out of budget to fill the required slots."
            }
          },
          {
            "@type": "Question",
            "name": "How much money do I start with?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Each franchise typically starts with a standard purse of 10,000 to 15,000 virtual credits. All teams start with the exact same budget to ensure a level playing field."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if two people bid at the exact same time?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our real-time servers process bids in milliseconds. The first bid received is registered as the current high bid, and the second user will be prompted to bid the next incremental amount."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>IPL Auction Game Rules & Purse Management Guide</title>
      <meta name="description" content="Master the rules of the IPL auction game. Learn essential purse management strategies, bidding increments, and squad building constraints to win your draft." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">
            IPL Auction Rules & Purse Guide
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Success in the auction room isn't just about knowing the players—it's about understanding the mechanics. Master the rules and learn how to stretch every credit.
          </p>
          <div className="mt-8">
            <a href="https://auction-pitch.vercel.app/" className="inline-block bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105">
              Put the Rules into Practice
            </a>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Core Game Mechanics</h2>
          <p>
            Before you step into the high-pressure environment of a live draft, you must have a firm grasp of the <strong>IPL auction game rules</strong>. Auction Pitch is designed to simulate the real-world constraints faced by franchise owners.
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>The Starting Purse:</strong> Every manager begins with an identical virtual budget (e.g., 10,000 points). This ensures absolute fairness.</li>
            <li><strong>Bidding Increments:</strong> You cannot simply type in a custom bid. Bids increase by predetermined increments based on the current price slab, just like the real auctioneer controls the pace.</li>
            <li><strong>The Countdown Timer:</strong> Once a bid is placed, a countdown timer starts (usually 10-15 seconds). Any new bid resets the timer. If the timer hits zero, the player is sold.</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">The Art of Purse Management</h2>
          <p>
            The single most common mistake made by beginners is blowing 50% of their purse on the first two marquee players. While it is tempting to secure Virat Kohli and Jasprit Bumrah in the first five minutes, it leaves you financially crippled for the remaining 90% of the draft.
          </p>
          <p>
            Here is a practical <strong>purse management guide</strong> to keep you competitive:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>Calculate Cost Per Slot:</strong> If you need to buy 11 players with 10,000 points, your average spend per player is roughly 900 points. If you spend 3,000 on one player, your average for the remaining 10 drops significantly. Always keep this math in your head.</li>
            <li><strong>Identify Supply Scarcity:</strong> Look at the player pool before the auction starts. Are there only three top-tier Indian wicket-keepers? If so, expect a massive bidding war. Budget extra for scarce roles, and look for bargains in abundant roles (like overseas fast bowlers).</li>
            <li><strong>Force Your Opponents to Spend:</strong> If you know a rival manager desperately wants a specific player, bid the price up! Force them to overpay. But be careful—if you push too hard and they drop out, you are stuck paying the bill.</li>
          </ol>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Squad Composition Constraints</h2>
          <p>
            In Auction Pitch, you aren't just trying to collect the most expensive players. You are trying to build a functional cricket team. The post-draft algorithm heavily penalizes unbalanced squads.
          </p>
          <p>
            You must ensure you have a healthy mix of top-order batters, middle-order anchors, all-rounders, pace bowlers, and spinners. If you are unsure how the algorithm scores your final team, review the <a href="/how-to-play" className="text-yellow-400 hover:underline">How to Play</a> section on the main site.
          </p>

          <h3 className="text-2xl font-bold text-white mt-10 mb-4">Dealing with Unsold Players</h3>
          <p>
            If a player's base price is called and no one bids before the timer expires, that player goes unsold. Don't panic if you missed someone. Depending on room settings, unsold players may be brought back in a rapid-fire accelerated round at the end of the auction, often allowing smart managers to grab massive bargains.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Enter the Room with Confidence</h2>
          <p>
            Now that you understand the rules and have a solid strategy for managing your purse, you are no longer a rookie. You are ready to sit at the big table. Create a room, invite your friends, and show them how a real franchise is built.
          </p>
          <p className="mt-6 text-center">
            <a href="https://auction-pitch.vercel.app/" className="text-yellow-400 font-bold hover:underline text-xl">
              Start Your First Auction Now
            </a>
          </p>
        </article>

        <section className="mt-16 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-yellow-400">What is the maximum number of players I can buy?</h3>
              <p className="text-slate-300 mt-2">Depending on the custom room settings, you generally must build a squad of 11 to 15 players. The simulation will warn you if you are running out of budget to fill the required slots.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-400">How much money do I start with?</h3>
              <p className="text-slate-300 mt-2">Each franchise typically starts with a standard purse of 10,000 to 15,000 virtual credits. All teams start with the exact same budget to ensure a level playing field.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-400">What happens if two people bid at the exact same time?</h3>
              <p className="text-slate-300 mt-2">Our real-time servers process bids in milliseconds. The first bid received is registered as the current high bid, and the second user will be prompted to bid the next incremental amount.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
