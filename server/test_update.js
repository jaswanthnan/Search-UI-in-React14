import { getCandidateCollection } from './models/Candidate.js';
import { connectDB } from './config/db.js';

(async () => {
  await connectDB();
  const col = await getCandidateCollection();
  await col.updateOne({ name: 'aruna' }, { $set: { likes: 5 } });
  console.log('Updated aruna with 5 likes');
  process.exit(0);
})();
