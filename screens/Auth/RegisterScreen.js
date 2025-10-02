// screens/Auth/RegisterScreen.js
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import API from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [phone, setPhone] = useState('');
  const [registering, setRegistering] = useState(false);

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const register = async () => {
    if (!name || !email || !password) {
      showAlert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 3) {
      showAlert('Validation Error', 'Password must be at least 3 characters long');
      return;
    }

    setRegistering(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role, phone });
      if (data.success) {
        showAlert('Success', 'Account created successfully! Please login to continue.');
        navigation.navigate('Login');
      } else {
        showAlert('Registration Failed', data.message);
      }
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us today and get started</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Full Name *"
                style={styles.input}
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address *"
                style={styles.input}
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Password *"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={registering ? "Creating Account..." : "Create Account"}
                onPress={register}
                loading={registering}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.goBack()}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    includeFontPadding: true,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  loginLink: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 15,
  },
});