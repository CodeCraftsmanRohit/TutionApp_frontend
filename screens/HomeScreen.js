// screens/HomeScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
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

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/posts');
      if (res.data.success) setPosts(res.data.posts);
    } catch (err) {
      console.error('Fetch posts error:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
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
    try {
      const res = await API.post(`/posts/${postId}/like`);
      if (res.data.success) {
        // Update local state
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
      }
    } catch (error) {
      console.error('Like error:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = (post) => {
    navigation.navigate('Comments', { post });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        {item.createdBy?.profilePhoto?.url ? (
          <Image source={{ uri: item.createdBy.profilePhoto.url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={20} color="#666" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.createdBy?.name || 'Unknown User'}</Text>
          <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.cardTitle}>{item.title || `${item.subject} - Class ${item.class}`}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Subject:</Text> {item.subject}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Class:</Text> {item.class}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Board:</Text> {item.board}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Salary:</Text> ₹{item.salary}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Time:</Text> {item.time}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Address:</Text> {item.address}</Text>
      <Text style={styles.detail}><Text style={styles.label}>Gender preference:</Text> {item.genderPreference}</Text>

      {/* Post Image */}
      {item.image?.url && (
        <Image source={{ uri: item.image.url }} style={styles.postImage} />
      )}

      {/* Like and Comment Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item._id)}
        >
          <MaterialIcons
            name={item.isLiked ? "favorite" : "favorite-border"}
            size={24}
            color={item.isLiked ? "#e74c3c" : "#666"}
          />
          <Text style={styles.actionText}>{item.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(item)}
        >
          <MaterialIcons name="comment" size={24} color="#666" />
          <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Actions */}
      {user?.role === 'admin' && (
        <View style={styles.adminActions}>
          <Button title="Edit" onPress={() => handleEdit(item)} />
          <Button title="Delete" color="#d9534f" onPress={() => handleDelete(item._id)} />
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {user && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => navigation.getParent()?.navigate('CreatePost')}
        >
          <Text style={styles.createPostText}>Create New Post</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="post-add" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No posts found.</Text>
            <Text style={styles.emptySubtext}>Be the first to create a post!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  createPostButton: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  createPostText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#2c3e50',
  },
  detail: {
    marginBottom: 4,
    fontSize: 14,
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
    resizeMode: 'cover',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '500',
  },
  adminActions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});