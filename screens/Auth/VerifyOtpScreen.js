// screens/Auth/VerifyOtpScreen.js
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="6-digit OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={handleVerifyOtp} />
    </View>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', width: '100%', padding: 10, marginBottom: 20, borderRadius: 5 },
});
