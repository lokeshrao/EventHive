import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import StorageHelper from '../utils/storageHelper';  // Adjust the path to your storageHelper.js file
import { getToken } from '../utils/authApi';  /// Adjust the path according to your file structure

export default function Setting() {
  const [endPointUrl, setEndPointUrl] = useState('https://435-tdp-284.mktorest.com');
  const [clientId, setClientId] = useState('28813bb5-805e-4a06-85db-cbf31466ae9f');
  const [clientSecret, setClientSecret] = useState('cB9eg9bE0uOWjxGVrB8wFIJHQmhZvi1O');
  const [token, setToken] = useState(null);
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
  }, []);

  const handleConnect = async () => {
    if (!endPointUrl || !clientId || !clientSecret) {
      ToastAndroid.show('All fields are required', ToastAndroid.SHORT);
      return;
    }

    try {
      const tokenData = await getToken(endPointUrl, clientId, clientSecret);
      if (!tokenData || !tokenData.access_token) {
        throw new Error('Invalid response from server');
      }
      const { access_token } = tokenData;
      await StorageHelper.saveItem('token', access_token);
      setToken(access_token);
      setIsButtonDisabled(true);
      ToastAndroid.show('Connected successfully', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Failed to connect', error);
      ToastAndroid.show('Connection failed', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => { /* Handle back navigation */ }}>
        <Text style={styles.backButton}>{'<'}</Text>
      </TouchableOpacity>
      <Image source={{ uri: 'https://via.placeholder.com/300x200' }} style={styles.videoThumbnail} />
      <Text style={styles.title}>How to connect to my Marketo account?</Text>
      <Text style={styles.subtitle}>Watch this step by step tutorial</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputHeading}>End Point URL</Text>
        <TextInput
          style={styles.input}
          value={endPointUrl}
          onChangeText={setEndPointUrl}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputHeading}>Client ID</Text>
        <TextInput
          style={styles.input}
          value={clientId}
          onChangeText={setClientId}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputHeading}>Client Secret</Text>
        <TextInput
          style={styles.input}
          value={clientSecret}
          onChangeText={setClientSecret}
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={handleConnect} style={styles.button} disabled={isButtonDisabled}>
        <Text style={styles.buttonText}>Connect to my Marketo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 20,
    fontSize: 24,
    color: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#1E88E5',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    marginHorizontal: 20,
    width: '100%',
  },
  inputHeading: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#80CBC4',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    width: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
