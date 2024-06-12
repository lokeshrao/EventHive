import * as SQLite from 'expo-sqlite';
import { LogBox } from 'react-native';

let dbInstance = null;

const getDbConnection = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = SQLite.openDatabaseSync('myDB.db', { location: 'default' });
    await initializeDatabase(); // Call initializeDatabase as a function
    console.log('Database opened');
    return dbInstance;
  } catch (error) {
    console.error('Failed to opennnnn database', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  const db = await getDbConnection();

  try {
    await db.execAsync(`
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

    await db.execAsync(`
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
export const getAllEvents = async () => {
  try {
    const db = await getDbConnection();

    const sql = `
      SELECT 
        e.*, 
        u.id AS user_id, 
        u.firstName, 
        u.lastName, 
        u.email, 
        u.updatedAt AS userUpdatedAt, 
        u.createdAt AS userCreatedAt, 
        u.progressionStatus, 
        u.membershipDate 
      FROM events e 
      LEFT JOIN users u ON e.id = u.event_id;
    `;

    const result = await db.getAllAsync(sql);

    const eventsMap = {};
    result.forEach(row => {
      if (!eventsMap[row.id]) {
        eventsMap[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          url: row.url,
          type: row.type,
          channel: row.channel,
          startDate: row.startDate,
          endDate: row.endDate,
          users: [] 
        };
      }

      if (row.user_id) {
        eventsMap[row.id].users.push({
          user_id: row.user_id,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          updatedAt: row.userUpdatedAt,
          createdAt: row.userCreatedAt,
          progressionStatus: row.progressionStatus,
          membershipDate: row.membershipDate
        });
      }
    });
    return Object.values(eventsMap);
  } catch (error) {
    console.error('Failed to fetch events', error);
    throw error;
  }
};

export const saveEventAndUser = async (eventData, users, eventId) => {
  const db = await getDbConnection();

  try {
    const eventQuery = `
    INSERT OR REPLACE INTO events (id, name, description, createdAt, updatedAt, url, type, channel, startDate, endDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const eventValues = [
      eventData.id ?? 0,
      eventData.name ?? '',
      eventData.description ?? '',
      eventData.createdAt ?? '',
      eventData.updatedAt ?? '',
      eventData.url ?? '',
      eventData.type ?? '',
      eventData.channel ?? '',
      eventData.startDate ?? '',
      eventData.endDate ?? ''
    ];

    console.log(" query --- " + eventQuery + "   data  " + eventValues, eventId)
    await db.runAsync(eventQuery, eventValues);
    const numItems = users.length;

const placeholders = Array(numItems).fill("(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

const bulkInsertQuery = `
  INSERT OR REPLACE INTO users (event_id, user_id, firstName, lastName, email, updatedAt, createdAt, progressionStatus, membershipDate)
  VALUES ${placeholders};
`;
    const userValues = [];
    for (const userData of users) {
      userValues.push(
        eventData.id ?? 0,
        userData.user_id ?? 0,
        userData.firstName ?? '',
        userData.lastName ?? '',
        userData.email ?? '',
        userData.updatedAt ?? '',
        userData.createdAt ?? '',
        userData.membership.progressionStatus ?? '',
        userData.membership.membershipDate ?? ''
      );
    }
    console.log("Query --- " + bulkInsertQuery + " Data: ", userValues);
    await db.runAsync(bulkInsertQuery, userValues);


    console.log('Event and user data saved successfully');
  } catch (error) {
    console.error('Failed to save event and user data', error);
    throw error;
  }
};
export const deleteAllData = async () => {
  const db = await getDbConnection();
  try {
    await db.runAsync('DELETE FROM events');
    console.log('All data deleted from the events table');

    await db.runAsync('DELETE FROM users');
    console.log('All data deleted from the users table');
  } catch (error) {
    console.error('Failed to delete all data', error);
    throw error;
  }
};
export const executeQuery = async (query) => {
  const db = await getDbConnection();
  try {
    const [results] = await db.execAsync(query);
    return results;
  } catch (error) {
    console.error('Failed to execute query', error);
    throw error;
  }
};

export default {
  getDbConnection,
  executeQuery,
  getAllEvents,
  saveEventAndUser,
  deleteAllData
};
