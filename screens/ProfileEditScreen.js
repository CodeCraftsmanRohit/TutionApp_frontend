import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Input from '../components/Input';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function ProfileEditScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [bgPhotoUri, setBgPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/user/data');
      console.log('Profile data:', res.data);

      if (res.data.success) {
        setUserData(res.data.userData);
        setProfilePhotoUri(res.data.userData?.profilePhoto?.url || null);
        setBgPhotoUri(res.data.userData?.bgImage?.url || null);
        setName(res.data.userData?.name || '');
        setEmail(res.data.userData?.email || '');
        setPhone(res.data.userData?.phone || '');
      } else {
        Alert.alert('Error', res.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      Alert.alert('Error', 'Could not fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Updated image picker function
  const pickImage = async (setter) => {
    try {
      console.log('Requesting media library permissions...');

      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      console.log('Launching image picker...');

      // Use the correct ImagePicker options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correct property name
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      console.log('Image picker result:', result);

      // ✅ Handle the new result format (Expo ImagePicker v13+)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setter(selectedImage.uri);
        console.log('Image selected:', selectedImage.uri);
      } else {
        console.log('Image selection canceled');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const uploadImages = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Helper function to create form data for images
      const createFormDataEntry = (uri, fieldName, fileName) => {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        return {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: `${fileName}.${fileType}`,
          type: `image/${fileType}`,
        };
      };

      // Upload profile photo if changed and is a new local image
      if (profilePhotoUri && !profilePhotoUri.startsWith('http')) {
        formData.append('photo', createFormDataEntry(profilePhotoUri, 'photo', 'profile'));
        console.log('Adding profile photo to upload');
      }

      // Upload background image if changed and is a new local image
      if (bgPhotoUri && !bgPhotoUri.startsWith('http')) {
        formData.append('bgImage', createFormDataEntry(bgPhotoUri, 'bgImage', 'background'));
        console.log('Adding background image to upload');
      }

      // Check if there are any images to upload
      const formEntries = Array.from(formData._parts || []);
      console.log('Form data entries:', formEntries.length);

      if (formEntries.length > 0) {
        console.log('Uploading images...');
        const res = await API.put('/user/upload-images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload response:', res.data);

        if (res.data.success) {
          Alert.alert('Success', 'Images uploaded successfully');
          await fetchProfile(); // Refresh data
        } else {
          Alert.alert('Upload Failed', res.data.message || 'Upload failed');
        }
      } else {
        Alert.alert('No Changes', 'No new images selected to upload.');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      Alert.alert(
        'Upload Error',
        err.response?.data?.message || err.message || 'Something went wrong during upload'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfileInfo = async () => {
    if (!name.trim() || !email.trim()) {
      return Alert.alert('Validation Error', 'Name and email are required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Validation Error', 'Please enter a valid email address');
    }

    try {
      setLoading(true);
      console.log('Updating profile with:', { name, email, phone });

      const res = await API.put('/user/update', {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || ''
      });

      console.log('Update response:', res.data);

      if (res.data.success) {
        // Update AsyncStorage
        if (res.data.user?.email) {
          await AsyncStorage.setItem('userEmail', res.data.user.email);
        }

        Alert.alert('Success', 'Profile updated successfully');

        // Refresh profile data
        await fetchProfile();

        // Update context if needed
        if (setUser && res.data.user) {
          setUser(res.data.user);
        }
      } else {
        Alert.alert('Update Failed', res.data.message || 'Could not update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      Alert.alert(
        'Update Error',
        err.response?.data?.message || err.message || 'Could not update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhotoUri(null);
    console.log('Profile photo removal requested');
  };

  const removeBgPhoto = () => {
    setBgPhotoUri(null);
    console.log('Background photo removal requested');
  };

  if (loading && !userData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Edit Profile</Text>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Input
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <Input
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Background Image Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Image</Text>
        <View style={styles.previewBox}>
          {bgPhotoUri ? (
            <Image source={{ uri: bgPhotoUri }} style={styles.bgPreview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No background image</Text>
            </View>
          )}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => pickImage(setBgPhotoUri)}
          >
            <Text style={styles.buttonText}>Choose Background</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={removeBgPhoto}
          >
            <Text style={styles.secondaryButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <View style={styles.avatarContainer}>
          {profilePhotoUri ? (
            <Image source={{ uri: profilePhotoUri }} style={styles.avatarPreview} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.placeholderText}>No photo</Text>
            </View>
          )}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => pickImage(setProfilePhotoUri)}
          >
            <Text style={styles.buttonText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={removeProfilePhoto}
          >
            <Text style={styles.secondaryButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={updateProfileInfo}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Updating...' : 'Save Profile Info'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={uploadImages}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Uploading...' : 'Upload Images Only'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    height: 120,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  bgPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1976D2',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 14,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  uploadButton: {
    backgroundColor: '#1976D2',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButtonText: {
    color: '#495057',
    fontWeight: 'bold',
    fontSize: 16,
  },
});