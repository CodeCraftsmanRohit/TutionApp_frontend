// components/Button.js
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Button({ title, onPress, loading = false, style, textStyle, disabled = false, ...props }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (loading || disabled) && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});