import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function Login() {
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.logo}>On Spot Check-In</Text>
        <TextInput
          style={styles.input}
          placeholder="superhero@miro.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="your password"
          placeholderTextColor="#aaa"
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Text style={styles.signupLink}>Don't have an account? Sign up.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBox: {
    width: '80%',
    backgroundColor: '#003366',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#66cccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  link: {
    color: '#66cccc',
    marginTop: 10,
  },
  signupLink: {
    color: '#66cccc',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

