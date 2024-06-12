import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Button, Switch } from 'react-native';

export default function EventDetails({ route, navigation }) {
  const { eventData } = route.params;
  const users = eventData.users;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    marketingOptedIn: false,
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    console.log("selectedJUser"  + JSON.stringify(user))
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleAddUser = () => {
    // Add logic to add a new user to the list of users
    // For example:
    // users.push(newUser);
    // You may need to update your state or dispatch an action here
    // Reset newUser state and hide the modal
    setNewUser({
      firstName: '',
      lastName: '',
      title: '',
      organization: '',
      email: '',
      phone: '',
      marketingOptedIn: false,
    });
    toggleModal();
  };

  const handleEditUser = (selectedUser) => {
    // setNewUser({
    //   firstName: selectedUser.firstName??'',
    //   lastName: selectedUser.lastName??'',
    //   title: selectedUser.title??'',
    //   organization: selectedUser.organization??'',
    //   email:selectedUser.email??'',
    //   phone: selectedUser.phone??'',
    //   marketingOptedIn: false,
    // });
    // toggleModal();
    // // Add logic to edit the selected user
    // // For example:
    // // Implement a navigation to a separate edit user screen passing selectedUser as parameter
    // // navigation.navigate('EditUser', { user: selectedUser });
    // // or update the user directly in the state if it's managed here
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserSelect(item)}>
      <View style={styles.userItem}>
        <Text>{item.firstName} {item.lastName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Text style={styles.eventName}>{eventData.name}</Text>
        </TouchableOpacity>
        <FlatList
          data={users}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderUserItem}
        />
        <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightPanel}>
        {selectedUser && (
          <>
            <Text style={styles.userDetailsTitle}>User Details</Text>
            <Text>First Name: {selectedUser.firstName}</Text>
            <Text>Last Name: {selectedUser.lastName}</Text>
            <Text>Email: {selectedUser.email}</Text>
            <TouchableOpacity onPress={handleEditUser(selectedUser)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit User</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={newUser.firstName}
              onChangeText={(text) => setNewUser({...newUser, firstName: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={newUser.lastName}
              onChangeText={(text) => setNewUser({...newUser, lastName: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newUser.title}
              onChangeText={(text) => setNewUser({...newUser, title: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Organization"
              value={newUser.organization}
              onChangeText={(text) => setNewUser({...newUser, organization: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({...newUser, email: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newUser.phone}
              onChangeText={(text) => setNewUser({...newUser, phone: text})}
            />
            <View style={styles.switchContainer}>
              <Text>Marketing Opted In</Text>
              <Switch
                value={newUser.marketingOptedIn}
                onValueChange={(value) => setNewUser({...newUser, marketingOptedIn: value})}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <Button title="Add User" onPress={handleAddUser} />
              <Button title="Cancel" onPress={toggleModal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#80CBC4',
    padding: 20,
  },
  rightPanel: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  userItem: {
    backgroundColor: '#B2DFDB',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#FFCC80',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
  },
});
