import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import candidateRoutes from './routes/candidates.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/data', candidateRoutes); // using the same path as before to not break the frontend

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
