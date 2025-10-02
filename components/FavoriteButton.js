import { MaterialIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function FavoriteButton({ postId, initialFavorited = false, size = 24, style, onFavoriteChange }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(`/favorites/posts/${postId}/favorite`);
      if (response.data.success) {
        const newFavoritedState = response.data.isFavorited;
        setIsFavorited(newFavoritedState);

        // Notify parent component about the change
        if (onFavoriteChange) {
          onFavoriteChange(newFavoritedState);
        }
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Error', 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={toggleFavorite}
      disabled={loading}
    >
      <MaterialIcons
        name={isFavorited ? "favorite" : "favorite-border"}
        size={size}
        color={isFavorited ? "#EF4444" : "#64748B"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});