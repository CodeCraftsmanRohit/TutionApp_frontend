// screens/AboutScreen.js
import { Feather } from '@expo/vector-icons';
import { Image, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>About This App</Text>
        <Text style={styles.subtitle}>
          This app is designed to provide the best user experience and seamless social interactions.
        </Text>
      </View>

      {/* Founders Section */}
      <View style={styles.foundersSection}>
        <Text style={styles.sectionTitle}>Meet the Team</Text>

        <View style={styles.founderCard}>
          <Image
            // source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <View style={styles.founderInfo}>
            <Text style={styles.founderName}>Rohit Kumar</Text>
            <Text style={styles.founderRole}>Co-Founder</Text>
          </View>
          <Feather name="user-check" size={24} color="#10B981" style={styles.badgeIcon} />
        </View>

        <View style={styles.founderCard}>
          <Image
            // source={{ uri: 'https://i.pravatar.cc/150?img=32' }}
            style={styles.avatar}
          />
          <View style={styles.founderInfo}>
            <Text style={styles.founderName}>Rahul Shekhar</Text>
            <Text style={styles.founderRole}>Founder</Text>
            <Text style={styles.founderEmail}>rahulkumarshekharkumar@gmail.com</Text>
          </View>
          <Feather name="user-check" size={24} color="#10B981" style={styles.badgeIcon} />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <Text style={styles.sectionText}>
          Version: 1.0.0{"\n"}
          Developed using React Native and Expo{"\n"}
          Designed for seamless user experience with a modern UI
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
  },
  header: {
    backgroundColor: "#667eea",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    textAlign: "center",
  },
  foundersSection: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 18,
  },
  founderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,30,50,0.9)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#667eea",
    marginRight: 16,
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  founderRole: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "600",
  },
  founderEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  badgeIcon: {
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    lineHeight: 22,
  },
});
