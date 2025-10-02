// screens/Auth/VerifyOtpScreen.js
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import API from '../../services/api'; // <-- use API

const VerifyOtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Error", "Please enter OTP");
    try {
      const res = await API.post('/auth/verify-account', { otp }); // interceptor will set Authorization
      if (res.data.success) {
        Alert.alert("Success", res.data.message);
        navigation.navigate('Profile');
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (error) {
      console.error("Verify OTP Error:", error.message);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await API.post('/auth/resend-otp');
      if (res.data.success) {
        Alert.alert("Success", "New OTP sent to your email");
      } else {
        Alert.alert("Error", "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>
            <Text style={styles.title}>Verify Your Account</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit verification code sent to your email
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
                maxLength={6}
                autoFocus={true}
              />
            </View>

            {/* Verify Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Verify Account"
                onPress={handleVerifyOtp}
                style={[styles.button, !otp && styles.buttonDisabled]}
                textStyle={styles.buttonText}
                disabled={!otp}
              />
            </View>

            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text style={styles.resendLink} onPress={handleResendOtp}>
                  Resend OTP
                </Text>
              </Text>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Check your spam folder if you don't see the email
              </Text>
            </View>
          </View>

          {/* Back Option */}
          <View style={styles.footer}>
            <Text
              style={styles.backLink}
              onPress={() => navigation.goBack()}
            >
              ← Back to Login
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonContainer: {
    marginBottom: 16,
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
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#6B7280',
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  resendLink: {
    color: '#6366F1',
    fontWeight: '700',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backLink: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 16,
  },
});