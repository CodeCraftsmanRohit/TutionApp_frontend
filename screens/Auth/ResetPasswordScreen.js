// screens/Auth/ResetPasswordScreen.js
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import API from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const sendOtp = async () => {
    if (!email) {
      showAlert('Validation Error', 'Please enter your email address');
      return;
    }

    setSendingOtp(true);
    try {
      const { data } = await API.post('/auth/send-reset-otp', { email });
      if (data.success) {
        setIsOtpSent(true);
        showAlert('Success', 'Verification code sent to your email!');
      } else {
        showAlert('Failed', data.message);
      }
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) {
      showAlert('Validation Error', 'Please enter both OTP and new password');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    setResettingPassword(true);
    try {
      const { data } = await API.post('/auth/reset-password', { email, otp, newPassword });
      if (data.success) {
        showAlert('Success', 'Password reset successfully! You can now login with your new password.');
        navigation.navigate('Login');
      } else {
        showAlert('Failed', data.message);
      }
    } catch (err) {
      showAlert('Error', err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {isOtpSent
            ? 'Enter OTP and new password'
            : 'Enter your email to receive OTP'
          }
        </Text>
      </View>

      {/* Form Container */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, styles.progressActive]}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Email</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, isOtpSent && styles.progressActive]}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Verify</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Reset</Text>
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              style={styles.input}
              placeholderTextColor="#64748B"
              editable={!isOtpSent && !sendingOtp}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Send OTP Button */}
          {!isOtpSent && (
            <Button
              title={sendingOtp ? "Sending Code..." : "Send Verification Code"}
              onPress={sendOtp}
              loading={sendingOtp}
              style={styles.otpButton}
              textStyle={styles.otpButtonText}
            />
          )}

          {/* OTP and New Password Fields */}
          {isOtpSent && (
            <View style={styles.verificationSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <Input
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  style={styles.input}
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <Input
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Create new password"
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Reset Password Button */}
              <Button
                title={resettingPassword ? "Resetting Password..." : "Reset Password"}
                onPress={resetPassword}
                loading={resettingPassword}
                style={styles.resetButton}
                textStyle={styles.resetButtonText}
              />

              {/* Resend OTP Option */}
              <TouchableOpacity
                style={styles.resendContainer}
                onPress={sendOtp}
                disabled={sendingOtp}
              >
                <Text style={[styles.resendText, sendingOtp && styles.resendTextDisabled]}>
                  Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    height: height * 0.35,
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
    paddingTop: height * 0.08,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  title: {
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
  },
  scrollContent: {
    paddingBottom: 30,
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
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressActive: {
    opacity: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#a0aec0',
    fontWeight: '500',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
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
  otpButton: {
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
  otpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationSection: {
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#48bb78',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#48bb78',
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
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '500',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  resendLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 25,
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
});