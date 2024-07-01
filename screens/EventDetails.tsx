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
import { useEffect, useState } from 'react';


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
  const [users, setUsers] = useState<User[]>(eventData.users || []);
  const [token, setToken] = useState<string>('');
  const [newUser, setNewUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
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
    setFilteredUsers(users);
  }, [users]);

  const onSaveuser = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage(isEditing ? 'Updating User...' : 'Adding User...');
      if (!newUser.firstName || !newUser.lastName || !newUser.email) {
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
      if (response && response.success === true) {
        if (isEditing && newUser) {
          const updatedUsers = users.map(user => user.user_id === newUser.user_id ? newUser : user);
          setFilteredUsers(updatedUsers);
          mydb.updateUser(newUser);
          console.log("Updated Users:", updatedUsers);
        } else {
          await handleAddUserResponse(response)
        }
        setIsEditing(false);
        setIsAdding(false)
        setNewUser(null)
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

  const handleAddUserResponse = async (response) => {
    try {
      const id = response.result[0]?.id;
      const status = response.result[0]?.status;

      if (id && status) {
        console.log("userId", id);
        const updatedUser = { ...newUser, user_id: id };
        const saveToDBSuccess = await mydb.createUser(updatedUser, eventData.id);
        if (!saveToDBSuccess) {
          throw new Error("Failed to save user to the database.");
        }

        setFilteredUsers([...filteredUsers, updatedUser]);
        setUsers(prevUsers => [...prevUsers, updatedUser]);

      } else {
        throw new Error("No ID found in the response.");
      }
    } catch (error) {
      console.error("Error processing user:", error);
    }
  }
  const handleCheckInOut = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Checking In User...');

      if (newUser) {
        console.log("Selected User: ", newUser);
        const response = await changeUserStatus(newUser.user_id, eventData.id, "Attended", token);
        console.log("Change User Status Response: ", response);
        if (response == true) {
          setNewUser({ ...newUser, progressionStatus: "Attended" });
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
    setIsEditing(true);
    setIsAdding(false)
  };
  const onUserClicked = (user) => {
    console.log("user clicked  : ", user.firstName + user.lastName + " pState ", user.progressionStatus)
    setIsEditing(false)
    setIsAdding(false)
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

  }

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
    setIsAdding(true)
  };
  const handlePhoneChange = (text) => {
    const phoneNumber = text.replace(/[^0-9]/g, '').slice(0, 10);
    setNewUser({ ...newUser, phone: phoneNumber });
  };

  const groupUsersAlphabetically = () => {
    const groupedUsers: { [key: string]: User[] } = {};
    filteredUsers.forEach((user) => {
      const firstLetter = user.firstName.charAt(0).toUpperCase();
      if (!groupedUsers[firstLetter]) {
        groupedUsers[firstLetter] = [];
      }
      groupedUsers[firstLetter].push(user);
    });
    const sortedKeys = Object.keys(groupedUsers).sort();

    return sortedKeys.map((key) => ({
      letter: key,
      data: groupedUsers[key],
    }));
  };
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

        <FlatList
          data={groupUsersAlphabetically()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <>
              <Text style={styles.sectionHeader}>{item.letter}</Text>
              {item.data.map((user) => (
                <TouchableOpacity key={user.user_id} onPress={() => onUserClicked(user)}>
                  <View style={[styles.userItem, newUser != null && user.user_id === newUser.user_id && { backgroundColor: '#a3dbd6' }]} >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{user.firstName} {user.lastName}</Text>
                        <Text style={{ fontSize: 13 }}>{user.company}</Text>
                      </View>
                      {user.progressionStatus === 'Attended' && (
                        <Ionicons name='checkmark' style={styles.itemIconStyle} />
                      )}
                    </View>
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
        {newUser && (
          <View style={styles.userDetailsContainer}>
            <View style={styles.userDetailRow}>
              <Text style={styles.userDetailsTitle}>{isAdding ? "Add Atendee" : isEditing ? 'Edit Atendee' : 'Atendee Details'}</Text>
              {isEditing || isAdding ? null : (
                <Ionicons style={styles.editIconStyle} name="pencil" onPress={() => handleEditUser(newUser)}></Ionicons>
              )}
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>First Name:</Text>
              <TextInput
                style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}
                placeholder="First Name"
                value={newUser.firstName}
                editable={isEditing || isAdding}
                onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
              />
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Last Name:</Text>
              <TextInput
                style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}
                placeholder="Last Name"
                value={newUser.lastName}
                editable={isEditing || isAdding}
                onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
              />
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}
                placeholder="Email"
                value={newUser.email}
                editable={isEditing || isAdding}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              />
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Company:</Text>
              <TextInput
                style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}
                placeholder="Organization"
                value={newUser.company}
                editable={isEditing || isAdding}
                onChangeText={(text) => setNewUser({ ...newUser, company: text })}
              />
            </View>
            <View style={styles.userDetailRow}>
              <Text style={styles.label}>Phone:</Text>
              <TextInput
                style={[styles.input, !isEditing && !isAdding && styles.disabledInput]}
                placeholder="Phone"
                value={newUser.phone}
                onChangeText={handlePhoneChange}
                maxLength={10}
                editable={isEditing || isAdding}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.switchContainer}>
              <Text>Marketing Opted In</Text>
              <Switch
                value={newUser.unsubscribed === 0}
                onValueChange={(value) => setNewUser({ ...newUser, unsubscribed: value ? 0 : 1 })}
                disabled={!isEditing && !isAdding}
              />
            </View>
            {isEditing || isAdding ? (
              <TouchableOpacity onPress={() => onSaveuser()} style={styles.editButton}>
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              newUser.progressionStatus !== 'Attended' ? (
                <TouchableOpacity onPress={handleCheckInOut} style={styles.checkInOutButton}>
                  <Text style={styles.checkInOutButtonText}>Check In</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.checkedInMessage}>Checked In</Text>
              )
            )}
          </View>
        )}

      </View>
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
    alignItems: 'center',
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingEnd: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginRight: 10,
    color: 'white',
    marginBottom: 20,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  userItem: {
    color: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.4
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
    width: '70%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  userDetailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 10,
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
    borderRadius: 10,
    backgroundColor: '#dbf0ee',
  },
  sectionHeader: {
    backgroundColor: '#5cbcb3',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
  editIconStyle: {
    transform: [{ scale: 1.5 }],
    backgroundColor: "grey",
    padding: 10,
    color: 'white',
    marginStart: 20,
    borderRadius: 5,
    height: 35
  },
  itemIconStyle: {
    transform: [{ scale: 1.5 }],
  }
});

export default EventDetails;
