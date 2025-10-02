// screens/AccountScreen.js
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import RatingStars from '../components/RatingStars';
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function AccountScreen({ navigation }) {
  const { setUser, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/user/data");
      if (res.data.success) {
        setProfile(res.data.userData);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert("Error", res.data.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Account fetch error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await API.post("/auth/logout");
            } catch (err) {
              console.warn("Logout API failed (ignoring):", err.message || err);
            } finally {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("role");
              await AsyncStorage.removeItem("userEmail");
              await AsyncStorage.removeItem("userName");
              await AsyncStorage.removeItem("userId");
              setUser(null);
            }
          },
        },
      ]
    );
  };

  const handleViewRatings = () => {
    if (profile) {
      navigation.navigate('UserRatings', {
        userId: profile._id,
        userName: profile.name
      });
    }
  };

  const handleViewFavorites = () => {
    navigation.navigate('Favorites');
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          {/* Optional settings button - uncomment if needed */}
          {/* <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Feather name="settings" size={22} color="#FFFFFF" />
          </TouchableOpacity> */}

          <View style={styles.avatarContainer}>
            {profile.profilePhoto?.url ? (
              <Image source={{ uri: profile.profilePhoto.url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Feather name="user" size={32} color="#667eea" />
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons
                name={profile.isAccountVerified ? "checkmark-circle" : "time"}
                size={20}
                color={profile.isAccountVerified ? "#10B981" : "#F59E0B"}
              />
            </View>
          </View>

          <Text style={styles.name}>{profile.name || "Unnamed User"}</Text>
          <Text style={styles.email}>{profile.email || "Not set"}</Text>

          {/* Rating Display */}
          {profile.averageRating > 0 && (
            <TouchableOpacity style={styles.ratingContainer} onPress={handleViewRatings}>
              <RatingStars rating={profile.averageRating} size={18} />
              <Text style={styles.ratingText}>
                {profile.averageRating.toFixed(1)} ({profile.ratingCount || 0} ratings)
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <AnimatedScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* (Optional) Statistics Cards - left commented for now */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]}>
              <Feather name="edit" size={20} color="#667eea" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Feather name="heart" size={20} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Feather name="message-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View> */}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}></Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewFavorites}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <MaterialIcons name="favorite" size={22} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>My Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewRatings}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <MaterialIcons name="star" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>My Ratings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Search')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <MaterialIcons name="search" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Feather name="help-circle" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="mail" size={18} color="#667eea" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profile.email || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="phone" size={18} color="#667eea" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{profile.phone || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="award" size={18} color="#667eea" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Role</Text>
                <Text style={styles.infoValue}>
                  {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name={profile.isAccountVerified ? "shield-checkmark" : "shield-outline"}
                  size={18}
                  color={profile.isAccountVerified ? "#10B981" : "#667eea"}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Verification Status</Text>
                <Text style={[
                  styles.infoValue,
                  { color: profile.isAccountVerified ? "#10B981" : "#F59E0B" }
                ]}>
                  {profile.isAccountVerified ? "Verified Account" : "Pending Verification"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Feather name="edit-2" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={logout}
          >
            <Feather name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#667eea",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  header: {
    height: height * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#667eea",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 30,
    transform: [{ scale: 1.03 }],
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 65,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 35,
    elevation: 25,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 25,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  name: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 0.8,
  },
  email: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 14,
    fontWeight: "600",
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    marginTop: -28,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 18,
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(30,30,50,0.85)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(30,30,50,0.9)',
    borderRadius: 34,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(25px)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(102,126,234,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  editButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
