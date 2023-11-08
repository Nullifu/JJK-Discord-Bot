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
  users: any;
  records: Record[];
  }
    // Use JSON file for storage
    const file =  './db.json';
      const adapter = new JSONFile<Data>(file);
    const defaultData: Data = {
      records: [],
      users: undefined
    };


    const db = new Low(adapter, defaultData); // Pass default data to the Low constructor
      await db.read();
        db.data ||= defaultData; // Now it includes both users and records

        //------------------------------------------------------------------------------------------------------------------------


              

        
  

        


  

export default db;
