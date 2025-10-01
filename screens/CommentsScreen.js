// screens/CommentsScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function CommentsScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/posts/${post._id}/interactions`);
      if (res.data.success) {
        setComments(res.data.comments || []);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [post._id])
  );

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post(`/posts/${post._id}/comment`, {
        text: newComment.trim()
      });

      if (res.data.success) {
        setNewComment('');
        // Refresh comments
        fetchComments();
      } else {
        Alert.alert('Error', res.data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Add comment error:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await API.delete(`/posts/${post._id}/comments/${commentId}`);
              if (res.data.success) {
                fetchComments();
              } else {
                Alert.alert('Error', res.data.message || 'Failed to delete comment');
              }
            } catch (error) {
              console.error('Delete comment error:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        {item.user?.profilePhoto?.url ? (
          <Image source={{ uri: item.user.profilePhoto.url }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
            <MaterialIcons name="person" size={16} color="#666" />
          </View>
        )}
        <View style={styles.commentUserInfo}>
          <Text style={styles.commentUserName}>{item.user?.name || 'Unknown User'}</Text>
          <Text style={styles.commentTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {(user.userId === item.user?._id || user.role === 'admin') && (
          <TouchableOpacity
            onPress={() => handleDeleteComment(item._id)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete" size={18} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Post Preview */}
      <View style={styles.postPreview}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postDetails}>
          {post.class} • {post.subject} • ₹{post.salary}
        </Text>
      </View>

      {/* Comments List */}
      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <MaterialIcons name="comment" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
        />
      )}

      {/* Add Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            submitting && styles.sendButtonDisabled
          ]}
          onPress={handleAddComment}
          disabled={submitting || !newComment.trim()}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={submitting || !newComment.trim() ? "#999" : "#1976D2"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  postDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  commentsList: {
    flexGrow: 1,
    padding: 16,
  },
  commentCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentUserInfo: {
    flex: 1,
    marginLeft: 8,
  },
  commentUserName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});