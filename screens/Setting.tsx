// Inside Setting component (./screens/Setting.js)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { getToken } from '../utils/authApi';
import StorageHelper from '../utils/storageHelper';

interface SettingProps {
  onTokenUpdate: () => void; // Define onTokenUpdate prop as a function that returns void
}

const Setting: React.FC<SettingProps> = ({ onTokenUpdate }) => {
  const [endPointUrl, setEndPointUrl] = useState<string>('https://435-tdp-284.mktorest.com');
  const [clientId, setClientId] = useState<string>('28813bb5-805e-4a06-85db-cbf31466ae9f');
  const [clientSecret, setClientSecret] = useState<string>('cB9eg9bE0uOWjxGVrB8wFIJHQmhZvi1O');
  const [showLoadingDialog, setShowLoadingDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  const handleConnect = async () => {
    if (!endPointUrl || !clientId || !clientSecret) {
      setMessage('All fields are required');
      return;
    }

    try {
      setShowLoadingDialog(true);
      setMessage('Connecting...');
      const tokenData = await getToken(endPointUrl, clientId, clientSecret);
      if (!tokenData || !tokenData.access_token) {
        throw new Error('Invalid response from server');
      }
      const { access_token, expires_in } = tokenData;
      const expiryTime = Date.now() + expires_in * 1000;
      await StorageHelper.saveItem('token', access_token);
      await StorageHelper.saveItem('expiryTime', expiryTime.toString());
      setMessage('Connected successfully');
    } catch (error) {
      console.error('Failed to connect', error);
      setMessage('Connection failed');
    } finally {
      setShowLoadingDialog(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Modal and other UI components */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLoadingDialog}
        onRequestClose={() => setShowLoadingDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingDialog}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingMessage}>{message}</Text>
          </View>
        </View>
      </Modal>

      <>
        <TouchableOpacity onPress={() => { /* Handle back navigation */ }}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        {/* Your existing UI components */}
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
      </>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
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
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#FF5733',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Setting;
