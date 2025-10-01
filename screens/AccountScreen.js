// screens/AccountScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function AccountScreen({ navigation }) {
  const { setUser,user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/user/data");
      if (res.data.success) {
        setProfile(res.data.userData);
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

  // Logout handler remains the same...

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // Logout handler
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.warn("Logout API failed (ignoring):", err.message || err);
    } finally {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("userEmail");
      setUser(null); // this will trigger AppNavigator to show AuthStack
    }
  };

  // Show loader while fetching
  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // Render profile details
  return (
    <View style={styles.container}>
      {profile.profilePhoto?.url ? (
        <Image source={{ uri: profile.profilePhoto.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text>No photo</Text>
        </View>
      )}

      <Text style={styles.name}>{profile.name || "Unnamed User"}</Text>
      <Text style={styles.info}>Email: {profile.email || "Not set"}</Text>
      <Text style={styles.info}>Role: {profile.role || "Not assigned"}</Text>
      <Text style={styles.info}>Phone: {profile.phone || "Not provided"}</Text>
      <Text style={styles.info}>
        Verified: {profile.isAccountVerified ? "Yes" : "No"}
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("ProfileEdit")}
      >
        <Text style={styles.btnText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#d9534f", marginTop: 12 }]}
        onPress={logout}
      >
        <Text style={styles.btnText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  info: { fontSize: 14, marginBottom: 6 },
  btn: {
    marginTop: 18,
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
