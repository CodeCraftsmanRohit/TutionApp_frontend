import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import API from '../../services/api';

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const sendOtp = async () => {
    try {
      const { data } = await API.post('/auth/send-reset-otp', { email });
      if (data.success) Alert.alert('Success', data.message);
      else Alert.alert('Failed', data.message);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const resetPassword = async () => {
    try {
      const { data } = await API.post('/auth/reset-password', { email, otp, newPassword });
      if (data.success) Alert.alert('Success', data.message, [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
      else Alert.alert('Failed', data.message);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Reset Password</Text>
      <Input value={email} onChangeText={setEmail} placeholder="Email" />
      <Button title="Send OTP" onPress={sendOtp} />
      <Input value={otp} onChangeText={setOtp} placeholder="OTP" />
      <Input value={newPassword} onChangeText={setNewPassword} placeholder="New Password" secureTextEntry />
      <Button title="Reset Password" onPress={resetPassword} />
    </View>
  );
}
