import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useThemeColor } from './Themed';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchInput({
  placeholder = 'Search users...',
  value,
  onChangeText,
  onClear,
  debounceMs = 300,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textMuted');
  const iconColor = useThemeColor({}, 'textSecondary');

  // Debounce the search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChangeText(internalValue);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [internalValue, debounceMs, onChangeText]);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClear = () => {
    setInternalValue('');
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <FontAwesome 
        name="search" 
        size={16} 
        color={iconColor} 
        style={styles.searchIcon} 
      />
      
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={internalValue}
        onChangeText={setInternalValue}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never" // We'll handle this ourselves
      />
      
      {internalValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times-circle" size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0, // Remove default padding
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});