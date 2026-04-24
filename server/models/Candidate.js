import { connectDB } from '../config/db.js';

export const getCandidateCollection = async () => {
  const db = await connectDB();
  return db.collection('candidates');
};
