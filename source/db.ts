// db.ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path';
// Define typings for the records in the database
type Record = {
  id: string;
  currency: number;
};
// Define typings for the data schema
interface Data {
  records: Record[];
}
// Use JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile<Data>(file);
const defaultData: Data = { records: [] }; // Provide default data here
const db = new Low(adapter, defaultData); // Pass default data to the Low constructor
// Set default data
db.data ||= { records: [] }; // If db.data is null or undefined, initialize it with default data
export default db;
