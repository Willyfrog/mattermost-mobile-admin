import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, useThemeColor } from '@/components/Themed';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  scheme_managed: boolean;
  builtin: boolean;
  delete_at: number;
  update_at: number;
  create_at: number;
}

interface RoleCardProps {
  role: Role;
  onPress?: (role: Role) => void;
}

export default function RoleCard({ role, onPress }: RoleCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  const handlePress = () => {
    if (onPress) {
      onPress(role);
    }
  };

  const isDeleted = role.delete_at > 0;
  const truncatedDescription = role.description.length > 60 
    ? `${role.description.substring(0, 60)}...` 
    : role.description;

  const getRoleTypeColor = () => {
    if (role.builtin) return successColor;
    if (role.scheme_managed) return warningColor;
    return primaryColor;
  };

  const getRoleTypeIcon = () => {
    if (role.builtin) return "shield";
    if (role.scheme_managed) return "cog";
    return "user-plus";
  };

  const getRoleTypeText = () => {
    if (role.builtin) return "Built-in";
    if (role.scheme_managed) return "Scheme";
    return "Custom";
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={[styles.cardContent, { backgroundColor: 'transparent' }]}>
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <View style={[styles.titleContainer, { backgroundColor: 'transparent' }]}>
            <FontAwesome 
              name={getRoleTypeIcon()} 
              size={16} 
              color={getRoleTypeColor()} 
              style={styles.icon} 
            />
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {role.display_name}
            </Text>
          </View>
          <View style={[styles.typeContainer, { backgroundColor: 'transparent' }]}>
            {isDeleted && (
              <FontAwesome name="trash" size={12} color={textMuted} style={styles.deletedIcon} />
            )}
            <View style={[styles.typeBadge, { backgroundColor: getRoleTypeColor() }]}>
              <Text style={[styles.typeText, { color: '#fff' }]}>
                {getRoleTypeText()}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.handle, { color: textSecondary }]} numberOfLines={1}>
          {role.name}
        </Text>
        
        {truncatedDescription && (
          <Text style={[styles.description, { color: textSecondary }]} numberOfLines={2}>
            {truncatedDescription}
          </Text>
        )}
        
        <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
          <View style={[styles.permissionsContainer, { backgroundColor: 'transparent' }]}>
            <FontAwesome name="key" size={12} color={textMuted} />
            <Text style={[styles.permissionsText, { color: textMuted }]}>
              {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {role.scheme_managed && (
            <View style={[styles.schemeContainer, { backgroundColor: 'transparent' }]}>
              <FontAwesome name="link" size={12} color={textMuted} />
              <Text style={[styles.schemeText, { color: textMuted }]}>
                Scheme Managed
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedIcon: {
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  handle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  schemeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeText: {
    fontSize: 12,
    marginLeft: 4,
  },
});