const fs = require('fs');
let content = fs.readFileSync('src/components/MatchmakingScreen.tsx', 'utf-8');

// They said "jab koi player live nhi aara to play button kaam nhi karrah but vo every case me karega agar koi solo banda hai to vo ya to wait karega user aane ka ya fir uske no players available play solo now ka option dikhega"
// This means: Wait 10 seconds. If no players, the countdown stops, it says "No opponent found" and shows the play solo button. The play solo button was already there, but maybe it didn't work because of the way handlePlaySolo was called?
// Wait, "play button kaam nhi karrah". What play button?
// Maybe they mean on the HomeTab, if they click the big card? That works.
// On MatchmakingScreen: 
// <button onClick={() => onPlaySolo(category)} className="...">Play Solo (vs AI)</button>
// Did `onPlaySolo` work? In App.tsx:
// `onPlaySolo={(category) => { handlePlaySolo(category); }}`
// Did handlePlaySolo work? Yes, it created a solo match. But maybe they clicked "I'm Ready" on the OLD matchmaking screen?
// Wait, the OLD matchmaking screen (in HomeTab) had "I'm Ready" button. My new MatchmakingScreen doesn't have an "I'm Ready" button, it starts automatically.

// I should make sure the Play Solo button in MatchmakingScreen is very prominent and works.

// Let's modify MatchmakingScreen to have a manual "Play vs AI" button always available, not just after 10s.
content = content.replace(
  /\{status === 'waiting' && timeLeft === 0 && \(/,
  "{status === 'waiting' && ("
);
content = content.replace(
  /<p className="text-sm text-slate-400 mb-4">No opponent found in time\.<\/p>/,
  "{timeLeft === 0 ? <p className=\"text-sm text-orange-400 mb-4 font-bold\">No opponent found in time. You can keep waiting or play against AI.</p> : <p className=\"text-sm text-slate-400 mb-4\">You can play against AI immediately.</p>}"
);
fs.writeFileSync('src/components/MatchmakingScreen.tsx', content);
console.log('Matchmaking screen patched');
