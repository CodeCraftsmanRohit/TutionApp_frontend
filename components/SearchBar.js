// components/SearchBar.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder = "Search posts...",
  style,
  autoFocus = false,
  onSubmitEditing
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const clearSearch = () => {
    onChangeText('');
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, isFocused && styles.focused]}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          selectionColor="#6366F1"
          caretColor="#111827"
          editable
        />
        {value?.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // remove excessive horizontal padding so parent can control width more easily
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  focused: {
    borderColor: '#6366F1',
    shadowOpacity: 0.12,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827', // ensure visible text color
    fontWeight: '500',
    paddingVertical: 0, // keep vertical alignment
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
});
