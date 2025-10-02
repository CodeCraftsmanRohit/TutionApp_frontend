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

// New screens for features
import AboutScreen from '../screens/AboutScreen';
import FavoritesScreen from "../screens/FavoritesScreen";
import SearchScreen from "../screens/SearchScreen";
import UserRatingsScreen from "../screens/UserRatingsScreen";
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
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "Home")
            return <MaterialIcons name="home" size={size} color={color} />;
          if (route.name === "Favorites")
            return <MaterialIcons name="favorite" size={size} color={color} />;
          if (route.name === "Search")
            return <MaterialIcons name="search" size={size} color={color} />;
          if (route.name === "Notifications")
            return <Ionicons name="notifications" size={size} color={color} />;
          if (route.name === "Account")
            return <MaterialIcons name="person" size={size} color={color} />;
          if (route.name === "Admin")
            return <MaterialIcons name="admin-panel-settings" size={size} color={color} />;
          return null;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
       // inside Tabs() -> screenOptions:
tabBarStyle: {
  position: 'absolute',
  left: 12,
  right: 12,
  bottom: 0,         // move up a bit from the absolute bottom
  height: 85,
  borderRadius: 14,
  paddingBottom: 8,
  paddingTop: 8,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 0,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 8,
},

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      {user?.role === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{ title: 'Admin' }}
        />
      )}
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Profile' }}
      />
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
      {/* New Feature Screens */}
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: true, title: "My Favorites" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserRatings"
        component={UserRatingsScreen}
        options={{ headerShown: true, title: "Ratings" }}
      />
      <Stack.Screen
  name="About"
  component={AboutScreen}
  options={{
    headerShown: true,
    title: "About",
    headerStyle: { backgroundColor: '#667eea' },
    headerTintColor: '#FFFFFF',
  }}
/>

    </Stack.Navigator>
  );
}