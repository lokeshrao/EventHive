import apiClient from './apiClient';

export const fetchEventAndUsersData = async (eventId, token) => {
    const eventEndpoint = `https://435-tdp-284.mktorest.com/rest/asset/v1/program/${eventId}.json`;
    const usersEndpoint = `https://435-tdp-284.mktorest.com/rest/v1/leads/programs/${eventId}.json`;
  
    try {
      const [eventResponse, usersResponse] = await Promise.all([
        apiClient.get(eventEndpoint, { params: { access_token: token } }),
        apiClient.get(usersEndpoint, { params: { access_token: token } })
      ]);
  
      const eventData = eventResponse.data.result[0];
      const usersData = usersResponse.data.result;
      console.log("event data ",eventData)
      console.log("user data ",usersData)

  
      // Store event data in the database
      await Database.executeQuery(
        'INSERT INTO events (id, name, description, createdAt, updatedAt, url, type, channel, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          eventData.id,
          eventData.name,
          eventData.description,
          eventData.createdAt,
          eventData.updatedAt,
          eventData.url,
          eventData.type,
          eventData.channel,
          eventData.startDate,
          eventData.endDate
        ]
      );
  
      // Store users data in the database
      for (const user of usersData) {
        await Database.executeQuery(
          'INSERT INTO users (event_id, user_id, firstName, lastName, email, updatedAt, createdAt, progressionStatus, membershipDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            eventId,
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.updatedAt,
            user.createdAt,
            user.membership.progressionStatus,
            user.membership.membershipDate
          ]
        );
      }
  
      return { event: eventData, users: usersData };
    } catch (error) {
      console.error('Failed to fetch event and users data:', error);
      throw error;
    }
  };
