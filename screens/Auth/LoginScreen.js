// screens/Auth/LoginScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useState } from 'react';
import { Alert, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const { setUser } = useContext(AuthContext);

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const login = async () => {
    if (!email || !password) {
      showAlert('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoggingIn(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('role', data.user?.role || 'teacher');
        await AsyncStorage.setItem('userEmail', data.user.email);
        await AsyncStorage.setItem('userName', data.user.name);
        await AsyncStorage.setItem('userId', data.user.id);
        setUser({
          token: data.token,
          role: data.user?.role,
          email: data.user.email,
          name: data.user.name,
          userId: data.user.id
        });
        showAlert('Success', 'Welcome back! Login successful.');
      } else {
        showAlert('Login Failed', data.message);
      }
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Login</Text>

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            style={styles.input}
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#64748B"
          />

          <Button
            title={loggingIn ? "Logging In..." : "Login"}
            onPress={login}
            loading={loggingIn}
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />

          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Register</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ResetPassword')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    paddingTop: height * 0.1,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#2d3748',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    includeFontPadding: true,
    textAlignVertical: 'center',
  },
  loginButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linksContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '500',
  },
  linkHighlight: {
    color: '#667eea',
    fontWeight: '600',
  },
});