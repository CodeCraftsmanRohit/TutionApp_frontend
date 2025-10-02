import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import RatingStars from '../components/RatingStars';
import API from '../services/api';

export default function UserRatingsScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/ratings/user/${userId}`);
      if (response.data.success) {
        setRatings(response.data.ratings);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Fetch ratings error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRatings();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRatings();
    setRefreshing(false);
  };

  const renderRatingItem = ({ item }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.raterInfo}>
          <Text style={styles.raterName}>{item.rater?.name || 'Anonymous'}</Text>
          <Text style={styles.ratingDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <RatingStars rating={item.rating} size={20} />
      </View>

      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}

      {item.post && (
        <Text style={styles.postReference}>
          For: {item.post.title}
        </Text>
      )}
    </View>
  );

  const renderRatingDistribution = () => {
    if (!summary?.distribution) return null;

    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Rating Distribution</Text>
        {[5, 4, 3, 2, 1].map((star) => {
          const ratingData = summary.distribution.find(d => d._id === star);
          const count = ratingData?.count || 0;
          const percentage = summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;

          return (
            <View key={star} style={styles.distributionRow}>
              <Text style={styles.starLabel}>{star} star</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${percentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.countLabel}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading && !summary) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading ratings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Summary */}
      <View style={styles.header}>
        <Text style={styles.title}>{userName}'s Ratings</Text>

        {summary && (
          <View style={styles.summaryContainer}>
            <View style={styles.overallRating}>
              <Text style={styles.averageRating}>{summary.averageRating}</Text>
              <Text style={styles.ratingOutOf}>/5</Text>
            </View>
            <View style={styles.ratingDetails}>
              <RatingStars rating={summary.averageRating} size={20} />
              <Text style={styles.totalRatings}>
                {summary.totalRatings} {summary.totalRatings === 1 ? 'rating' : 'ratings'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {renderRatingDistribution()}

      <FlatList
        data={ratings}
        keyExtractor={(item) => item._id}
        renderItem={renderRatingItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="star-outline" size={80} color="#E2E8F0" />
            <Text style={styles.emptyText}>No ratings yet</Text>
            <Text style={styles.emptySubtext}>
              {userName} hasn't received any ratings yet
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
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
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  ratingOutOf: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingDetails: {
    flex: 1,
  },
  totalRatings: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  distributionContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    width: 60,
    fontSize: 14,
    color: '#6B7280',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  countLabel: {
    width: 30,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  raterInfo: {
    flex: 1,
  },
  raterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  ratingDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  comment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  postReference: {
    fontSize: 12,
    color: '#6366F1',
    fontStyle: 'italic',
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
});