import React from 'react';

export default function IplAuctionGameFriends() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "IPL Auction Game for Friends | Multiplayer Cricket Draft",
        "description": "Host a private IPL auction game with your friends online. Bid on players, manage your budget, and see who builds the best T20 cricket squad in real-time.",
        "url": "https://auction-pitch.vercel.app/ipl-auction-game-for-friends"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I invite friends to my IPL auction room?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Simply create a private room in Auction Pitch. You will receive a unique 6-character room code. Share this code via WhatsApp or SMS, and your friends can join instantly."
            }
          },
          {
            "@type": "Question",
            "name": "How many friends can play together?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can host an auction for up to 10 friends in a single room, replicating the 10 franchises of the real IPL."
            }
          },
          {
            "@type": "Question",
            "name": "Can we mix human players and AI bots?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! If you only have 3 or 4 friends available, you can choose to include AI bots in your room to fill out the remaining franchise slots."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a time limit for bidding?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, every bid resets a countdown timer (usually 10-15 seconds). If no one raises the bid before the timer hits zero, the player is sold to the highest bidder."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <title>IPL Auction Game for Friends | Multiplayer Cricket Draft</title>
      <meta name="description" content="Host a private IPL auction game with your friends online. Bid on players, manage your budget, and see who builds the best T20 cricket squad in real-time." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
            IPL Auction Game for Friends
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Settle the ultimate debate: who among your friend group is the best cricket manager? Host a live, real-time multiplayer IPL mock auction online.
          </p>
          <div className="mt-8">
            <a href="https://auction-pitch.vercel.app/" className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105">
              Create a Private Room Now
            </a>
          </div>
        </header>

        <article className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">The Ultimate Multiplayer Cricket Experience</h2>
          <p>
            Watching cricket with friends is great, but actively competing against them to build a championship-winning squad is even better. The <strong>IPL auction game for friends</strong> on Auction Pitch transforms passive fandom into an intensely competitive, interactive multiplayer experience.
          </p>
          <p>
            No more arguing in WhatsApp groups about which team had the best auction strategy. You can now put your money (virtual, of course) where your mouth is. Create a room, invite your buddies, and experience the adrenaline rush of a live bidding war for Virat Kohli, MS Dhoni, or Jasprit Bumrah.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">How to Host Your Own Mock Auction</h2>
          <p>
            Getting started is incredibly simple and requires no downloads or complex setups. Here is how you can host the perfect draft night:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mt-4 text-slate-300">
            <li><strong>Create a Room:</strong> Head over to the Auction Pitch homepage and click on 'Create Room'. You can customize the settings, such as the total number of franchises (up to 10) and the bidding timer length.</li>
            <li><strong>Share the Code:</strong> Once created, you will get a unique 6-character room code. Send this code to your friends.</li>
            <li><strong>Join the Lobby:</strong> Your friends simply go to the site, click 'Join Room', and enter the code. You will see them appear in your lobby in real-time.</li>
            <li><strong>Start the Bidding:</strong> Once everyone is ready, the host clicks start. Players appear on screen one by one, and the paddle-raising frenzy begins!</li>
          </ol>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Strategy: Playing the Player vs. Playing the Board</h2>
          <p>
            When you play an <strong>IPL bidding game</strong> against AI, you are mostly calculating stats and value. But when you play against your real friends, psychological warfare comes into play. 
          </p>
          <p>
            Does your friend Rahul absolutely adore Rohit Sharma? Drive the price up! Bid aggressively to force him to empty his purse early on his favorite player. By the time the solid middle-order batters and reliable death bowlers come up for auction, he won't have the budget to compete with you. Just be careful not to get stuck paying a massive premium if he decides to fold and back out of the bidding war!
          </p>
          <p>
            Check out our <a href="/how-to-play" className="text-purple-400 hover:underline">How to Play</a> guide for more tips on managing your purse and outsmarting human opponents.
          </p>

          <h3 className="text-2xl font-bold text-white mt-10 mb-4">Adding AI Bots to the Mix</h3>
          <p>
            What if you only have a group of 4 friends, but you want the full 10-team auction experience? Auction Pitch allows you to seamlessly blend human players with our advanced AI bots. The bots will fill the empty franchise slots and bid intelligently based on team needs, ensuring the market prices remain realistic and challenging.
          </p>

          <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-slate-700 pb-2">Claim the Bragging Rights</h2>
          <p>
            At the end of the auction, the platform will automatically evaluate all squads and generate a leaderboard. It calculates team strength based on player ratings, balance, and auction value. Only one friend can walk away with the title of the ultimate cricket strategist.
          </p>
          <p className="mt-6 text-center">
            <a href="https://auction-pitch.vercel.app/" className="text-purple-400 font-bold hover:underline text-xl">
              Gather Your Squad and Start Bidding
            </a>
          </p>
        </article>

        <section className="mt-16 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-purple-400">How do I invite friends to my IPL auction room?</h3>
              <p className="text-slate-300 mt-2">Simply create a private room in Auction Pitch. You will receive a unique 6-character room code. Share this code via WhatsApp or SMS, and your friends can join instantly.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400">How many friends can play together?</h3>
              <p className="text-slate-300 mt-2">You can host an auction for up to 10 friends in a single room, replicating the 10 franchises of the real IPL.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400">Can we mix human players and AI bots?</h3>
              <p className="text-slate-300 mt-2">Yes! If you only have 3 or 4 friends available, you can choose to include AI bots in your room to fill out the remaining franchise slots.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400">Is there a time limit for bidding?</h3>
              <p className="text-slate-300 mt-2">Yes, every bid resets a countdown timer (usually 10-15 seconds). If no one raises the bid before the timer hits zero, the player is sold to the highest bidder.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
