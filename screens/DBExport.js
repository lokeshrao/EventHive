import React from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { deleteAllData } from '../database/mydb';

const deletePreviousDatabaseFile = async (path) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(path);
      console.log('Previous database file deleted:', path);
    }
  } catch (error) {
    console.error('Error deleting previous database file:', error);
  }
};

const copyDatabaseFile = async () => {
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/myDB.db`;

    // Ensure the directory exists
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite', { intermediates: true });

    // Define the new database path
    const randomNumber = Math.floor(Math.random() * 10000);

    // Construct the new database path with the random number
    const newDbPath = `${FileSystem.documentDirectory}myDB${randomNumber}.db`;
    // // Delete the previous database file if it exists
    // await deletePreviousDatabaseFile(newDbPath);

    // Copy the database file
    await FileSystem.copyAsync({
      from: dbPath,
      to: newDbPath,
    });

    console.log('Database file copied successfully to:', newDbPath);
    return newDbPath;
  } catch (error) {
    console.error('Error copying database file:', error);
    throw error;
  }
};

const shareDatabaseFile = async () => {
  try {
    const dbPath = await copyDatabaseFile();
    if (dbPath && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dbPath);
    } else {
      Alert.alert('Sharing is not available on this device');
    }
  } catch (error) {
    Alert.alert('Error sharing database file', error.message);
  }
};

const deleteDatabase = async () => {
    try {
       deleteAllData()
    } catch (error) {
      console.error('Error deleting database file:', error);
    }
  };
const DatabaseExporter = () => {
  return (
    <View style={styles.container}>
      <Button title="Export Database" onPress={shareDatabaseFile} />
      <Button title="Delete Database" onPress={deleteDatabase} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});

export default DatabaseExporter;