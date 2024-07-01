import * as SQLite from 'expo-sqlite';

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
    console.error('Failed to open database', error);
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
        workspace TEXT,        
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
        company TEXT,
        phone TEXT,
        updatedAt TEXT,
        createdAt TEXT,
        unsubscribed INTEGER DEFAULT 0,
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

const getAllEvents = async () => {
  try {
    const db = await getDbConnection();

    const sql = `
      SELECT 
        e.*, 
        u.user_id AS user_id, 
        u.firstName, 
        u.lastName, 
        u.email, 
        u.company, 
        u.phone, 
        u.updatedAt AS userUpdatedAt, 
        u.createdAt AS userCreatedAt, 
        u.progressionStatus, 
        u.unsubscribed,
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
          workspace: row.workspace,
          users: [] 
        };
      }

      if (row.user_id) {
        eventsMap[row.id].users.push({
          user_id: row.user_id,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          company: row.company,
          phone: row.phone,
          updatedAt: row.userUpdatedAt,
          createdAt: row.userCreatedAt,
          progressionStatus: row.progressionStatus,
          unsubscribed: row.unsubscribed,
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

const saveEventAndUser = async (eventData, users, eventId) => {
  const db = await getDbConnection();

  try {
    const eventQuery = `
      INSERT OR REPLACE INTO events (id, name, description, createdAt, updatedAt, url, type, channel, workspace, startDate, endDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      eventData.workspace ?? '',
      eventData.startDate ?? '',
      eventData.endDate ?? ''
    ];

    console.log(" query --- " + eventQuery + "   data  " + eventValues, eventId);
    await db.runAsync(eventQuery, eventValues);

    const numItems = users.length;
    const placeholders = Array(numItems).fill("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)").join(", ");

    const bulkInsertQuery = `
      INSERT OR REPLACE INTO users (event_id, user_id, firstName, lastName, email, company, phone, updatedAt, createdAt, progressionStatus,unsubscribed, membershipDate)
      VALUES ${placeholders};
    `;
    const userValues = [];
    for (const userData of users) {
      userValues.push(
        eventData.id ?? 0,
        userData.id ?? 0,
        userData.firstName ?? '',
        userData.lastName ?? '',
        userData.email ?? '',
        userData.company ?? '',
        userData.phone ?? '',
        userData.updatedAt ?? '',
        userData.createdAt ?? '',
        userData.membership.progressionStatus ?? '',
        userData.unsubscribed??'',
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
const updateUser = async (userData) => {
  const db = await getDbConnection();
  
  try {
      const query = `
        UPDATE users
        SET firstName = ?, lastName = ?, email = ?, company = ?, phone = ?, unsubscribed = ?, progressionStatus = ?
        WHERE user_id = ?
      `;
      const values = [
        userData.firstName ?? '',
        userData.lastName ?? '',
        userData.email ?? '',
        userData.company ?? '',
        userData.phone ?? '',
        userData.unsubscribed ?? 0,
        userData.progressionStatus ?? '',
        userData.user_id
      ];

      await db.runAsync(query, values);
      console.log('User data updated successfully');
  } catch (error) {
    console.error('Failed to update user data', error);
    throw error;
  }
};
const createUser = async (userData,eventId) => {
  console.log("creating user " , eventId ," ---- ", JSON.stringify(userData))
  const db = await getDbConnection();
  try {
    const query = `
    INSERT INTO users 
      (event_id, user_id, firstName, lastName, email, company, phone, unsubscribed, progressionStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
    const values = [
      eventId ?? '',
      userData.user_id ?? '',
      userData.firstName ?? '',
      userData.lastName ?? '',
      userData.email ?? '',
      userData.company ?? '',
      userData.phone ?? '',
      userData.unsubscribed ?? 0,
      userData.progressionStatus ?? ''
    ];

    const result = await db.runAsync(query, values);

    if (result.changes > 0) {
      console.log('User data inserted successfully');
      return true;
    } else {
      console.log('No user data inserted');
      return false;
    }
  } catch (error) {
    console.error('Failed to insert user data', error);
    return false;
  }
};


const deleteAllData = async () => {
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

const executeQuery = async (query) => {
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
  deleteAllData,
  updateUser,
  createUser
};
