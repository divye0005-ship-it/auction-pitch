import { Player } from '../types';

const generatePlayers = (): Player[] => {
  const basePlayers: Player[] = [
    // RCB
    {
      playerId: 'virat-kohli',
      name: 'Virat Kohli',
      team: 'Royal Challengers Bengaluru',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Virat%20Kohli.png',
      country: 'India',
      stats: { runs: 8000, avg: 38.7, sr: 131.9, centuries: 8, fifties: 55 },
      auctionScore: 980,
      basePrice: 200
    },
    {
      playerId: 'mohammed-siraj',
      name: 'Mohammed Siraj',
      team: 'Royal Challengers Bengaluru',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Mohammed%20Siraj.png',
      country: 'India',
      stats: { wickets: 95, economy: 8.6, bowlAvg: 29.5 },
      auctionScore: 880,
      basePrice: 200
    },
    {
      playerId: 'faf-du-plessis',
      name: 'Faf du Plessis',
      team: 'Royal Challengers Bengaluru',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Faf%20du%20Plessis.png',
      country: 'South Africa',
      stats: { runs: 4500, avg: 36.5, sr: 134.2, fifties: 35 },
      auctionScore: 920,
      basePrice: 200
    },
    {
      playerId: 'glenn-maxwell',
      name: 'Glenn Maxwell',
      team: 'Royal Challengers Bengaluru',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Glenn%20Maxwell.png',
      country: 'Australia',
      stats: { runs: 2800, sr: 157.6, wickets: 35, economy: 8.3 },
      auctionScore: 910,
      basePrice: 200
    },
    {
      playerId: 'rajat-patidar',
      name: 'Rajat Patidar',
      team: 'Royal Challengers Bengaluru',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Rajat%20Patidar.png',
      country: 'India',
      stats: { runs: 1200, avg: 34.2, sr: 145.5, fifties: 7 },
      auctionScore: 870,
      basePrice: 100
    },
    // CSK
    {
      playerId: 'ms-dhoni',
      name: 'MS Dhoni',
      team: 'Chennai Super Kings',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/MS%20Dhoni.png',
      country: 'India',
      stats: { runs: 5200, avg: 39.1, sr: 137.5, centuries: 0, fifties: 24 },
      auctionScore: 950,
      basePrice: 200
    },
    {
      playerId: 'ravindra-jadeja',
      name: 'Ravindra Jadeja',
      team: 'Chennai Super Kings',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Ravindra%20Jadeja.png',
      country: 'India',
      stats: { runs: 2800, wickets: 160, economy: 7.6 },
      auctionScore: 975,
      basePrice: 200
    },
    {
      playerId: 'ruturaj-gaikwad',
      name: 'Ruturaj Gaikwad',
      team: 'Chennai Super Kings',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Ruturaj%20Gaikwad.png',
      country: 'India',
      stats: { runs: 2500, avg: 39.5, sr: 135.2, centuries: 1, fifties: 18 },
      auctionScore: 940,
      basePrice: 200
    },
    {
      playerId: 'shivam-dube',
      name: 'Shivam Dube',
      team: 'Chennai Super Kings',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Shivam%20Dube.png',
      country: 'India',
      stats: { runs: 1500, sr: 158.2, avg: 32.5 },
      auctionScore: 900,
      basePrice: 100
    },
    {
      playerId: 'matheesha-pathirana',
      name: 'Matheesha Pathirana',
      team: 'Chennai Super Kings',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Matheesha%20Pathirana.png',
      country: 'Sri Lanka',
      stats: { wickets: 45, economy: 7.8, bowlAvg: 21.2 },
      auctionScore: 930,
      basePrice: 200
    },
    // MI
    {
      playerId: 'rohit-sharma',
      name: 'Rohit Sharma',
      team: 'Mumbai Indians',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Rohit%20Sharma.png',
      country: 'India',
      stats: { runs: 6600, avg: 29.7, sr: 131.1, centuries: 2, fifties: 43 },
      auctionScore: 940,
      basePrice: 200
    },
    {
      playerId: 'jasprit-bumrah',
      name: 'Jasprit Bumrah',
      team: 'Mumbai Indians',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Jasprit%20Bumrah.png',
      country: 'India',
      stats: { wickets: 165, economy: 7.3, bowlAvg: 22.5, sr: 18.5, hauls: 1 },
      auctionScore: 990,
      basePrice: 200
    },
    {
      playerId: 'hardik-pandya',
      name: 'Hardik Pandya',
      team: 'Mumbai Indians',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Hardik%20Pandya.png',
      country: 'India',
      stats: { runs: 2500, avg: 28.5, sr: 145.2, wickets: 60, economy: 8.8 },
      auctionScore: 920,
      basePrice: 200
    },
    {
      playerId: 'suryakumar-yadav',
      name: 'Suryakumar Yadav',
      team: 'Mumbai Indians',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Suryakumar%20Yadav.png',
      country: 'India',
      stats: { runs: 3500, avg: 32.5, sr: 143.2, fifties: 22 },
      auctionScore: 960,
      basePrice: 200
    },
    {
      playerId: 'ishan-kishan',
      name: 'Ishan Kishan',
      team: 'Mumbai Indians',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Ishan%20Kishan.png',
      country: 'India',
      stats: { runs: 2800, avg: 29.5, sr: 135.8, fifties: 15 },
      auctionScore: 890,
      basePrice: 200
    },
    // GT
    {
      playerId: 'rashid-khan',
      name: 'Rashid Khan',
      team: 'Gujarat Titans',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Rashid%20Khan.png',
      country: 'Afghanistan',
      stats: { wickets: 150, economy: 6.7, bowlAvg: 20.8, sr: 18.6, hauls: 1 },
      auctionScore: 985,
      basePrice: 200
    },
    {
      playerId: 'shubman-gill',
      name: 'Shubman Gill',
      team: 'Gujarat Titans',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Shubman%20Gill.png',
      country: 'India',
      stats: { runs: 3200, avg: 38.1, sr: 135.2, centuries: 3, fifties: 20 },
      auctionScore: 930,
      basePrice: 200
    },
    {
      playerId: 'mohammed-shami',
      name: 'Mohammed Shami',
      team: 'Gujarat Titans',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Mohammed%20Shami.png',
      country: 'India',
      stats: { wickets: 127, economy: 8.4, bowlAvg: 28.3 },
      auctionScore: 910,
      basePrice: 200
    },
    {
      playerId: 'david-miller',
      name: 'David Miller',
      team: 'Gujarat Titans',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/David%20Miller.png',
      country: 'South Africa',
      stats: { runs: 2800, avg: 36.5, sr: 138.2, fifties: 12 },
      auctionScore: 880,
      basePrice: 100
    },
    // LSG
    {
      playerId: 'kl-rahul',
      name: 'KL Rahul',
      team: 'Lucknow Super Giants',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/KL%20Rahul.png',
      country: 'India',
      stats: { runs: 4600, avg: 45.4, sr: 134.6, centuries: 4, fifties: 37 },
      auctionScore: 945,
      basePrice: 200
    },
    {
      playerId: 'nicholas-pooran',
      name: 'Nicholas Pooran',
      team: 'Lucknow Super Giants',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Nicholas%20Pooran.png',
      country: 'West Indies',
      stats: { runs: 1800, avg: 28.5, sr: 156.7, centuries: 0, fifties: 10 },
      auctionScore: 910,
      basePrice: 200
    },
    {
      playerId: 'quinton-de-kock',
      name: 'Quinton de Kock',
      team: 'Lucknow Super Giants',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Quinton%20de%20Kock.png',
      country: 'South Africa',
      stats: { runs: 3200, avg: 32.5, sr: 134.2, centuries: 2, fifties: 22 },
      auctionScore: 900,
      basePrice: 200
    },
    // KKR
    {
      playerId: 'shreyas-iyer',
      name: 'Shreyas Iyer',
      team: 'Kolkata Knight Riders',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Shreyas%20Iyer.png',
      country: 'India',
      stats: { runs: 3100, avg: 32.2, sr: 125.8, centuries: 0, fifties: 21 },
      auctionScore: 880,
      basePrice: 200
    },
    {
      playerId: 'sunil-narine',
      name: 'Sunil Narine',
      team: 'Kolkata Knight Riders',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Sunil%20Narine.png',
      country: 'West Indies',
      stats: { runs: 1500, sr: 165.2, wickets: 170, economy: 6.7, hauls: 1 },
      auctionScore: 970,
      basePrice: 200
    },
    {
      playerId: 'mitchell-starc',
      name: 'Mitchell Starc',
      team: 'Kolkata Knight Riders',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Mitchell%20Starc.png',
      country: 'Australia',
      stats: { wickets: 50, economy: 8.2, bowlAvg: 25.5 },
      auctionScore: 940,
      basePrice: 200
    },
    {
      playerId: 'rinku-singh',
      name: 'Rinku Singh',
      team: 'Kolkata Knight Riders',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Rinku%20Singh.png',
      country: 'India',
      stats: { runs: 800, sr: 145.5, avg: 35.2 },
      auctionScore: 890,
      basePrice: 100
    },
    {
      playerId: 'andre-russell',
      name: 'Andre Russell',
      team: 'Kolkata Knight Riders',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Andre%20Russell.png',
      country: 'West Indies',
      stats: { runs: 2400, sr: 174.2, wickets: 105, economy: 9.2 },
      auctionScore: 950,
      basePrice: 200
    },
    // DC
    {
      playerId: 'rishabh-pant',
      name: 'Rishabh Pant',
      team: 'Delhi Capitals',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Rishabh%20Pant.png',
      country: 'India',
      stats: { runs: 3300, avg: 35.3, sr: 148.9, centuries: 1, fifties: 18 },
      auctionScore: 940,
      basePrice: 200
    },
    {
      playerId: 'david-warner',
      name: 'David Warner',
      team: 'Delhi Capitals',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/David%20Warner.png',
      country: 'Australia',
      stats: { runs: 6500, avg: 40.5, sr: 139.9, centuries: 4, fifties: 62 },
      auctionScore: 965,
      basePrice: 200
    },
    {
      playerId: 'kuldeep-yadav',
      name: 'Kuldeep Yadav',
      team: 'Delhi Capitals',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Kuldeep%20Yadav.png',
      country: 'India',
      stats: { wickets: 85, economy: 8.1, bowlAvg: 26.2 },
      auctionScore: 920,
      basePrice: 200
    },
    {
      playerId: 'axar-patel',
      name: 'Axar Patel',
      team: 'Delhi Capitals',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Axar%20Patel.png',
      country: 'India',
      stats: { runs: 1500, sr: 130.5, wickets: 120, economy: 7.2 },
      auctionScore: 935,
      basePrice: 200
    },
    // RR
    {
      playerId: 'sanju-samson',
      name: 'Sanju Samson',
      team: 'Rajasthan Royals',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Sanju%20Samson.png',
      country: 'India',
      stats: { runs: 4200, avg: 30.7, sr: 138.9, centuries: 3, fifties: 25 },
      auctionScore: 915,
      basePrice: 200
    },
    {
      playerId: 'yuzvendra-chahal',
      name: 'Yuzvendra Chahal',
      team: 'Rajasthan Royals',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Yuzvendra%20Chahal.png',
      country: 'India',
      stats: { wickets: 200, economy: 7.6, bowlAvg: 21.8, hauls: 1 },
      auctionScore: 960,
      basePrice: 200
    },
    {
      playerId: 'jos-buttler',
      name: 'Jos Buttler',
      team: 'Rajasthan Royals',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Jos%20Buttler.png',
      country: 'England',
      stats: { runs: 3500, avg: 38.2, sr: 147.5, centuries: 7, fifties: 19 },
      auctionScore: 975,
      basePrice: 200
    },
    {
      playerId: 'yashasvi-jaiswal',
      name: 'Yashasvi Jaiswal',
      team: 'Rajasthan Royals',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Yashasvi%20Jaiswal.png',
      country: 'India',
      stats: { runs: 1500, avg: 35.5, sr: 150.2, centuries: 2, fifties: 8 },
      auctionScore: 940,
      basePrice: 200
    },
    // SRH
    {
      playerId: 'pat-cummins',
      name: 'Pat Cummins',
      team: 'Sunrisers Hyderabad',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Pat%20Cummins.png',
      country: 'Australia',
      stats: { wickets: 60, economy: 8.5, bowlAvg: 30.2, hauls: 0 },
      auctionScore: 890,
      basePrice: 200
    },
    {
      playerId: 'travis-head',
      name: 'Travis Head',
      team: 'Sunrisers Hyderabad',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Travis%20Head.png',
      country: 'Australia',
      stats: { runs: 1200, avg: 35.2, sr: 175.8, centuries: 1, fifties: 5 },
      auctionScore: 955,
      basePrice: 200
    },
    {
      playerId: 'heinrich-klaasen',
      name: 'Heinrich Klaasen',
      team: 'Sunrisers Hyderabad',
      role: 'Wicket-Keeper',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Heinrich%20Klaasen.png',
      country: 'South Africa',
      stats: { runs: 1200, sr: 170.5, avg: 45.2 },
      auctionScore: 960,
      basePrice: 200
    },
    {
      playerId: 'abhishek-sharma',
      name: 'Abhishek Sharma',
      team: 'Sunrisers Hyderabad',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Abhishek%20Sharma.png',
      country: 'India',
      stats: { runs: 1400, sr: 155.2, avg: 28.5 },
      auctionScore: 895,
      basePrice: 100
    },
    // PBKS
    {
      playerId: 'sam-curran',
      name: 'Sam Curran',
      team: 'Punjab Kings',
      role: 'All-Rounder',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Sam%20Curran.png',
      country: 'England',
      stats: { runs: 800, sr: 140.2, wickets: 55, economy: 9.5 },
      auctionScore: 850,
      basePrice: 200
    },
    {
      playerId: 'arshdeep-singh',
      name: 'Arshdeep Singh',
      team: 'Punjab Kings',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Arshdeep%20Singh.png',
      country: 'India',
      stats: { wickets: 70, economy: 8.8, bowlAvg: 26.5 },
      auctionScore: 870,
      basePrice: 200
    },
    {
      playerId: 'shikhar-dhawan',
      name: 'Shikhar Dhawan',
      team: 'Punjab Kings',
      role: 'Batter',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Shikhar%20Dhawan.png',
      country: 'India',
      stats: { runs: 6700, avg: 35.2, sr: 127.5, centuries: 2, fifties: 51 },
      auctionScore: 910,
      basePrice: 200
    },
    {
      playerId: 'kagiso-rabada',
      name: 'Kagiso Rabada',
      team: 'Punjab Kings',
      role: 'Bowler',
      photoUrl: 'https://scores.iplt20.com/ipl/playerimages/Kagiso%20Rabada.png',
      country: 'South Africa',
      stats: { wickets: 115, economy: 8.2, bowlAvg: 20.5 },
      auctionScore: 945,
      basePrice: 200
    }
  ];

  const teams = [
    'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bengaluru', 
    'Kolkata Knight Riders', 'Rajasthan Royals', 'Delhi Capitals', 
    'Gujarat Titans', 'Lucknow Super Giants', 'Sunrisers Hyderabad', 'Punjab Kings'
  ];
  const roles: ("Batter" | "Bowler" | "All-Rounder" | "Wicket-Keeper")[] = ['Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
  const countries = ['India', 'Australia', 'South Africa', 'England', 'West Indies', 'New Zealand', 'Afghanistan', 'Sri Lanka'];

  const generated: Player[] = [...basePlayers];
  
  // Fill up to 200 players with more realistic names
  const moreRealNames = [
    "Ishan Kishan", "Tilak Varma", "Tim David", "Gerald Coetzee", "Dilshan Madushanka",
    "Deepak Chahar", "Shardul Thakur", "Sameer Rizvi", "Rachin Ravindra", "Daryl Mitchell",
    "Rajat Patidar", "Will Jacks", "Yash Dayal", "Lockie Ferguson", "Alzarri Joseph",
    "Venkatesh Iyer", "Varun Chakaravarthy", "Nitish Rana", "Phil Salt", "Ramandeep Singh",
    "Rahul Tewatia", "Shahrukh Khan", "Spencer Johnson", "Azmatullah Omarzai", "Umesh Yadav",
    "Ayush Badoni", "Krunal Pandya", "Mohsin Khan", "Mayank Yadav", "Naveen-ul-Haq",
    "Dhruv Jurel", "Riyan Parag", "Ravichandran Ashwin", "Avesh Khan", "Shimron Hetmyer",
    "Prithvi Shaw", "Anrich Nortje", "Jake Fraser-McGurk", "Tristan Stubbs", "Khaleel Ahmed",
    "Aiden Markram", "T Natarajan", "Mayank Agarwal", "Nitish Kumar Reddy", "Shahbaz Ahmed",
    "Jitesh Sharma", "Harpreet Brar", "Shashank Singh", "Ashutosh Sharma", "Jonny Bairstow",
    "Liam Livingstone", "Sam Curran", "Arshdeep Singh", "Rahul Chahar", "Harshal Patel",
    "Prabhsimran Singh", "Sikandar Raza", "Chris Woakes", "Rilee Rossouw", "Vidwath Kaverappa",
    "Tanay Thyagarajan", "Manav Suthar", "Siddharth Kaul", "Sandeep Sharma", "Navdeep Saini",
    "Tushar Deshpande", "Mukesh Kumar", "Ishant Sharma", "Jhye Richardson", "Noor Ahmad",
    "Joshua Little", "Sai Kishore", "Vijay Shankar", "Abhinav Manohar", "Matthew Wade",
    "Kane Williamson", "Marco Jansen", "Glenn Phillips", "Heinrich Klaasen", "Mayank Markande",
    "Umran Malik", "Fazalhaq Farooqi", "Wanindu Hasaranga", "Maheesh Theekshana", "Pathum Nissanka",
    "Kusal Mendis", "Charith Asalanka", "Dasun Shanaka", "Dushmantha Chameera", "Binura Fernando",
    "Mohammad Nabi", "Mujeeb Ur Rahman", "Gulbadin Naib", "Azmatullah Omarzai", "Ibrahim Zadran",
    "Rahmanullah Gurbaz", "Najibullah Zadran", "Fazalhaq Farooqi", "Naveen-ul-Haq", "Noor Ahmad",
    "Quinton de Kock", "Temba Bavuma", "Aiden Markram", "Rassie van der Dussen", "David Miller",
    "Heinrich Klaasen", "Tristan Stubbs", "Marco Jansen", "Keshav Maharaj", "Kagiso Rabada",
    "Anrich Nortje", "Lungi Ngidi", "Gerald Coetzee", "Tabraiz Shamsi", "Bjorn Fortuin",
    "Jos Buttler", "Phil Salt", "Will Jacks", "Harry Brook", "Liam Livingstone",
    "Moeen Ali", "Sam Curran", "Chris Woakes", "Adil Rashid", "Mark Wood",
    "Reece Topley", "Jofra Archer", "Gus Atkinson", "Tom Hartley", "Ben Duckett",
    "Travis Head", "David Warner", "Mitchell Marsh", "Glenn Maxwell", "Marcus Stoinis",
    "Tim David", "Matthew Wade", "Pat Cummins", "Mitchell Starc", "Josh Hazlewood",
    "Adam Zampa", "Nathan Ellis", "Spencer Johnson", "Cameron Green", "Steve Smith",
    "Kane Williamson", "Daryl Mitchell", "Rachin Ravindra", "Glenn Phillips", "Mark Chapman",
    "James Neesham", "Mitchell Santner", "Ish Sodhi", "Tim Southee", "Trent Boult",
    "Matt Henry", "Lockie Ferguson", "Adam Milne", "Finn Allen", "Devon Conway",
    "Noor Ahmad", "Noor Ahmad", "Noor Ahmad", "Noor Ahmad", "Noor Ahmad", // Duplicates will be filtered by ID check
    "Sandeep Sharma", "Mohit Sharma", "Deepak Hooda", "Krunal Pandya", "Marcus Stoinis",
    "Nicholas Pooran", "Quinton de Kock", "KL Rahul", "Ayush Badoni", "Ravi Bishnoi",
    "Yash Thakur", "Naveen-ul-Haq", "Amit Mishra", "Prerak Mankad", "Arshad Khan",
    "Yudhvir Singh", "M Siddharth", "Ashton Turner", "David Willey", "Kyle Mayers",
    "Shamar Joseph", "Matt Henry", "Arshin Kulkarni", "Deepak Chahar", "Ruturaj Gaikwad",
    "MS Dhoni", "Ravindra Jadeja", "Ajinkya Rahane", "Shivam Dube", "Daryl Mitchell",
    "Rachin Ravindra", "Sameer Rizvi", "Shardul Thakur", "Mustafizur Rahman", "Matheesha Pathirana",
    "Tushar Deshpande", "Maheesh Theekshana", "Mitchell Santner", "Moeen Ali", "Devon Conway",
    "Ishant Sharma", "Jhye Richardson", "Noor Ahmad", "Joshua Little", "Sai Kishore",
    "Vijay Shankar", "Abhinav Manohar", "Matthew Wade", "Kane Williamson", "Marco Jansen",
    "Glenn Phillips", "Heinrich Klaasen", "Mayank Markande", "Umran Malik", "Fazalhaq Farooqi",
    "Wanindu Hasaranga", "Maheesh Theekshana", "Pathum Nissanka", "Kusal Mendis", "Charith Asalanka",
    "Dasun Shanaka", "Dushmantha Chameera", "Binura Fernando", "Mohammad Nabi", "Mujeeb Ur Rahman",
    "Gulbadin Naib", "Azmatullah Omarzai", "Ibrahim Zadran", "Rahmanullah Gurbaz", "Najibullah Zadran",
    "Fazalhaq Farooqi", "Naveen-ul-Haq", "Noor Ahmad", "Quinton de Kock", "Temba Bavuma",
    "Aiden Markram", "Rassie van der Dussen", "David Miller", "Heinrich Klaasen", "Tristan Stubbs",
    "Marco Jansen", "Keshav Maharaj", "Kagiso Rabada", "Anrich Nortje", "Lungi Ngidi",
    "Gerald Coetzee", "Tabraiz Shamsi", "Bjorn Fortuin", "Jos Buttler", "Phil Salt",
    "Will Jacks", "Harry Brook", "Liam Livingstone", "Moeen Ali", "Sam Curran",
    "Chris Woakes", "Adil Rashid", "Mark Wood", "Reece Topley", "Jofra Archer",
    "Gus Atkinson", "Tom Hartley", "Ben Duckett", "Travis Head", "David Warner",
    "Mitchell Marsh", "Glenn Maxwell", "Marcus Stoinis", "Tim David", "Matthew Wade",
    "Pat Cummins", "Mitchell Starc", "Josh Hazlewood", "Adam Zampa", "Nathan Ellis",
    "Spencer Johnson", "Cameron Green", "Steve Smith", "Kane Williamson", "Daryl Mitchell",
    "Rachin Ravindra", "Glenn Phillips", "Mark Chapman", "James Neesham", "Mitchell Santner",
    "Ish Sodhi", "Tim Southee", "Trent Boult", "Matt Henry", "Lockie Ferguson",
    "Adam Milne", "Finn Allen", "Devon Conway", "Rovman Powell", "Shimron Hetmyer",
    "Jason Holder", "Kyle Mayers", "Nicholas Pooran", "Andre Russell", "Sunil Narine",
    "Alzarri Joseph", "Shamar Joseph", "Sherfane Rutherford", "Oshane Thomas", "Obed McCoy",
    "Romario Shepherd", "Akeal Hosein", "Gudakesh Motie", "Brandon King", "Johnson Charles",
    "Shai Hope", "Keacy Carty", "Yannic Cariah", "Dominic Drakes", "Fabian Allen",
    "Roston Chase", "Justin Greaves", "Kavem Hodge", "Tevin Imlach", "Alick Athanaze",
    "Teddy Bishop", "Jordan Johnson", "Matthew Forde", "Nyeem Young", "Kevin Wickham",
    "Rivaldo Clarke", "Leonardo Julien", "Joshua Da Silva", "Anderson Phillip", "Jayden Seales"
  ];

  moreRealNames.forEach((name, idx) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (!generated.find(p => p.playerId === id)) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const team = teams[Math.floor(Math.random() * teams.length)];
      generated.push({
        playerId: id,
        name: name,
        team: team,
        role: role,
        photoUrl: `https://scores.iplt20.com/ipl/playerimages/${name.replace(/\s+/g, '%20')}.png`,
        country: idx < 50 ? 'India' : countries[Math.floor(Math.random() * countries.length)],
        stats: role === 'Bowler' ? {
          wickets: Math.floor(Math.random() * 80 + 20),
          economy: parseFloat((Math.random() * 2 + 7).toFixed(1)),
          bowlAvg: parseFloat((Math.random() * 10 + 22).toFixed(1))
        } : {
          runs: Math.floor(Math.random() * 2000 + 500),
          avg: parseFloat((Math.random() * 15 + 25).toFixed(1)),
          sr: parseFloat((Math.random() * 30 + 130).toFixed(1))
        },
        auctionScore: Math.floor(Math.random() * 200 + 750),
        basePrice: [50, 100, 150, 200][Math.floor(Math.random() * 4)]
      });
    }
  });

  // Final pass to ensure all players have at least 50 Lakhs base price
  return generated.map(p => ({
    ...p,
    basePrice: Math.max(50, p.basePrice || 0)
  }));
};

export const IPL_PLAYERS: Player[] = generatePlayers();
