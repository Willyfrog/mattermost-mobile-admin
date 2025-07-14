import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { Text, useThemeColor } from './Themed';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'large' 
}: LoadingStateProps) {
  const textColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={primaryColor} 
        style={styles.indicator}
      />
      <Text style={[styles.message, { color: textColor }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  indicator: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});