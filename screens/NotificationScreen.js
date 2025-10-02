// screens/NotificationsScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await API.put(`/notifications/${notificationId}/read`);
      if (res.data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await API.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const handleNotificationPress = (notification) => {
    // Mark as read when pressed
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === 'tuition_post' && notification.relatedPost) {
      // Navigate to post details (you might need to implement this)
      Alert.alert('Post Notification', `Navigate to post: ${notification.relatedPost.title}`);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tuition_post':
        return <MaterialIcons name="post-add" size={24} color="#3498db" />;
      case 'like':
        return <MaterialIcons name="favorite" size={24} color="#e74c3c" />;
      case 'comment':
        return <MaterialIcons name="comment" size={24} color="#27ae60" />;
      default:
        return <MaterialIcons name="notifications" size={24} color="#95a5a6" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with unread count */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {getUnreadCount() > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{getUnreadCount()}</Text>
          </View>
        )}
        {getUnreadCount() > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications here when you get likes, comments, or new posts
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8ff', // soft icy background for contrast
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7a90',
    fontSize: 14,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    // floating header card look
    marginHorizontal: 12,
    borderRadius: 14,
    // soft shadow
    shadowColor: '#6a5cff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#071133',
    flex: 1,
    letterSpacing: 0.2,
  },

  unreadBadge: {
    backgroundColor: '#ff4d6d',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle pop shadow
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15,108,242,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(15,108,242,0.12)',
  },
  markAllText: {
    color: '#0f6cf2',
    fontWeight: '700',
    fontSize: 13,
  },

  // FlatList container
  notificationsList: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingBottom: 28,
  },

  // Each notification
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    // accent left edge
    borderLeftWidth: 6,
    borderLeftColor: 'rgba(0,180,216,0.12)',
    // raised card shadow
    shadowColor: '#3850ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 8,
  },

  unreadNotification: {
    backgroundColor: '#f0fbff',
    borderLeftColor: '#00b4d8',
  },

  notificationIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // soft translucent background for the icon
    backgroundColor: 'rgba(12,120,255,0.06)',
    // subtle icon shadow
    shadowColor: '#00b4d8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 8,
  },

  notificationTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#071133',
    marginBottom: 4,
  },

  notificationMessage: {
    fontSize: 14,
    color: '#5c6b80',
    marginBottom: 6,
    lineHeight: 20,
  },

  notificationTime: {
    fontSize: 12,
    color: '#98a3b3',
    fontWeight: '600',
  },

  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
    backgroundColor: '#00b4d8',
    marginLeft: 8,
    // glow
    shadowColor: '#00b4d8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    alignSelf: 'center',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#445566',
    marginTop: 10,
    fontWeight: '800',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8a98',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
