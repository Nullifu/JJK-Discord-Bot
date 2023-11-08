import { JSONFile,  } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { LowSync } from 'lowdb';

// If you're using ES modules, for example in a TypeScript setting
const __dirname = dirname(fileURLToPath(import.meta.url));

// Define your types and interfaces
type User = {
  currency: number;
  inventory: Record<string, InventoryItem>; // Using a record to keep track of item quantities
  job?: string; // Optional job field if a user has a job
};

// Define what an inventory item looks like
interface InventoryItem {
  itemId: string;
  quantity: number;
}

interface Item {
  id: string;
  name: string;
  value: number; // Value could be used for buying/selling
}

interface Job {
  name: string;
  cost: number;
  payout: { min: number; max: number };
}

interface Data {
  users: Record<string, User>;
  items: Record<string, Item>; // A record of all available items by id
  jobs: Job[];
}



// Set up a JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile<Data>(file);

// Define a default structure for your database
const defaultData: Data = {
  users: {},
  items: { // Adding a few default items
    'sword': { id: 'sword', name: 'Sword', value: 100 },
    'shield': { id: 'shield', name: 'Shield', value: 150 },
    // ...other items
  },
  jobs: [
    // You can define default jobs here
    { name: 'Cashier', cost: 100, payout: { min: 20, max: 30 } },
    { name: 'Security Guard', cost: 200, payout: { min: 30, max: 40 } },
    // ...other default jobs
  ],
};

// Create an instance of LowDB with the JSON file and the default data
const db = new Low<Data>(adapter, defaultData);

// Initialize the database with default data
const initializeDB = async () => {
  await db.read();
  db.data ||= defaultData;
  if (db.data.jobs.length === 0) {
    db.data.jobs = defaultData.jobs;
  }
  await db.write();
};

export default db;
export { defaultData, db, initializeDB, User, Item, Job, Data };
