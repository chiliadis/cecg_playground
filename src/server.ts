import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { initDatabase } from './database';
import { apiRoutes } from './routes/api';
import { seedDatabase } from './seedData';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src-attr": ["'self'", "'unsafe-inline'"], // Allow inline event handlers for testing playground
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function startServer() {
  try {
    await initDatabase();
    console.log('Database initialized successfully');

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Testing playground server running on http://localhost:${PORT}`);
      console.log('');
      console.log('🧪 CECG Testing Playground Features:');
      console.log('• Customer Management - Create, manage, and search customers');
      console.log('• Broker Management - Manage insurance brokers and specializations');
      console.log('• Policy Management - Create and track insurance policies');
      console.log('• Claims Processing - Submit and process insurance claims');
      console.log('• Quote Calculator - Calculate insurance quotes with risk assessment');
      console.log('• API Testing - Test all endpoints and error scenarios');
      console.log('');
      console.log(`Visit http://localhost:${PORT} to start testing!`);
      console.log('CECG Quality Engineering Testing Portal')
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();