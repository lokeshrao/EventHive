import * as SQLite from 'expo-sqlite';


let dbInstance = null;

const getDbConnection = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance =SQLite.openDatabaseSync({ name: 'myDB.db', location: 'default' });
    initializeDatabase
    console.log('Database opened');
    return dbInstance;
  } catch (error) {
    console.error('Failed to open database', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
    const db = await getDbConnection();
  
    try {
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY,
          name TEXT,
          description TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          url TEXT,
          type TEXT,
          channel TEXT,
          startDate TEXT,
          endDate TEXT
        );
      `);
      console.log('Events table created successfully');
  
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER,
          user_id INTEGER,
          firstName TEXT,
          lastName TEXT,
          email TEXT,
          updatedAt TEXT,
          createdAt TEXT,
          progressionStatus TEXT,
          membershipDate TEXT,
          FOREIGN KEY (event_id) REFERENCES events(id)
        );
      `);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Failed to create tables', error);
      throw error;
    }
  };

export const executeQuery = async (query, params = []) => {
  const db = await getDbConnection();
  try {
    const [results] = await db.executeSql(query, params);
    return results;
  } catch (error) {
    console.error('Failed to execute query', error);
    throw error;
  }
};

export default {
  getDbConnection,
  initializeDatabase,
  executeQuery,
};
