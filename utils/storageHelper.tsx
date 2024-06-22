import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageHelper {
  static async saveItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save item to storage', error);
    }
  }

  static async getItem(key: string): Promise<any | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get item from storage', error);
    }
    return null;
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage', error);
    }
  }

  static async isTokenValid(): Promise<boolean> {
    try {
      const token = await StorageHelper.getItem('token');
      const expiryTime = await StorageHelper.getItem('expiryTime');
      if (token && expiryTime) {
        const currentTime = Date.now();
        return currentTime < parseInt(expiryTime, 10);
      }
      return false;
    } catch (error) {
      console.error('Error checking token validity', error);
      return false;
    }
  }
}

export default StorageHelper;
