import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput,
  Avatar,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    // In a real app, you would update the user profile via API
    Alert.alert('Success', 'Profile updated successfully!');
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text 
            size={80} 
            label={user.name ? user.name.charAt(0).toUpperCase() : 'U'} 
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user.name}</Title>
            <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
            <Text style={styles.userRole}>Role: {user.role}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Profile Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Personal Information</Title>
          
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            style={styles.input}
            mode="outlined"
            disabled={!editing}
            left={<TextInput.Icon icon="account" />}
          />
          
          <TextInput
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            style={styles.input}
            mode="outlined"
            disabled={!editing}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />
          
          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            style={styles.input}
            mode="outlined"
            disabled={!editing}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          {editing ? (
            <View style={styles.editActions}>
              <Button 
                mode="outlined" 
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          ) : (
            <Button 
              mode="contained" 
              onPress={() => setEditing(true)}
              style={styles.editButton}
              icon="account-edit"
            >
              Edit Profile
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Actions</Title>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('MyBookings')}
            style={styles.actionButton}
            icon="calendar-clock"
          >
            View My Bookings
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Change password feature will be available soon.')}
            style={styles.actionButton}
            icon="lock-reset"
          >
            Change Password
          </Button>
          
          <Divider style={styles.divider} />
          
          <Button 
            mode="contained" 
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            buttonColor="#f44336"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>App Information</Title>
          <Paragraph style={styles.infoText}>
            Car Service App v1.0.0
          </Paragraph>
          <Paragraph style={styles.infoText}>
            Manage your car service bookings efficiently
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#e3f2fd',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    backgroundColor: '#2196f3',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  userEmail: {
    color: '#666',
    fontSize: 16,
  },
  userRole: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  editButton: {
    marginTop: 8,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  infoText: {
    color: '#666',
    marginBottom: 4,
  },
});

export default ProfileScreen;