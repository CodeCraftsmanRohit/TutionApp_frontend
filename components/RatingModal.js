// components/RatingModal.js
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RatingStars from './RatingStars';

export default function RatingModal({
  visible,
  onClose,
  ratedUserId,
  postId,
  userName,
  onSubmit // <-- ensure this prop is accepted
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // reset when modal is closed/opened
  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment('');
      setSubmitting(false);
    }
  }, [visible]);

 const handleSubmit = async () => {
  if (rating === 0) {
    Alert.alert('Error', 'Please select a rating');
    return;
  }

  if (typeof onSubmit !== 'function') {
    console.warn('RatingModal: onSubmit prop is missing or not a function');
    Alert.alert('Error', 'Unable to submit rating right now');
    return;
  }

  setSubmitting(true);
  try {
    const ratingData = {
      ratedUserId, // controller accepts both `ratedUserId` and `ratedUser`
      postId,
      rating,
      comment: comment.trim()
    };

    // Call the onSubmit prop instead of making API call directly
    await onSubmit(ratingData);

    // If successful, close the modal
    handleClose();
  } catch (error) {
    console.error('Submit rating error:', error);

    // Handle duplicate rating error specifically
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'You have already rated this user';
      Alert.alert('Already Rated', errorMessage);
    } else {
      Alert.alert('Error', 'Failed to submit rating');
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose && onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Rate {userName}</Text>
          <TouchableOpacity onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>How was your experience?</Text>
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              size={32}
              editable={true}
            />
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Add a comment (optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share details about your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {comment.length}/500 characters
            </Text>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={handleClose}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  submitButton: {
    backgroundColor: '#6366F1',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
