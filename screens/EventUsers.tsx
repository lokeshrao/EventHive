import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  Switch,
  ActivityIndicator
} from 'react-native';
import { createOrUpdateUser } from '../utils/addEditUserApi';
import StorageHelper from '../utils/storageHelper';
import { changeUserStatus } from '../utils/mapToEvent';
import mydb from '../database/mydb';
import { Ionicons } from '@expo/vector-icons';


interface Props {
  route: {
    params: {
      eventData: {
        name: string;
        id: number;
        users: {
          user_id: number;
          firstName: string;
          lastName: string;
          email: string;
          company: string;
          phone: string;
          unsubscribed: number;
          progressionStatus: string;
        }[];
        workspace: string;
      };
    };
  };
  navigation: any; // Adjust the type according to your navigation prop type
}

interface User {
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  unsubscribed: number;
  progressionStatus: string;
}

const EventDetails: React.FC<Props> = ({ route, navigation }) => {
  const { eventData } = route.params;
  const users: User[] = eventData.users;
  const [token, setToken] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<User>({
    user_id: 0,
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    unsubscribed: 0,
    progressionStatus: ""
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await StorageHelper.getItem('token');
        console.log("token: ", storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to retrieve token:', error);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    // Initial load or when users change
    setFilteredUsers(users);
  }, [users]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleAddUser = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage(isEditing ? 'Updating User...' : 'Adding User...');
      if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phone) {
        alert('Please fill in all required fields.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        alert('Please enter a valid email address.');
        return;
      }
      const response = await createOrUpdateUser(newUser, token, eventData.workspace);
      console.log(response);
      if (response && response.success) {
        if (isEditing && selectedUser) {
          const updatedUsers = users.map(user => user.user_id === selectedUser.user_id ? newUser : user);
          setFilteredUsers(updatedUsers);
          setSelectedUser(newUser);
          mydb.updateUser(newUser);
          console.log("Updated Users:", updatedUsers);
        } else {
          const id = response.result[0]?.id;
          if (id) {
            console.log("userId", id);
            const isSuccess = await changeUserStatus(id, eventData.id, "Registered", token);
            if (isSuccess) {
              setFilteredUsers([...filteredUsers, newUser]);
            }
          }
        }

        setNewUser({
          user_id: 0,
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          phone: '',
          unsubscribed: 0,
          progressionStatus: "Registered"
        });
        setIsEditing(false);
        toggleModal();
      } else {
        console.log("Error", "Failed to add or update the user. Please try again.");
      }
    } catch (error) {
      console.error('Failed to add or update user:', error);
      console.log("Error", "Failed to add or update the user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInOut = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Checking In User...');

      if (selectedUser) {
        console.log("Selected User: ", selectedUser);
        const response = await changeUserStatus(selectedUser.user_id, eventData.id, "Attended", token);
        console.log("Change User Status Response: ", response);
        if (response == true) {
          setSelectedUser({ ...selectedUser, progressionStatus: "Attended" });
        }
      } else {
        console.log("No selected user.");
      }
    } catch (error) {
      console.error('Failed to check in user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setNewUser({
      user_id: user.user_id,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      email: user.email,
      phone: user.phone,
      unsubscribed: user.unsubscribed,
      progressionStatus: user.progressionStatus,
    });
    setIsEditing(true);
    toggleModal();
  };

  const addUserClicked = () => {
    setNewUser({
      user_id: 0,
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      unsubscribed: 0,
      progressionStatus: "Registered"
    });
    setIsEditing(false);
    toggleModal();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => setSelectedUser(item)}>
      <View style={styles.userItem}>
        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.firstName} {item.lastName}</Text>
        <Text style={{ fontSize: 13 }}>{item.company}</Text>
      </View>
    </TouchableOpacity>
  );

  // Function to group users alphabetically
  const groupUsersAlphabetically = () => {
    const groupedUsers: { [key: string]: User[] } = {};

    filteredUsers.forEach((user) => {
      const firstLetter = user.firstName.charAt(0).toUpperCase();
      if (!groupedUsers[firstLetter]) {
        groupedUsers[firstLetter] = [];
      }
      groupedUsers[firstLetter].push(user);
    });

    // Sort the keys (initial letters) alphabetically
    const sortedKeys = Object.keys(groupedUsers).sort();

    return sortedKeys.map((key) => ({
      letter: key,
      data: groupedUsers[key],
    }));
  };

  // Function to filter users based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
      <Ionicons name="arrow-back-sharp" size={20} color="#000" style={styles.icon} />
      <Text style={styles.eventName}>{eventData.name}</Text>
    </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search user"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* Grouped User List */}
        <FlatList
          data={groupUsersAlphabetically()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <>
              <Text style={styles.sectionHeader}>{item.letter}</Text>
              {item.data.map((user) => (
                <TouchableOpacity key={user.user_id} onPress={() => setSelectedUser(user)}>
                  <View style={styles.userItem}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{user.firstName} {user.lastName}</Text>
                    <Text style={{ fontSize: 13 }}>{user.company}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        />

        <TouchableOpacity onPress={addUserClicked} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightPanel}>
        {selectedUser && (
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userDetailsTitle}>User Details</Text>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>First Name:</Text>
              <Text style={styles.value}>{selectedUser.firstName}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Last Name:</Text>
              <Text style={styles.value}>{selectedUser.lastName}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{selectedUser.email}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{selectedUser.company}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{selectedUser.phone}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Marketing Opted In:</Text>
              <Switch
                value={selectedUser.unsubscribed === 0} // Inverted logic because 'unsubscribed' seems to represent opt-in status
                disabled={true}
              />
            </View>
            <TouchableOpacity onPress={() => handleEditUser(selectedUser)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit User</Text>
            </TouchableOpacity>
            {selectedUser.progressionStatus !== 'Attended' ? (
              <TouchableOpacity onPress={handleCheckInOut} style={styles.checkInOutButton}>
                <Text style={styles.checkInOutButtonText}>Check In</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.checkedInMessage}>Checked In</Text>
            )}
          </View>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit User' : 'Add New User'}</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={newUser.firstName}
              onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={newUser.lastName}
              onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Organization"
              value={newUser.company}
              onChangeText={(text) => setNewUser({ ...newUser, company: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newUser.phone}
              onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
            />
            <View style={styles.switchContainer}>
              <Text>Marketing Opted In</Text>
              <Switch
                value={newUser.unsubscribed === 0} // Inverted logic because 'unsubscribed' seems to represent opt-in status
                onValueChange={(value) => setNewUser({ ...newUser, unsubscribed: value ? 0 : 1 })}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <Button title={isEditing ? 'Update User' : 'Add User'} onPress={handleAddUser} />
              <Button title="Cancel" onPress={toggleModal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Loader */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingDialog}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loaderMessage}>{loadingMessage}</Text>
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
  leftPanel: {
    flex: 1,
    backgroundColor: '#80CBC4',
    padding: 20,
  },
  rightPanel: {
    flex: 1.7,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingEnd: 10,
    paddingVertical:10,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    color:'white',
    marginBottom: 20,
  },
  eventName: {
    fontSize: 18,
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
    backgroundColor: '#ffb84d',
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
    marginTop: 20,
  },

  userDetailsContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 10,
    marginTop:-200,
    width: '100%',
  },
  userDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userDetailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
    width: 130, 
  },
  value: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  checkInOutButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  checkInOutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  checkedInMessage: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
  },

  // Loader styles
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderMessage: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  loadingDialog: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },

  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 0,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius:10,
    backgroundColor: '#dbf0ee',
  },
  sectionHeader: {
    backgroundColor: '#5cbcb3',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
});

export default EventDetails;
