import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });

  const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });

  const roomId = 'D5BM3M';
  const newRoom = {
    roomId,
    title: `Alice's Auction`,
    hostId: 'alice',
    playersCount: 5,
    revealTimer: 15,
    isPublic: true,
    status: 'waiting',
    players: {
      'alice': { uid: 'alice', displayName: 'Alice', photoURL: 'http://example.com/photo.png' }
    },
    squads: {
      'alice': []
    },
    purses: {
      'alice': 10000
    },
    auctionedPlayerIds: [],
    skipVotes: [],
    // createdAt: serverTimestamp() will be simulated as timestamp
    // wait, we can't use serverTimestamp easily in plain JS without firestore SDK,
    // but rules-unit-testing provides it if we use its firestore instance
  };

  const db = alice.firestore();
  
  // Try to create
  try {
    const { serverTimestamp } = await import('firebase/firestore');
    newRoom.createdAt = serverTimestamp();
    await assertSucceeds(db.collection('rooms').doc(roomId).set(newRoom));
    console.log("Success!");
  } catch (e) {
    console.error("Failed!", e);
  }

  await testEnv.cleanup();
}

run();
