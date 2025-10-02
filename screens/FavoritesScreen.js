import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FavoriteButton from '../components/FavoriteButton';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const [likingPostId, setLikingPostId] = useState(null);

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await API.get('/favorites/favorites');
      if (response.data.success) {
        // Ensure all favorite posts have isFavorited set to true
        const favoritesWithStatus = response.data.favorites.map(fav => ({
          ...fav,
          isFavorited: true,
          // Use the post data if it exists, otherwise use the favorite item itself
          ...(fav.post ? { ...fav.post } : {})
        }));
        setFavorites(favoritesWithStatus || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    setFavorites(prevFavorites =>
      prevFavorites.map(post => {
        if (post._id === postId) {
          const wasLiked = post.isLiked;
          const currentLikes = post.likesCount || 0;
          return {
            ...post,
            isLiked: !wasLiked,
            likesCount: wasLiked ? currentLikes - 1 : currentLikes + 1,
          };
        }
        return post;
      })
    );

    setLikingPostId(postId);
    try {
      const res = await API.post(`/posts/${postId}/like`);
      if (!res.data.success) {
        // Revert if server request failed
        setFavorites(prevFavorites =>
          prevFavorites.map(post => {
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
      }
    } catch (error) {
      console.error('Like error:', error);
      setFavorites(prevFavorites =>
        prevFavorites.map(post => {
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
    } finally {
      setLikingPostId(null);
    }
  };

  const handleUserPress = (post) => {
    if (post.createdBy && post.createdBy._id !== user?.userId) {
      navigation.navigate('UserRatings', {
        userId: post.createdBy._id,
        userName: post.createdBy.name,
      });
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
    }
  };

  const renderFavoriteItem = ({ item }) => {
    // Use post data if available, otherwise use the item directly
    const post = item.post ? { ...item.post, isFavorited: true } : { ...item, isFavorited: true };

    return (
      <TouchableOpacity
        style={styles.card}
        // onPress={() => navigation.navigate('PostDetail', { post })}
        activeOpacity={0.9}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.userInfoContainer}
            onPress={() => handleUserPress(post)}
            disabled={!post.createdBy || post.createdBy._id === user?.userId}
          >
            <View style={styles.avatarContainer}>
              {post.createdBy?.profilePhoto?.url ? (
                <Image source={{ uri: post.createdBy.profilePhoto.url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="person" size={20} color="#666" />
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.createdBy?.name || 'Unknown User'}</Text>
              <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
              {post.createdBy?.averageRating > 0 && (
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {post.createdBy.averageRating.toFixed(1)} ({post.createdBy.ratingCount})
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <FavoriteButton
              postId={post._id}
              initialFavorited={true} // Always true in favorites screen
              size={22}
              onFavoriteChange={(isFavorited) => {
                if (!isFavorited) {
                  // Remove from local state if unfavorited
                  setFavorites(prev => prev.filter(fav => fav._id !== item._id));
                }
              }}
            />
            <TouchableOpacity style={styles.menuButton}>
              <MaterialIcons name="more-vert" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.cardTitle}>{post.title || `${post.subject} - Class ${post.class}`}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="class" size={16} color="#6366F1" />
              <Text style={styles.detailTextLabel}>Class</Text>
              <Text style={styles.detailTextWithLabel}>{post.class}</Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="menu-book" size={16} color="#6366F1" />
              <Text style={styles.detailText}>{post.subject}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="school" size={16} color="#6366F1" />
              <Text style={styles.detailText}>{post.board}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="attach-money" size={16} color="#10B981" />
              <Text style={styles.detailText}>₹{post.salary}</Text>
            </View>
          </View>

          <View style={styles.additionalDetails}>
            {post.time ? (
              <View style={styles.detailRow}>
                <MaterialIcons name="access-time" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Time: </Text>
                <Text style={styles.detailValue}>{post.time}</Text>
              </View>
            ) : null}

            {post.address ? (
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Address: </Text>
                <Text style={styles.detailValue}>{post.address}</Text>
              </View>
            ) : null}

            {post.genderPreference ? (
              <View style={styles.detailRow}>
                <MaterialIcons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Gender: </Text>
                <Text style={styles.detailValue}>{post.genderPreference}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Post Image */}
        {post.image?.url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: post.image.url }} style={styles.postImage} />
            <View style={styles.imageOverlay} />
          </View>
        )}

        {/* Like / Comment / Share Actions */}
        <View style={styles.actionsContainer}>
          {/* <TouchableOpacity
            style={[styles.actionButton, post.isLiked && styles.actionButtonActive]}
            onPress={() => handleLike(post._id)}
            disabled={likingPostId === post._id}
          >
            {likingPostId === post._id ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <MaterialIcons
                name={post.isLiked ? 'favorite' : 'favorite-border'}
                size={22}
                color={post.isLiked ? '#EF4444' : '#64748B'}
              />
            )}
            <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
              {post.likesCount || 0}
            </Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(post)}
          >
            <MaterialIcons name="chat-bubble-outline" size={20} color="#64748B" />
            <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(post)}
          >
            <MaterialIcons name="share" size={20} color="#64748B" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="favorite" size={64} color="#CBD5E1" />
        <Text style={styles.loginText}>Please login to view favorites</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} saved posts</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={renderFavoriteItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={80} color="#E2E8F0" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on posts to save them here
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
    marginBottom: 8,
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
  loginText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
});