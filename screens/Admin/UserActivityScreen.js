// screens/Admin/UserActivityScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

export default function UserActivityScreen({ route, navigation }) {
  const { userId } = route.params;
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users/${userId}/activity`);
      if (res.data.success) {
        setUserData(res.data.user);
        setActivity(res.data.activity);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to load user activity');
      }
    } catch (error) {
      console.error('Fetch user activity error:', error);
      Alert.alert('Error', 'Failed to load user activity');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'admin') {
        fetchUserActivity();
      }
    }, [userId, user])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading user activity...</Text>
      </View>
    );
  }

  if (!userData || !activity) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User data not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Header */}
      <View style={styles.userHeader}>
        {userData.profilePhoto?.url ? (
          <Image source={{ uri: userData.profilePhoto.url }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={30} color="#666" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userRole}>{userData.role}</Text>
          <Text style={styles.userJoined}>
            Joined: {new Date(userData.joinedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.userLastActive}>
            Last active: {new Date(userData.lastActive).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* User Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Posts ({activity.posts?.length || 0})
        </Text>
        {activity.posts && activity.posts.length > 0 ? (
          activity.posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDetails}>
                {post.class} • {post.subject} • ₹{post.salary}
              </Text>
              <View style={styles.postStats}>
                <Text style={styles.postStat}>
                  <MaterialIcons name="favorite" size={14} color="#e74c3c" /> {post.likes?.length || 0}
                </Text>
                <Text style={styles.postStat}>
                  <MaterialIcons name="comment" size={14} color="#3498db" /> {post.comments?.length || 0}
                </Text>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No posts found</Text>
        )}
      </View>

      {/* Liked Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Liked Posts ({activity.likedPosts?.length || 0})
        </Text>
        {activity.likedPosts && activity.likedPosts.length > 0 ? (
          activity.likedPosts.map((post) => (
            <View key={post._id} style={styles.likedPostCard}>
              <Text style={styles.likedPostTitle}>{post.title}</Text>
              <Text style={styles.likedPostAuthor}>
                By: {post.createdBy?.name || 'Unknown User'}
              </Text>
              <Text style={styles.likedPostDate}>
                Liked on: {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No liked posts</Text>
        )}
      </View>

      {/* User Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Comments ({activity.comments?.length || 0})
        </Text>
        {activity.comments && activity.comments.length > 0 ? (
          activity.comments.map((comment, index) => (
            <View key={index} style={styles.commentCard}>
              <Text style={styles.commentPost}>
                Post: {comment.postTitle}
              </Text>
              <Text style={styles.commentText}>{comment.comment}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.commentedAt).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No comments</Text>
        )}
      </View>
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  userHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    marginBottom: 2,
  },
  userJoined: {
    fontSize: 12,
    color: '#999',
  },
  userLastActive: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  postCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  postDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postStat: {
    fontSize: 12,
    color: '#666',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  likedPostCard: {
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffd54f',
  },
  likedPostTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  likedPostAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  likedPostDate: {
    fontSize: 11,
    color: '#999',
  },
  commentCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  commentPost: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});