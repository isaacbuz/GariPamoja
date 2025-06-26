import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Avatar } from 'react-native-paper';
import { useAuth } from '@hooks/useAuth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={user?.firstName?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuItems}>
            <Button
              mode="outlined"
              onPress={() => console.log('Edit profile')}
              style={styles.menuButton}
              icon="account-edit"
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              onPress={() => console.log('Change password')}
              style={styles.menuButton}
              icon="lock"
            >
              Change Password
            </Button>
            <Button
              mode="outlined"
              onPress={() => console.log('Notifications')}
              style={styles.menuButton}
              icon="bell"
            >
              Notifications
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuItems}>
            <Button
              mode="outlined"
              onPress={() => console.log('Help center')}
              style={styles.menuButton}
              icon="help-circle"
            >
              Help Center
            </Button>
            <Button
              mode="outlined"
              onPress={() => console.log('Contact support')}
              style={styles.menuButton}
              icon="message"
            >
              Contact Support
            </Button>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
          buttonColor="#ef4444"
          textColor="#ef4444"
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#2563EB',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  menuItems: {
    gap: 12,
  },
  menuButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#ef4444',
  },
}); 