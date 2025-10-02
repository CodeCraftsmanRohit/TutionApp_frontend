import { StyleSheet, TextInput } from 'react-native';

export default function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  placeholderTextColor = "#64748B", // Added: Default darker color for better visibility
  style,
  ...props // Added: Allow other props to be passed
}) {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={placeholderTextColor} // Added: Proper placeholder color
      // Android specific fixes for placeholder visibility
      includeFontPadding={true}
      textAlignVertical="center"
      {...props} // Added: Spread other props
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginVertical: 8,
    // Android specific properties for consistent rendering
    includeFontPadding: true,
    textAlignVertical: 'center',
    // Shadow effects for premium look
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
});