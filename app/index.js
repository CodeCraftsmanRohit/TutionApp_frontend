// App.js
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { PostProvider } from '../context/PostContext';
import AppNavigator from '../navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <PostProvider>
        <AppNavigator />
      </PostProvider>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}
