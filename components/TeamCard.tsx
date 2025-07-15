import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, useThemeColor } from '@/components/Themed';

interface Team {
  id: string;
  name: string;
  display_name: string;
  description: string;
  company_name: string;
  allowed_domains: string;
  invite_id: string;
  allow_open_invite: boolean;
  delete_at: number;
  update_at: number;
  create_at: number;
}

interface TeamCardProps {
  team: Team;
  onPress?: (team: Team) => void;
}

export default function TeamCard({ team, onPress }: TeamCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const handlePress = () => {
    if (onPress) {
      onPress(team);
    }
  };

  const isDeleted = team.delete_at > 0;
  const truncatedDescription = team.description.length > 60 
    ? `${team.description.substring(0, 60)}...` 
    : team.description;

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
              name="users" 
              size={16} 
              color={primaryColor} 
              style={styles.icon} 
            />
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {team.display_name}
            </Text>
          </View>
          {isDeleted && (
            <View style={[styles.deletedIndicator, { backgroundColor: 'transparent' }]}>
              <FontAwesome name="trash" size={12} color={textMuted} />
            </View>
          )}
        </View>
        
        <Text style={[styles.handle, { color: textSecondary }]} numberOfLines={1}>
          @{team.name}
        </Text>
        
        {truncatedDescription && (
          <Text style={[styles.description, { color: textSecondary }]} numberOfLines={2}>
            {truncatedDescription}
          </Text>
        )}
        
        <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
          {team.company_name && (
            <View style={[styles.companyContainer, { backgroundColor: 'transparent' }]}>
              <FontAwesome name="building" size={12} color={textMuted} />
              <Text style={[styles.company, { color: textMuted }]} numberOfLines={1}>
                {team.company_name}
              </Text>
            </View>
          )}
          
          <View style={[styles.inviteContainer, { backgroundColor: 'transparent' }]}>
            <FontAwesome 
              name={team.allow_open_invite ? "unlock" : "lock"} 
              size={12} 
              color={textMuted} 
            />
            <Text style={[styles.inviteText, { color: textMuted }]}>
              {team.allow_open_invite ? "Open" : "Invite Only"}
            </Text>
          </View>
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
  deletedIndicator: {
    padding: 4,
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
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  company: {
    fontSize: 12,
    marginLeft: 4,
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteText: {
    fontSize: 12,
    marginLeft: 4,
  },
});