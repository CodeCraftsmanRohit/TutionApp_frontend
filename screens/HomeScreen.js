// screens/HomeScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [likingPostId, setLikingPostId] = useState(null); // Track which post is being liked

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/posts');
      if (res.data.success) {
        setPosts(res.data.posts);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      console.error('Fetch posts error:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      return () => fadeAnim.setValue(0);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await API.delete(`/posts/${postId}`);
            if (res.data.success) {
              Alert.alert('Deleted', 'Post deleted successfully');
              fetchPosts();
            } else {
              Alert.alert('Failed', res.data.message || 'Could not delete post');
            }
          } catch (err) {
            console.error('Delete error:', err.response || err.message || err);
            Alert.alert('Error', (err.response?.data?.message) || err.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleEdit = (post) => {
    navigation.getParent()?.navigate('CreatePost', { mode: 'edit', post });
  };

  const handleLike = async (postId) => {
    // Immediately update UI for better UX
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const wasLiked = post.isLiked;
          const currentLikes = post.likesCount || 0;

          return {
            ...post,
            isLiked: !wasLiked,
            likesCount: wasLiked ? currentLikes - 1 : currentLikes + 1,
            // Optimistically update likes array
            likes: wasLiked
              ? post.likes.filter(like => like.user._id !== user.userId)
              : [...post.likes, { user: { _id: user.userId, name: user.name } }]
          };
        }
        return post;
      })
    );

    setLikingPostId(postId);

    try {
      const res = await API.post(`/posts/${postId}/like`);
      if (res.data.success) {
        // Sync with server response to ensure consistency
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likesCount: res.data.likesCount,
                  isLiked: res.data.isLiked,
                  likes: res.data.isLiked
                    ? [...post.likes, { user: { _id: user.userId, name: user.name } }]
                    : post.likes.filter(like => like.user._id !== user.userId)
                }
              : post
          )
        );
      } else {
        // Revert if server request failed
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? (post.likesCount - 1) : (post.likesCount + 1)
              };
            }
            return post;
          })
        );
        Alert.alert('Error', 'Failed to like post');
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? (post.likesCount - 1) : (post.likesCount + 1)
            };
          }
          return post;
        })
      );
      Alert.alert('Error', 'Failed to like post');
    } finally {
      setLikingPostId(null);
    }
  };

  const handleComment = (post) => {
    navigation.navigate('Comments', { post });
  };

  const handleShare = async (post) => {
    try {
      const title = post.title ? post.title : `${post.subject || ''} - Class ${post.class || ''}`;
      const messageLines = [
        title,
        `Class: ${post.class ?? 'N/A'}`,
        `Subject: ${post.subject ?? 'N/A'}`,
        `Board: ${post.board ?? 'N/A'}`,
        `Salary: ₹${post.salary ?? 'N/A'}`,
      ];
      const message = messageLines.join('\n');

      await Share.share({ message });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Unable to share this post right now.');
    }
  };

  // NEW: Handle notification bell press
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          {item.createdBy?.profilePhoto?.url ? (
            <Image source={{ uri: item.createdBy.profilePhoto.url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="person" size={20} color="#666" />
            </View>
          )}
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.createdBy?.name || 'Unknown User'}</Text>
          <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.cardTitle}>{item.title || `${item.subject} - Class ${item.class}`}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialIcons name="class" size={16} color="#6366F1" />
            <Text style={styles.detailTextLabel}>Class</Text>
            <Text style={styles.detailTextWithLabel}>{item.class}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons name="menu-book" size={16} color="#6366F1" />
            <Text style={styles.detailText}>{item.subject}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="school" size={16} color="#6366F1" />
            <Text style={styles.detailText}>{item.board}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="attach-money" size={16} color="#10B981" />
            <Text style={styles.detailText}>₹{item.salary}</Text>
          </View>
        </View>

        <View style={styles.additionalDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Time: </Text>
            <Text style={styles.detailValue}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Address: </Text>
            <Text style={styles.detailValue}>{item.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Gender: </Text>
            <Text style={styles.detailValue}>{item.genderPreference}</Text>
          </View>
        </View>
      </View>

      {/* Post Image */}
      {item.image?.url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image.url }} style={styles.postImage} />
          <View style={styles.imageOverlay} />
        </View>
      )}

      {/* Like and Comment Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, item.isLiked && styles.actionButtonActive]}
          onPress={() => handleLike(item._id)}
          disabled={likingPostId === item._id} // Disable while processing
        >
          {likingPostId === item._id ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <MaterialIcons
              name={item.isLiked ? "favorite" : "favorite-border"}
              size={22}
              color={item.isLiked ? "#EF4444" : "#64748B"}
            />
          )}
          <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
            {item.likesCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(item)}
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#64748B" />
          <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
          <MaterialIcons name="share" size={20} color="#64748B" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Actions */}
      {user?.role === 'admin' && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={[styles.adminButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.adminButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <MaterialIcons name="delete" size={16} color="#FFFFFF" />
            <Text style={styles.adminButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover Posts</Text>
          <Text style={styles.headerSubtitle}>Find the perfect teaching opportunity</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress} // NEW: Added navigation
        >
          <MaterialIcons name="notifications" size={24} color="#374151" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Create Post Button */}
      {user && (
        <AnimatedTouchable
          style={styles.createPostButton}
          onPress={() => navigation.getParent()?.navigate('CreatePost')}
          activeOpacity={0.8}
        >
          <View style={styles.createPostContent}>
            <View style={styles.plusIcon}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.createPostText}>Create New Post</Text>
          </View>
        </AnimatedTouchable>
      )}

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <MaterialIcons name="article" size={80} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyText}>No posts found</Text>
            <Text style={styles.emptySubtext}>
              Be the first to create a post and help others find teaching opportunities
            </Text>
            {user && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.getParent()?.navigate('CreatePost')}
              >
                <Text style={styles.emptyButtonText}>Create Your First Post</Text>
              </TouchableOpacity>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  notificationButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  createPostButton: {
    backgroundColor: '#6366F1',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createPostText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  contentContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    lineHeight: 26,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  detailTextLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 8,
    marginRight: 6,
    textTransform: 'capitalize',
  },
  detailTextWithLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  additionalDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionButtonActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  adminActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  adminButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});