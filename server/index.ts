import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import { getJobListings } from './controllers/jobsCacheController';
import { graphqlHTTP } from 'express-graphql';
import schema from './routes/graphql';
import { authMiddleware } from './middleware/authMiddleware';
import { disconnectCache } from './config/redisClient';

dotenv.config();

const app = express();
app.use(express.json());
connectDB();

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Point to the React build folder
  const clientBuildPath = path.join(__dirname, '../client/build');

  // Serve static files
  app.use(express.static(clientBuildPath));

  // Handle any routes that don't match the API routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  app.use(
    cors({
      origin: 'http://localhost:3000',
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }),
  );
}

// Auth routes
app.use('/api/auth', authRoutes);

// GraphQL endpoint with caching and authentication
app.use(
  '/api/graphql',
  authMiddleware,
  graphqlHTTP((req: any) => ({
    schema,
    graphiql: true,
    context: { user: req.user }, // Pass the user to the context from middleware
  })),
);

getJobListings();
// Fetch and cache job listings every 24 hours
setInterval(getJobListings, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Ensure the Redis client closes properly when the process exits
process.on('SIGINT', async () => {
  await disconnectCache();
});

export default app;
