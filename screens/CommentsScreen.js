// screens/CommentsScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, TouchableWithoutFeedback,
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
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: '#f0f4f8' }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust as needed
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
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
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }} // extra bottom padding for keyboard
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
            style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
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
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f8ff', // soft icy background for contrast
  },

  postPreview: {
    padding: 20,
    borderBottomWidth: 0,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    margin: 14,
    marginBottom: 8,
    // Elevated floating card look
    shadowColor: '#6a5cff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    // subtle inner accent line
    borderLeftWidth: 6,
    borderLeftColor: '#6a5cff',
  },
  postTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0b1630',
    letterSpacing: 0.2,
  },
  postDetails: {
    fontSize: 14,
    color: '#51607a',
    marginTop: 6,
    fontWeight: '600',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 30,
  },

  commentsList: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 100,
  },

  commentCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    // eye-catching accent edge
    borderLeftWidth: 6,
    borderLeftColor: '#00b4d8',
    // soft purple glow shadow
    shadowColor: '#6a5cff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  commentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 46 / 2,
    // avatar ring
    borderWidth: 2.5,
    borderColor: 'rgba(106,92,255,0.12)',
    // drop shadow for depth
    shadowColor: '#7c5cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#ffffff',
  },

  avatarPlaceholder: {
    backgroundColor: '#f0f4fb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  commentUserInfo: {
    flex: 1,
    marginLeft: 14,
  },

  commentUserName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#071133',
  },

  commentTime: {
    fontSize: 12,
    color: '#8a97ab',
    marginTop: 4,
    letterSpacing: 0.1,
  },

  deleteButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(231,76,60,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#263142',
    marginTop: 6,
  },

  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 20,
    backgroundColor: 'transparent',
  },

  emptyText: {
    fontSize: 18,
    color: '#344055',
    marginTop: 12,
    fontWeight: '700',
  },

  emptySubtext: {
    fontSize: 14,
    color: '#6b788b',
    marginTop: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 0,
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    // floating bar shadow
    shadowColor: '#00b4d8',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 10,
  },

  commentInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 120,
    backgroundColor: '#f2f9ff',
    fontSize: 15,
    color: '#0b1630',
    // subtle inner shadow to give a glass-like feel
    shadowColor: '#7cc7ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  sendButton: {
    padding: 12,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    // ring + glow effect using shadow
    shadowColor: '#00b4d8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,180,216,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.55,
    backgroundColor: '#fafafa',
    borderColor: 'rgba(0,0,0,0.04)',
    shadowOpacity: 0.02,
  },
});
