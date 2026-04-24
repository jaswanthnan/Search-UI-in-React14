import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'talent_db';

let dbInstance = null;

export const connectDB = async () => {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    dbInstance = client.db(dbName);
    console.log('MongoDB Connected');
    return dbInstance;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};
