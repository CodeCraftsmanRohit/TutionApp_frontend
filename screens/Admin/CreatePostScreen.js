// screens/Admin/CreatePostScreen.js
import { useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);

  // route.params: optional { mode: 'edit', post: {...} }
  const isEdit = route?.params?.mode === 'edit';
  const editPost = route?.params?.post || null;

  const [title, setTitle] = useState(editPost?.title || '');
  const [className, setClassName] = useState(editPost?.class || '');
  const [subject, setSubject] = useState(editPost?.subject || '');
  const [board, setBoard] = useState(editPost?.board || '');
  const [salary, setSalary] = useState(editPost?.salary ? String(editPost.salary) : '');
  const [time, setTime] = useState(editPost?.time || '');
  const [address, setAddress] = useState(editPost?.address || '');
  const [genderPreference, setGenderPreference] = useState(editPost?.genderPreference || 'any');
const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (!user) {
      Alert.alert('Forbidden', 'Please login to create or edit posts');
      navigation.getParent()?.navigate('MainTabs', { screen: 'Home' });
    }
  }, [user]);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) setImageUri(result.uri);
  };

   const createPost = async () => {
    if (!title || !className || !subject || !board || !salary || !time || !address) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    // validate numeric salary (avoid "Nn" cast error): ensure it's numeric
    if (isNaN(Number(salary))) return Alert.alert('Error', 'Salary must be a number');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('class', className);
    formData.append('subject', subject);
    formData.append('board', board);
    formData.append('salary', String(salary));
    formData.append('time', time);
    formData.append('address', address);
    formData.append('genderPreference', genderPreference);

    if (imageUri) {
      const uriParts = imageUri.split('.');
      const fileExt = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: `post.${fileExt}`,
        type: `image/${fileExt === 'heic' ? 'jpeg' : fileExt}`,
      });
    }

    try {
      const { data } = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        Alert.alert('Success', 'Post created');
        navigation.goBack();
      } else {
        Alert.alert('Failed', data.message || 'Could not create post');
      }
    } catch (err) {
      console.error('Create post error:', err.message);
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  const createOrUpdatePost = async () => {
    if (!title || !className || !subject || !board || salary === '' || !time || !address) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    const salaryNum = Number(salary);
    if (!Number.isFinite(salaryNum)) {
      return Alert.alert('Error', 'Salary must be a valid number');
    }

    try {
      if (isEdit && editPost) {
        // PUT /posts/:id
        const { data } = await API.put(`/posts/${editPost._id}`, {
          title,
          class: className,
          subject,
          board,
          salary: salaryNum,
          time,
          address,
          genderPreference,
        });
        if (data.success) {
          Alert.alert('Updated', 'Post updated successfully');
          navigation.goBack();
        } else {
          Alert.alert('Failed', data.message || 'Could not update post');
        }
      } else {
        // POST /posts
        const { data } = await API.post('/posts', {
          title,
          class: className,
          subject,
          board,
          salary: salaryNum,
          time,
          address,
          genderPreference,
        });
        if (data.success) {
          Alert.alert('Success', 'Post created and notifications sent');
          navigation.goBack();
        } else {
          Alert.alert('Failed', data.message || 'Could not create post');
        }
      }
    } catch (err) {
      console.error('Create/Update post error:', err.response || err.message || err);
      Alert.alert('Error', (err.response && err.response.data && err.response.data.message) || err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isEdit ? 'Edit Tuition Post' : 'Create Tuition Post'}</Text>
      <Input placeholder="Title" value={title} onChangeText={setTitle} />
      <Input placeholder="Class (e.g. 10th)" value={className} onChangeText={setClassName} />
      <Input placeholder="Subject" value={subject} onChangeText={setSubject} />
      <Input placeholder="Board" value={board} onChangeText={setBoard} />
      <Input placeholder="Salary (number)" value={String(salary)} onChangeText={setSalary} keyboardType="numeric" />
      <Input placeholder="Time (e.g. 6pm - 8pm)" value={time} onChangeText={setTime} />
      <Input placeholder="Address" value={address} onChangeText={setAddress} />
      <Input placeholder="Gender preference (male/female/any)" value={genderPreference} onChangeText={setGenderPreference} />
       <TouchableOpacity onPress={pickImage} style={{ marginVertical: 8 }}>
        <Text>Select Post Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 120, height: 80 }} />}

      <Button title={isEdit ? 'Update Post' : 'Create Post'} onPress={createOrUpdatePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
