// screens/Admin/AdminDashboardScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats')
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (statsRes.data.success) {
        setPlatformStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'admin') {
        fetchDashboardData();
      }
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserActivity', { userId: user._id });
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This will also delete all their posts and data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await API.delete(`/admin/users/${userId}`);
              if (res.data.success) {
                Alert.alert('Success', 'User deleted successfully');
                fetchDashboardData();
              } else {
                Alert.alert('Error', res.data.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Delete user error:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userHeader}>
        {item.profilePhoto?.url ? (
          <Image source={{ uri: item.profilePhoto.url }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={20} color="#666" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userRole}>{item.role} • Joined {new Date(item.joinedAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.statText}>{item.stats?.totalPosts || 0} posts</Text>
          <Text style={styles.statText}>{item.stats?.totalLikes || 0} likes</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.activityTitle}>Recent Activity:</Text>
        {item.recentPosts && item.recentPosts.length > 0 ? (
          item.recentPosts.slice(0, 2).map((post, index) => (
            <Text key={index} style={styles.activityText} numberOfLines={1}>
              • {post.title}
            </Text>
          ))
        ) : (
          <Text style={styles.noActivity}>No recent posts</Text>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.stats?.recentPosts || 0}</Text>
          <Text style={styles.statLabel}>Posts (7d)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.stats?.recentLikes || 0}</Text>
          <Text style={styles.statLabel}>Likes (7d)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.stats?.recentComments || 0}</Text>
          <Text style={styles.statLabel}>Comments (7d)</Text>
        </View>
      </View>

      {/* Admin Actions */}
      <View style={styles.adminActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUserPress(item)}
        >
          <MaterialIcons name="visibility" size={18} color="#3498db" />
          <Text style={styles.actionText}>View Activity</Text>
        </TouchableOpacity>

        {item.role !== 'admin' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item._id, item.name)}
          >
            <MaterialIcons name="delete" size={18} color="#e74c3c" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !platformStats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Platform Stats */}
      {platformStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={24} color="#3498db" />
              <Text style={styles.statCardNumber}>{platformStats.users.total}</Text>
              <Text style={styles.statCardLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="post-add" size={24} color="#27ae60" />
              <Text style={styles.statCardNumber}>{platformStats.content.posts}</Text>
              <Text style={styles.statCardLabel}>Total Posts</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="favorite" size={24} color="#e74c3c" />
              <Text style={styles.statCardNumber}>{platformStats.content.likes}</Text>
              <Text style={styles.statCardLabel}>Total Likes</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="comment" size={24} color="#f39c12" />
              <Text style={styles.statCardNumber}>{platformStats.content.comments}</Text>
              <Text style={styles.statCardLabel}>Total Comments</Text>
            </View>
          </View>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.usersList}
        ListHeaderComponent={
          <Text style={styles.usersTitle}>Users ({users.length})</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF', // soft cool background for contrast
  },

  // Loading / center
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#55607A',
    fontWeight: '600',
  },

  /* ---------- Platform Stats ---------- */
  statsContainer: {
    padding: 16,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    // elevated card look
    shadowColor: '#6A5CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102034',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FBFDFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    // subtle glass effect
    borderWidth: 1,
    borderColor: 'rgba(74,85,185,0.06)',
    shadowColor: '#4750ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  statCardNumber: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 6,
    color: '#2B2FC7',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* ---------- Users list ---------- */
  usersList: {
    padding: 14,
    paddingBottom: 28,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: '#0F1724',
  },

  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    // bold accent strip on the left to make cards pop
    borderLeftWidth: 6,
    borderLeftColor: '#7C5CFF',
    // soft elevated shadow
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F5FF',
    // avatar shadow
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarPlaceholder: {
    backgroundColor: '#E6EEF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontWeight: '800',
    fontSize: 16,
    color: '#08112A',
  },
  userEmail: {
    color: '#5E6C84',
    fontSize: 13,
    marginTop: 2,
  },
  userRole: {
    color: '#8893A8',
    fontSize: 12,
    marginTop: 6,
  },

  userStats: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '700',
  },

  /* ---------- Recent activity ---------- */
  recentActivity: {
    marginBottom: 12,
    marginTop: 6,
  },
  activityTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#122433',
  },
  activityText: {
    fontSize: 13,
    color: '#55607A',
    marginLeft: 6,
    marginBottom: 4,
  },
  noActivity: {
    fontSize: 13,
    color: '#98A0AE',
    fontStyle: 'italic',
  },

  /* ---------- Quick stats row ---------- */
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F3FF',
    marginTop: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: '900',
    fontSize: 16,
    color: '#1F2D5C',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  /* ---------- Admin action buttons ---------- */
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F6FF',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.08)',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#FFF6F7',
    borderColor: 'rgba(231,76,60,0.06)',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
  deleteText: {
    color: '#E74C3C',
  },

  /* ---------- Empty state ---------- */
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7A8599',
    marginTop: 10,
  },
});
