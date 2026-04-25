import { getCandidateCollection } from './models/Candidate.js';
import { connectDB } from './config/db.js';

const checkData = async () => {
  await connectDB();
  const collection = await getCandidateCollection();
  const candidates = await collection.find({}).toArray();
  console.log('Total candidates:', candidates.length);
  candidates.forEach(c => {
    console.log(`- ${c.name}: [${c.skills.join(', ')}] (Likes: ${c.likes || 0})`);
  });
  process.exit(0);
};

checkData();
