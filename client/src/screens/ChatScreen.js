import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  TextInput,
  Button
} from 'react-native-paper';

const ChatScreen = ({ route }) => {
  const { station, booking } = route.params || {};

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title>Chat with {station?.name}</Title>
          <Paragraph>
            {booking 
              ? `Regarding your ${booking.service_name} booking`
              : 'General inquiry about services'
            }
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.comingSoonCard}>
        <Card.Content style={styles.comingSoonContent}>
          <Title style={styles.comingSoonTitle}>Coming Soon! 🚀</Title>
          <Paragraph style={styles.comingSoonText}>
            Real-time chat functionality is under development.{'\n\n'}
            You'll be able to:
          </Paragraph>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Chat with service station managers</Text>
            <Text style={styles.featureItem}>• Send images of car issues</Text>
            <Text style={styles.featureItem}>• Get real-time updates on your booking</Text>
            <Text style={styles.featureItem}>• Receive service recommendations</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.contactCard}>
        <Card.Content>
          <Title>Contact Information</Title>
          <Paragraph style={styles.contactInfo}>
            📞 Phone: {station?.phone || 'Not available'}{'\n'}
            📧 Email: {station?.email || 'Not available'}{'\n'}
            📍 Address: {station?.address || 'Not available'}
          </Paragraph>
          <Button 
            mode="contained" 
            icon="phone"
            style={styles.callButton}
          >
            Call Station
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  comingSoonCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  comingSoonContent: {
    alignItems: 'center',
    padding: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonText: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    alignSelf: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactCard: {
    marginBottom: 16,
  },
  contactInfo: {
    lineHeight: 24,
    marginBottom: 16,
    color: '#666',
  },
  callButton: {
    marginTop: 8,
  },
});

export default ChatScreen;