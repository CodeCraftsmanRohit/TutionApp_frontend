// components/RatingStars.js
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RatingStars({
  rating,
  onRatingChange,
  size = 24,
  editable = false,
  showLabel = false
}) {
  const [currentRating, setCurrentRating] = useState(rating || 0);

  // sync with parent prop changes
  useEffect(() => {
    setCurrentRating(rating || 0);
  }, [rating]);

  const handleRatingPress = (newRating) => {
    if (!editable) return;

    setCurrentRating(newRating);
    onRatingChange?.(newRating);
  };

  const renderStar = (position) => {
    const filled = position <= currentRating;

    return (
      <TouchableOpacity
        key={position}
        onPress={() => handleRatingPress(position)}
        disabled={!editable}
        style={styles.star}
      >
        <MaterialIcons
          name={filled ? "star" : "star-border"}
          size={size}
          color={filled ? "#F59E0B" : "#D1D5DB"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(renderStar)}
      </View>
      {showLabel && (
        <View style={styles.ratingLabel}>
          <Text style={styles.ratingText}>
            {currentRating.toFixed(1)} / 5.0
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    padding: 2,
  },
  ratingLabel: {
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
