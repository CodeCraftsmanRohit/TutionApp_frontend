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
    const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

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
     setUploadingImages(true);
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
showAlert('Success', 'Images uploaded successfully!');
          await fetchProfile(); // Refresh data
        } else {
showAlert('Upload Failed', res.data.message);        }
      } else {
showAlert('Info', 'No new images selected to upload.');      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      showAlert('Error', err.response?.data?.message || err.message || 'Upload failed');
    } finally {
    setUploadingImages(false);
    }
  };

  const updateProfileInfo = async () => {
    if (!name.trim() || !email.trim()) {
      showAlert('Validation Error', 'Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await API.put('/user/update', {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || ''
      });

      if (res.data.success) {
        if (res.data.user?.email) {
          await AsyncStorage.setItem('userEmail', res.data.user.email);
        }
        showAlert('Success', 'Profile updated successfully!');
        await fetchProfile();
        if (setUser && res.data.user) {
          setUser(res.data.user);
        }
      } else {
        showAlert('Update Failed', res.data.message);
      }
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message || 'Could not update profile');
    } finally {
      setUpdatingProfile(false);
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
    backgroundColor: '#F4F8FF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F8FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#51607A',
    fontWeight: '700',
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 24,
    textAlign: 'center',
    color: '#08122A',
  },
  section: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#4F5D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    color: '#0F2340',
    letterSpacing: 0.2,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#F1F6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#08122A',
  },
  previewBox: {
    borderRadius: 12,
    height: 140,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#1976D2',
    backgroundColor: '#F1F6FF',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9F1FF',
    borderWidth: 2,
    borderColor: '#7CC7FF',
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7CC7FF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 14,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4F5D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 4,
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
    borderColor: '#7CC7FF',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  backButtonText: {
    color: '#1976D2',
    fontWeight: '900',
    fontSize: 16,
  },
});
