// navigation/AppNavigator.js
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import VerifyOtpScreen from "../screens/Auth/VerifyOtpScreen";

import AccountScreen from "../screens/AccountScreen";
import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import CreatePostScreen from "../screens/Admin/CreatePostScreen";
import UserActivityScreen from "../screens/Admin/UserActivityScreen";
import CommentsScreen from "../screens/CommentsScreen";
import HomeScreen from "../screens/HomeScreen";
import NotificationsScreen from "../screens/NotificationScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home")
            return <MaterialIcons name="home" size={size} color={color} />;
          if (route.name === "Account")
            return <MaterialIcons name="person" size={size} color={color} />;
          if (route.name === "Notifications")
            return <Ionicons name="notifications" size={size} color={color} />;
          if (route.name === "Admin")
            return <MaterialIcons name="admin-panel-settings" size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      {user?.role === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{ title: 'Admin Dashboard' }}
        />
      )}
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  if (!user) return <AuthStack />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={Tabs} />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ headerShown: true, title: "Create Post" }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ headerShown: true, title: "Comments" }}
      />
      <Stack.Screen
        name="UserActivity"
        component={UserActivityScreen}
        options={{ headerShown: true, title: "User Activity" }}
      />
    </Stack.Navigator>
  );
}