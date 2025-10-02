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
    backgroundColor: '#F4F8FF', // soft cool background
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#51607A',
    fontWeight: '700',
  },

  errorText: {
    fontSize: 16,
    color: '#7A8797',
    fontWeight: '700',
  },

  /* ---------- User header ---------- */
  userHeader: {
    flexDirection: 'row',
    padding: 18,
    margin: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    // floating card look
    shadowColor: '#6A5CFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },

  userAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F1F6FF',
    // subtle ring shadow
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },

  avatarPlaceholder: {
    backgroundColor: '#E9F1FF',
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
    fontWeight: '900',
    color: '#08122A',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: '#5E6C84',
    marginBottom: 6,
    fontWeight: '600',
  },

  userRole: {
    fontSize: 13,
    color: '#6B8AE0',
    fontWeight: '800',
    marginBottom: 6,
  },

  userJoined: {
    fontSize: 12,
    color: '#98A3B3',
  },

  userLastActive: {
    fontSize: 12,
    color: '#98A3B3',
  },

  /* ---------- Sections ---------- */
  section: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    // light elevation
    shadowColor: '#4F5D9B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    color: '#0F2340',
    letterSpacing: 0.2,
  },

  /* ---------- Posts cards ---------- */
  postCard: {
    backgroundColor: '#F7FBFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#7CC7FF',
    // soft shadow
    shadowColor: '#7CC7FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },

  postTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0B1830',
    marginBottom: 6,
  },

  postDetails: {
    fontSize: 14,
    color: '#52607A',
    marginBottom: 8,
  },

  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  postStat: {
    fontSize: 13,
    color: '#556077',
    fontWeight: '700',
  },

  postDate: {
    fontSize: 12,
    color: '#98A3B3',
  },

  /* ---------- Liked posts ---------- */
  likedPostCard: {
    backgroundColor: '#FFF8EC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#FFD37A',
    shadowColor: '#FFB84D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },

  likedPostTitle: {
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
    color: '#2B2A20',
  },

  likedPostAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },

  likedPostDate: {
    fontSize: 12,
    color: '#98A3B3',
  },

  /* ---------- Comments ---------- */
  commentCard: {
    backgroundColor: '#F2FFF5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#4CD37A',
    shadowColor: '#4CD37A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },

  commentPost: {
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
    color: '#0B2A18',
  },

  commentText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
    color: '#254038',
  },

  commentDate: {
    fontSize: 12,
    color: '#8DA19A',
  },

  /* ---------- No data ---------- */
  noData: {
    textAlign: 'center',
    color: '#9AA3AF',
    fontStyle: 'italic',
    padding: 18,
  },
});
