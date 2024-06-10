import React from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Events</Text>
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No scheduled events at the moment</Text>
          <Text style={styles.noEventsSubtext}>It takes 1 minute to connect to your Marketo event.</Text>
          <Button title="Add event" onPress={() => {}} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.videoContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.videoThumbnail} />
          <Text style={styles.videoTitle}>How to add an event?</Text>
          <Text style={styles.videoSubtext}>Watch this step by step tutorial</Text>
        </View>
      </View>
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
});
