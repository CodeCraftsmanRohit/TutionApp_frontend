import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import API from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
const [phone, setPhone] = useState('');
  const register = async () => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role,phone });
      if (data.success) {
        Alert.alert('Success', data.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Failed', data.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Register</Text>
      <Input value={name} onChangeText={setName} placeholder="Name" />
      <Input value={email} onChangeText={setEmail} placeholder="Email" />

<Input
  placeholder="Phone Number"
  keyboardType="phone-pad"
  value={phone}
  onChangeText={setPhone}
/>

      <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Register" onPress={register} />
      <Text onPress={() => navigation.goBack()} style={{ marginTop: 10, color: 'blue' }}>
        Already have an account? Login
      </Text>
    </View>
  );
}
