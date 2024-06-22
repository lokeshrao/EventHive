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
} from 'react-native';
import { fetchEventAndUsersData } from '../utils/eventApi'; // Adjust the path according to your file structure
import StorageHelper from '../utils/storageHelper'; // Adjust the path to your storageHelper.js file
import { useNavigation } from '@react-navigation/native';
import mydb from '../database/mydb';

const Events: React.FC = () => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState<any[]>([]); // Adjust type as per your event data structure
  const [token, setToken] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      const storedToken = await StorageHelper.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setIsButtonDisabled(true);
      }
      setLoading(false);
      fetchEvents();
    };
    checkToken();
  }, []);

  const handleAddEvent = async () => {
    if (!eventName) {
      alert('Event name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setMessage('Adding event...');
      const eventData = await fetchEventAndUsersData(eventName, token);
      console.log('eventData', eventData);

      if (!eventData) {
        alert('No event data found');
        return;
      }
      setEventName('');
      setIsAddingEvent(false);
      fetchEvents();
      setMessage('Event added successfully');
    } catch (error) {
      console.error('Failed to add event', error);
      alert('Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setMessage('Loading Events');
      const results = Array.from(await mydb.getAllEvents());

      console.log('Fetched events:', results);

      if (results && results.length > 0) {
        setEvents(results);
      } else {
        console.log('No events found in the database');
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: any) => {
    navigation.navigate('EventUsers', { eventData: event });
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
        {events.length === 0 ? (
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
  videoSubtext: {
    fontSize: 14,
    color: '#1E88E5',
  },
  addEventContainer: {
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: -200,
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingDialog: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
    addEventButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#FFCC80',
      borderRadius: 5,
      alignSelf: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    eventIdHeading: {
      alignSelf: 'flex-start',
      padding: 5,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: '#666666',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    troubleshootingText: {
      marginTop: 20,
      fontWeight: 'bold',
      fontSize: 18,
      color: 'green',
    },
    troubleshootingText2: {
      marginTop: 5,
      color: 'blue',
    },
  });
  
  export default Events;
  
