import React from 'react';

export default function HowIplMegaAuctionWorks() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "How IPL Mega Auction Works | Complete Guide & Rules",
        "description": "Learn exactly how the IPL mega auction works. Understand retention rules, purse limits, RTM cards, and bidding strategies in our comprehensive guide.",
        "url": "https://auction-pitch.vercel.app/how-ipl-mega-auction-works"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the difference between a mega auction and a mini auction?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A mega auction happens every 3-4 years where teams release most of their squad, allowing for a massive reshuffle of players. A mini auction happens annually, mostly to fill small gaps caused by player releases or injuries."
            }
          },
          {
            "@type": "Question",
            "name": "What is an RTM (Right to Match) card?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An RTM card allows a franchise to buy back their previously released player by matching the highest bid made by another team during the auction."
            }
          },
          {
            "@type": "Question",
            "name": "How much purse does each team have?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The franchise purse changes every cycle based on BCCI regulations. Recently, it has been set around INR 100-120 Crores per team, from which retention costs are deducted."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if a player remains unsold?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Unsold players can be brought back into the auction pool during the accelerated bidding rounds later in the event if a franchise expresses interest in them."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>How IPL Mega Auction Works | Complete Guide & Rules</title>
      <meta name="description" content="Learn exactly how the IPL mega auction works. Understand retention rules, purse limits, RTM cards, and bidding strategies in our comprehensive guide." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-6">
            How IPL Mega Auction Works
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            From player retentions to the final hammer drop, discover the mechanics, rules, and intense strategies that define the biggest cricketing marketplace in the world.
          </p>
          <div className="mt-8">
            <a href="https://auction-pitch.vercel.app/" className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105">
              Experience it Live (Free Simulator)
            </a>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">The Foundation of the IPL</h2>
          <p>
            The Indian Premier League (IPL) is not just won on the field; it is won in the auction room. Understanding <strong>how the IPL mega auction works</strong> is crucial for any cricket fan who wants to grasp the strategic depth of franchise cricket. Unlike football's transfer market where teams negotiate directly with each other, the IPL uses a centralized auction system that ensures parity, excitement, and dramatic bidding wars.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Retentions and the Purse</h2>
          <p>
            Before the auction even begins, the drama starts with player retentions. Every 3 to 4 years, a "Mega Auction" takes place. In a mega auction, teams are stripped down to their bare bones. They are allowed to retain a limited number of players (usually 3 to 6, depending on the specific cycle rules set by the BCCI). 
          </p>
          <p>
            Each franchise is given a total purse—a massive budget, recently around INR 100 to 120 Crores. However, retaining a player comes at a steep cost. Predetermined salary slabs are deducted from the team's purse for every retained player. If a team retains 4 top superstars, they enter the auction with a heavily depleted purse but a strong core. If they retain nobody, they have maximum cash but must build a team from scratch.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">The Bidding Process Explained</h2>
          <p>
            Players register for the auction and set their "Base Price" (ranging from INR 20 Lakhs for uncapped domestic players to INR 2 Crores for international superstars). 
          </p>
          <p>
            During the event, players are grouped into categories based on their role: Marquee players, Batters, Bowlers, All-rounders, and Wicket-keepers. The auctioneer draws a name, reads out their base price, and invites bids. Franchises raise their paddles to bid. The bids increase in predetermined increments (e.g., jumps of 20 lakhs, then 25 lakhs, then 50 lakhs).
          </p>
          <p>
            The bidding continues until no franchise is willing to raise the price further. The auctioneer calls "Going once, going twice..." and if there are no more bids, the hammer falls. The player belongs to the highest bidder.
          </p>
          
          <h3 className="text-2xl font-bold text-white mt-10 mb-4">The Right to Match (RTM) Card</h3>
          <p>
            One of the most thrilling mechanics in the mega auction is the RTM card. If a franchise did not retain a specific player, but that player goes up for auction and is "sold" to another team, the original franchise can play their RTM card. They instantly acquire the player by matching the highest bid, snatching the player away from the winning bidder at the very last second.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Put Your Knowledge to the Test</h2>
          <p>
            Reading about the rules is one thing; executing a flawless auction strategy is entirely different. You have to balance your budget, ensure you have enough domestic players (minimum squad sizes apply), and secure top overseas talent (maximum 8 per squad).
          </p>
          <p>
            If you think you have what it takes to master these rules, why not try it yourself? Head over to our <a href="/how-to-play" className="text-teal-400 hover:underline">How to Play</a> section to see how we have adapted these rules, and then jump into the <strong>Auction Pitch simulator</strong> to build your own dynasty.
          </p>
        </article>

        <section className="mt-16 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-teal-400">What is the difference between a mega auction and a mini auction?</h3>
              <p className="text-slate-300 mt-2">A mega auction happens every 3-4 years where teams release most of their squad, allowing for a massive reshuffle of players. A mini auction happens annually, mostly to fill small gaps caused by player releases or injuries.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal-400">What is an RTM (Right to Match) card?</h3>
              <p className="text-slate-300 mt-2">An RTM card allows a franchise to buy back their previously released player by matching the highest bid made by another team during the auction.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal-400">How much purse does each team have?</h3>
              <p className="text-slate-300 mt-2">The franchise purse changes every cycle based on BCCI regulations. Recently, it has been set around INR 100-120 Crores per team, from which retention costs are deducted.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal-400">What happens if a player remains unsold?</h3>
              <p className="text-slate-300 mt-2">Unsold players can be brought back into the auction pool during the accelerated bidding rounds later in the event if a franchise expresses interest in them.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
