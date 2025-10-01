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
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
  },
  usersList: {
    padding: 16,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userRole: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  recentActivity: {
    marginBottom: 12,
  },
  activityTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  noActivity: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#3498db',
  },
  deleteText: {
    color: '#e74c3c',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});