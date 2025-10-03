// screens/UserActivityHistoryScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function UserActivityHistoryScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'posts', 'likes', 'comments'

  const fetchUserActivity = async () => {
    try {
      setLoading(true);

      // Fetch all user activities
      const [postsRes, likesRes, commentsRes] = await Promise.all([
        API.get('/posts'), // Get all posts to filter user's posts
        API.get(`/posts/user/${user.userId}/likes`),
        API.get(`/posts/user/${user.userId}/comments`)
      ]);

      // Process user's posts
      const userPosts = postsRes.data.posts?.filter(post =>
        post.createdBy?._id === user.userId
      ) || [];

      // Process likes and comments
      const userLikes = likesRes.data.success ? likesRes.data.likes : [];
      const userComments = commentsRes.data.success ? commentsRes.data.comments : [];

      // Create activity objects
      const postActivities = userPosts.map(post => ({
        type: 'posts',
        data: post,
        date: new Date(post.createdAt),
        title: `Created post: "${post.title}"`,
        description: `${post.class} • ${post.subject} • ₹${post.salary}`,
        icon: 'post-add'
      }));

      const likeActivities = userLikes.map(like => ({
        type: 'likes',
        data: like,
        date: new Date(like.createdAt),
        title: `Liked post: "${like.post.title}"`,
        description: `By ${like.post.createdBy?.name || 'Unknown'}`,
        icon: 'favorite'
      }));

      const commentActivities = userComments.map(comment => ({
        type: 'comments',
        data: comment,
        date: new Date(comment.createdAt),
        title: `Commented on post: "${comment.post.title}"`,
        description: comment.text,
        icon: 'comment'
      }));

      // Combine and sort all activities
      const allActivities = [...postActivities, ...likeActivities, ...commentActivities]
        .sort((a, b) => b.date - a.date);

      setActivities(allActivities);

      // Set stats
      setStats({
        posts: userPosts.length,
        likes: userLikes.length,
        comments: userComments.length,
        total: allActivities.length
      });

    } catch (error) {
      console.error('Fetch user activity error:', error);
      setActivities([]);
      setStats({
        posts: 0,
        likes: 0,
        comments: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserActivity();
      }
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserActivity();
    setRefreshing(false);
  };

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    return activity.type === activeTab;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'posts': return 'post-add';
      case 'likes': return 'favorite';
      case 'comments': return 'comment';
      default: return 'history';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'posts': return '#6366F1';
      case 'likes': return '#EF4444';
      case 'comments': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${getActivityColor(item.type)}20` }]}>
          <MaterialIcons name={getActivityIcon(item.type)} size={20} color={getActivityColor(item.type)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.activityTime}>
            {item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      {/* Show post image if available */}
      {item.data.post?.image?.url && (
        <Image source={{ uri: item.data.post.image.url }} style={styles.activityImage} />
      )}
      {item.data.image?.url && (
        <Image source={{ uri: item.data.image.url }} style={styles.activityImage} />
      )}
    </TouchableOpacity>
  );

  const TabButton = ({ title, count, type, isActive }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={() => setActiveTab(type)}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {title} {count > 0 ? `(${count})` : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading your activity...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
        <Text style={styles.subtitle}>
          Track your posts, likes, and comments
        </Text>
      </View>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.comments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="All"
          count={stats?.total || 0}
          type="all"
          isActive={activeTab === 'all'}
        />
        <TabButton
          title="Posts"
          count={stats?.posts || 0}
          type="posts"
          isActive={activeTab === 'posts'}
        />
        <TabButton
          title="Likes"
          count={stats?.likes || 0}
          type="likes"
          isActive={activeTab === 'likes'}
        />
        <TabButton
          title="Comments"
          count={stats?.comments || 0}
          type="comments"
          isActive={activeTab === 'comments'}
        />
      </View>

      {/* Activities List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item, index) => `${item.type}-${index}-${item.date.getTime()}`}
        renderItem={renderActivityItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={80} color="#E2E8F0" />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all'
                ? "You haven't done any activities yet"
                : `You haven't ${activeTab} anything yet`
              }
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
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#6366F1',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
});