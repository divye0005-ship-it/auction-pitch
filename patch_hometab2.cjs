const fs = require('fs');
let content = fs.readFileSync('src/components/HomeTab.tsx', 'utf-8');

const replacement = `
        {/* Create Custom Room Card */}
        <div 
          onClick={() => setCurrentView('rooms')}
          className="bento-item bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 hover:border-emerald-500/60 cursor-pointer transition-all group relative overflow-hidden mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1 drop-shadow-md">Custom Rooms</h3>
              <p className="text-xs text-green-200 font-bold">Play with friends privately.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-black transition-all">
              <Play className="w-4 h-4 fill-current text-white group-hover:text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
`;
content = content.replace(/\{\/\* Real Estate Card \(Disabled\) \*\/\}[\s\S]*?<\/div>\n      <\/div>\n    <\/div>/, replacement);

fs.writeFileSync('src/components/HomeTab.tsx', content);
console.log('Custom rooms button added back to HomeTab');
