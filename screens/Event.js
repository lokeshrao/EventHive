import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, ScrollView } from 'react-native';
import getDbConnection from '../database/mydb'; // Import the Database module
import { fetchEventAndUsersData } from '../utils/eventApi.js';  /// Adjust the path according to your file structure
import StorageHelper from '../utils/storageHelper';  // Adjust the path to your storageHelper.js file


export default function App() {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [token, setToken] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await StorageHelper.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setIsButtonDisabled(true);
        ToastAndroid.show('Token already exists', ToastAndroid.SHORT);
      }
    };
    checkToken();
    fetchEvents();
  }, []);


  const handleAddEvent = async () => {
    if (!eventName) {
      alert('Event name cannot be empty');
      return;
    }

    try {
      // Fetch event data from the API
      const eventData = await fetchEventAndUsersData(eventName,token);
      console.log('eventDara', eventData);

      if (!eventData) {
        ToastAndroid.show('No event data found', ToastAndroid.SHORT);
        return;
      }

      // Save event to the database
      await getDbConnection.executeQuery('INSERT INTO events (name, details) VALUES (?, ?)', [eventName, JSON.stringify(eventData)]);
      setEventName('');
      setIsAddingEvent(false);
      fetchEvents(); // Fetch the updated events list
      ToastAndroid.show('Event added successfully', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Failed to add event', error);
      ToastAndroid.show('Failed to add event', ToastAndroid.SHORT);
    }
  };

  const fetchEvents = async () => {
    try {
      const results = await getDbConnection.executeQuery('SELECT * FROM events');
      if (results) {
        const rows = results.rows;
        const eventsList = [];
        // for (let i = 0; i < rows.length; i++) {
        //   eventsList.push(rows.item(i));
        // }
        // setEvents(eventsList);
      } else {
        console.warn('No events found in the database');
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Events</Text>
        <ScrollView contentContainerStyle={styles.noEventsContainer}>
          {events.length === 0 ? (
            <>
              <Text style={styles.noEventsText}>No scheduled events at the moment</Text>
              <Text style={styles.noEventsSubtext}>It takes 1 minute to connect to your Marketo event.</Text>
              <Button title="Add event" onPress={() => setIsAddingEvent(true)} />
            </>
          ) : (
            events.map((event) => (
              <Text key={event.id} style={styles.eventItem}>{event.name}</Text>
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.content}>
        {isAddingEvent ? (
          <View style={styles.addEventContainer}>
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={eventName}
              onChangeText={setEventName}
            />
            <Button title="Save Event" onPress={handleAddEvent} />
            <Button title="Cancel" onPress={() => setIsAddingEvent(false)} />
          </View>
        ) : (
          <View style={styles.videoContainer}>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.videoThumbnail} />
            <Text style={styles.videoTitle}>How to add an event?</Text>
            <Text style={styles.videoSubtext}>Watch this step by step tutorial</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#80CBC4',
    padding: 20,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  eventItem: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 2,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 300,
    height: 200,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoSubtext: {
    fontSize: 14,
    color: '#1E88E5',
  },
  addEventContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '80%',
  },
});
