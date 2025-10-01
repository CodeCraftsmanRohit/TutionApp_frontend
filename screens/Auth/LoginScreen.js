// screens/Auth/LoginScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api'; // if your path is ../services/api keep that

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  const login = async () => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('role', data.user?.role || 'teacher');
        await AsyncStorage.setItem('userEmail', data.user.email);
         await AsyncStorage.setItem('userName', data.user.name);
      await AsyncStorage.setItem('userId', data.user.id);
        setUser({ token: data.token, role: data.user?.role ,email: data.user.email,
        name: data.user.name,
        userId: data.user.id});
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <Input value={email} onChangeText={setEmail} placeholder="Email" />
      <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={login} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  link: { marginTop: 10, color: 'blue' },
});
