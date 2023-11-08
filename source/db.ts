import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb'

// If you're using ES modules, for example in a TypeScript setting
const __dirname = dirname(fileURLToPath(import.meta.url));

type User = {
  currency: number;
  items: string[];
  job?: string; // Optional job field if a user has a job
};

interface Job {
  name: string;
  cost: number;
  payout: { min: number; max: number };
}

interface Data {
  users: Record<string, User>;
  jobs: Job[];
}

// Set up a JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile<Data>(file);

// Define a default structure for your database
const defaultData: Data = {
  users: {},
  jobs: [
    // You can define default jobs here
    { name: 'Cashier', cost: 100, payout: { min: 20, max: 30 } },
    { name: 'Security Guard', cost: 200, payout: { min: 30, max: 40 } },
    // ...other default jobs
  ],
};

// Create an instance of LowDB with the JSON file and the default data
const db = new Low<Data>(adapter, defaultData);


// Utility function to initialize the database with default data
const initializeDB = async () => {
  // Read data from JSON file, this will set db.data content
  await db.read();

  // If db.data is null or undefined, populate it with default data
  db.data ||= defaultData;

  // You can also check if the jobs array is empty and populate it
  if (db.data.jobs.length === 0) {
    db.data.jobs = defaultData.jobs;
  }

  // Write the default data to the database if it was missing
  await db.write();
};


export default db;
export { defaultData, db, initializeDB, User, Job, Data };
