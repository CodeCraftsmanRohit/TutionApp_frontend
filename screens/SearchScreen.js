// screens/SearchScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FavoriteButton from '../components/FavoriteButton';
import RatingModal from '../components/RatingModal';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
const [selectedUserForRating, setSelectedUserForRating] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    board: '',
    minSalary: '',
    maxSalary: '',
    genderPreference: '',
    location: '',
    sortBy: 'newest'
  });

  const { user } = useContext(AuthContext);

  const handleRateUser = (post) => {
  if (!post.createdBy || post.createdBy._id === user?.userId) {
    Alert.alert('Info', 'You cannot rate yourself');
    return;
  }

  setSelectedUserForRating({
    userId: post.createdBy._id,
    userName: post.createdBy.name,
    postId: post._id
  });
  setRatingModalVisible(true);
};

  const searchPosts = useCallback(async (query = searchQuery, filterParams = filters) => {
    if (!user) return;

    try {
      setLoading(true);
      const params = {
        query,
        ...filterParams,
        page: 1,
        limit: 20
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await API.get('/search/posts', { params });
      if (response.data.success) {
        setSearchResults(response.data.posts || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, user]);

  const getSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await API.get('/search/suggestions', {
        params: { query }
      });
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  const handleRatingSubmit = async (ratingData) => {
  try {
    const response = await API.post('/ratings', ratingData);
    if (response.data.success) {
      Alert.alert('Success', 'Rating submitted successfully!');
      setRatingModalVisible(false);
      setSelectedUserForRating(null);
    } else {
      Alert.alert('Error', response.data.message);
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    Alert.alert('Error', 'Failed to submit rating');
  }
};

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    getSuggestions(text);
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    searchPosts(suggestion, filters);
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
    searchPosts(searchQuery, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      class: '',
      subject: '',
      board: '',
      minSalary: '',
      maxSalary: '',
      genderPreference: '',
      location: '',
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    searchPosts(searchQuery, clearedFilters);
  };

  const handleUserPress = (post) => {
    if (post.createdBy && post.createdBy._id !== user?.userId) {
      navigation.navigate('UserRatings', {
        userId: post.createdBy._id,
        userName: post.createdBy.name
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

  const renderSearchItem = ({ item }) => {
    const post = item.post ?? item; // some endpoints wrap post inside favorite-like objects
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
    initialFavorited={post.isFavorited}
    size={22}
  />

  {/* Rating Button */}
  <TouchableOpacity
    style={styles.rateButton}
    onPress={() => handleRateUser(post)}
  >
    <MaterialIcons name="star-rate" size={22} color="#F59E0B" />
  </TouchableOpacity>

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

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons
              name={post.isLiked ? 'favorite' : 'favorite-border'}
              size={22}
              color={post.isLiked ? '#EF4444' : '#64748B'}
            />
            <Text style={styles.actionText}>{post.likesCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleComment(post)}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#64748B" />
            <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(post)}>
            <MaterialIcons name="share" size={20} color="#64748B" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
    <View style={styles.header}>
  <View style={{ flex: 1 }}>
    <SearchBar
      value={searchQuery}
      onChangeText={handleSearchChange}
      placeholder="Search by subject, class, location..."
      autoFocus={true}
      onSubmitEditing={() => searchPosts()}
      style={{ width: '100%' }} // ensures SearchBar uses the wrapper's full width
    />
  </View>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setShowFilters(true)}
  >
    <MaterialIcons name="filter-list" size={24} color="#6366F1" />
    {Object.values(filters).some(val => val !== '' && val !== 'newest') && (
      <View style={styles.filterBadge} />
    )}
  </TouchableOpacity>
</View>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <MaterialIcons name="search" size={16} color="#64748B" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Searching posts...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => (item._id ?? (item.post && item.post._id) ?? Math.random().toString())}
          renderItem={renderSearchItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery || Object.values(filters).some(val => val !== '' && val !== 'newest') ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={80} color="#E2E8F0" />
                <Text style={styles.emptyText}>No posts found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms or filters
                </Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search" size={80} color="#E2E8F0" />
                <Text style={styles.emptyText}>Search for posts</Text>
                <Text style={styles.emptySubtext}>
                  Find tuition opportunities by subject, class, location, or salary
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Filters Modal */}
      <FiltersModal
        visible={showFilters}
        filters={filters}
        onApply={applyFilters}
        onClose={() => setShowFilters(false)}
        onClear={clearFilters}
      />
      <RatingModal
  visible={ratingModalVisible}
  onClose={() => {
    setRatingModalVisible(false);
    setSelectedUserForRating(null);
  }}
  ratedUserId={selectedUserForRating?.userId}
  postId={selectedUserForRating?.postId}
  userName={selectedUserForRating?.userName}
  onSubmit={handleRatingSubmit}
/>
    </View>
  );
}

function FiltersModal({ visible, filters, onApply, onClose, onClear }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      class: '',
      subject: '',
      board: '',
      minSalary: '',
      maxSalary: '',
      genderPreference: '',
      location: '',
      sortBy: 'newest'
    };
    setLocalFilters(clearedFilters);
    onClear();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Class Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Class</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 10th, 12th"
              value={localFilters.class}
              onChangeText={(text) => setLocalFilters(prev => ({ ...prev, class: text }))}
            />
          </View>

          {/* Subject Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Subject</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Mathematics, Physics"
              value={localFilters.subject}
              onChangeText={(text) => setLocalFilters(prev => ({ ...prev, subject: text }))}
            />
          </View>

          {/* Board Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Board</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. CBSE, State Board"
              value={localFilters.board}
              onChangeText={(text) => setLocalFilters(prev => ({ ...prev, board: text }))}
            />
          </View>

          {/* Salary Range */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Salary Range (₹)</Text>
            <View style={styles.salaryContainer}>
              <TextInput
                style={[styles.textInput, styles.salaryInput]}
                placeholder="Min"
                keyboardType="numeric"
                value={localFilters.minSalary}
                onChangeText={(text) => setLocalFilters(prev => ({ ...prev, minSalary: text }))}
              />
              <Text style={styles.salarySeparator}>-</Text>
              <TextInput
                style={[styles.textInput, styles.salaryInput]}
                placeholder="Max"
                keyboardType="numeric"
                value={localFilters.maxSalary}
                onChangeText={(text) => setLocalFilters(prev => ({ ...prev, maxSalary: text }))}
              />
            </View>
          </View>

          {/* Location Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter location"
              value={localFilters.location}
              onChangeText={(text) => setLocalFilters(prev => ({ ...prev, location: text }))}
            />
          </View>

          {/* Gender Preference */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Gender Preference</Text>
            <View style={styles.genderOptions}>
              {['any', 'male', 'female'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    localFilters.genderPreference === gender && styles.genderOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, genderPreference: gender }))}
                >
                  <Text style={[
                    styles.genderOptionText,
                    localFilters.genderPreference === gender && styles.genderOptionTextActive
                  ]}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortOptions}>
              {[
                { value: 'newest', label: 'Newest First' },
                { value: 'salary_high', label: 'Salary: High to Low' },
                { value: 'salary_low', label: 'Salary: Low to High' },
                { value: 'popular', label: 'Most Popular' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    localFilters.sortBy === option.value && styles.sortOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, sortBy: option.value }))}
                >
                  <Text style={[
                    styles.sortOptionText,
                    localFilters.sortBy === option.value && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerButton, styles.clearButton]}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.applyButton]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

    </Modal>

  );
}

const styles = StyleSheet.create({
  rateButton: {
  padding: 8,
  marginHorizontal: 4,
},
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  filterButton: {
    padding: 12,
    marginLeft: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 16,
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
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /* --- Card / Post styles (from HomeScreen merged in) --- */
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
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  /* --- Modal styles (continued) --- */
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
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryInput: {
    flex: 1,
  },
  salarySeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  genderOptions: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  genderOptionTextActive: {
    color: '#6366F1',
  },
  sortOptions: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  sortOptionTextActive: {
    color: '#6366F1',
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
  clearButton: {
    backgroundColor: '#F1F5F9',
  },
  applyButton: {
    backgroundColor: '#6366F1',
  },
  clearButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
