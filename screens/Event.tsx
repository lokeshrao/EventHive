import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import mydb from '../database/mydb'; // Adjust path to your local database utility

const Events: React.FC = () => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState<any[]>([]); // Adjust type as per your event data structure
  const [token, setToken] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true); // Track internet connection
  const navigation = useNavigation();

  useEffect(() => {
    const checkTokenAndEvents = async () => {
      setLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          setIsButtonDisabled(true);
        }
        await fetchEvents();
      } catch (error) {
        console.error('Failed to load token or events', error);
        Alert.alert('Error', 'Failed to load data. Check your storage and internet connection.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    checkTokenAndEvents();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddEvent = async () => {
    if (!eventName) {
      Alert.alert('Error', 'Event name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setMessage('Adding event...');
      const eventData = await saveEventToDatabase(eventName);
      if (!eventData) {
        Alert.alert('Error', 'Failed to add event');
        return;
      }
      setEventName('');
      setIsAddingEvent(false);
      await fetchEvents();
      setMessage('Event added successfully');
    } catch (error) {
      console.error('Failed to add event', error);
      Alert.alert('Error', 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      if (!isConnected) {
        throw new Error('No internet connection');
      }

      setLoading(true);
      setMessage('Loading Events');
      const results = await mydb.getAllEvents(); // Replace with your database fetch logic

      if (results && results.length > 0) {
        setEvents(results);
      } else {
        console.log('No events found in the database');
        Alert.alert('Info', 'No events found');
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: any) => {
    navigation.navigate('EventUsers', { eventData: event });
  };

  const saveEventToDatabase = async (eventName: string) => {
    try {
      // Simulating saving to local database
      await mydb.saveEvent({ name: eventName, startDate: new Date().toISOString(), users: [] });
      return true;
    } catch (error) {
      console.error('Failed to save event to database', error);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    const options = { day: 'numeric', month: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options); // Adjust locale as per your requirement
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Events</Text>
        {!isConnected ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No internet connection</Text>
            <Text style={styles.noEventsSubtext}>Please check your connection and try again</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No scheduled events at the moment</Text>
            <Text style={styles.noEventsSubtext}>It takes 1 minute to connect to your Marketo event.</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleEventPress(item)}>
                <View style={styles.eventItem}>
                  <View style={styles.overlay}></View>
                  <Text style={styles.eventName}>{item.name}</Text>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                    <Text style={styles.eventMembers}>Members: {item.users.length}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setIsAddingEvent(true)}>
            <Text style={styles.buttonText}>Add event</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        {isAddingEvent ? (
          <View style={styles.addEventContainer}>
            <Text style={styles.heading}>Add Event</Text>
            <Text style={styles.eventIdHeading}>Event Id </Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
            />
            <TouchableOpacity style={styles.addEventButton} onPress={() => handleAddEvent()}>
              <Text style={styles.buttonText}>Add event</Text>
            </TouchableOpacity>
            <Text style={styles.troubleshootingText}>Having trouble?</Text>
            <Text style={styles.troubleshootingText2}>Having trouble? Contact us!</Text>
          </View>
        ) : (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.videoThumbnail}
            />
            <Text style={styles.videoTitle}>How to add an event?</Text>
            <Text style={styles.videoSubtext}>Watch this step by step tutorial</Text>
          </View>
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => setLoading(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingDialog}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingMessage}>{message}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#80CBC4',
    paddingHorizontal: 10,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
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
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 25,
    paddingVertical: 10,
    width: '100%',
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  eventMembers: {
    fontSize: 14,
    color: '#fff',
  },
  addButtonContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFCC80',
    borderRadius: 5,
    alignItems: 'center',
  },
  content: {
    flex: 1.7,
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
  addEventContainer: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventIdHeading: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  addEventButton: {
    backgroundColor: '#FFCC80',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  troubleshootingText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 10,
  },
  troubleshootingText2: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingDialog: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingMessage: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default Events;
