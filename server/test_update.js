import { getCandidateCollection } from './models/Candidate.js';
import { connectDB } from './config/db.js';

(async () => {
  await connectDB();
  const col = await getCandidateCollection();
  await col.updateOne({ name: 'aruna' }, { $set: { likes: 5 } });
  process.exit(0);
})();
