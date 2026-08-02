import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Not using admin, let's use the REST API or emulator? No, there is no emulator.
// The user provided their firebase project config.
