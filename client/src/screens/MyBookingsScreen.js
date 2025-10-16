import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bookings/user/${user.id}`);
      setBookings(response.data);
      console.log('✅ Bookings fetched:', response.data.length);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (booking) => {
    Alert.alert(
      'Booking Details',
      `Service: ${booking.service_name}\n` +
      `Station: ${booking.station_name}\n` +
      `Date: ${formatDate(booking.booking_date)}\n` +
      `Time: ${booking.booking_time}\n` +
      `Price: $${booking.final_price}\n` +
      `Status: ${getStatusText(booking.status)}`
    );
  };

  const handleChat = (booking) => {
    navigation.navigate('Chat', { 
      station: { id: booking.service_station_id, name: booking.station_name },
      booking 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>My Bookings</Title>
          <Paragraph>
            {bookings.length === 0 
              ? "You don't have any bookings yet."
              : `You have ${bookings.length} booking${bookings.length === 1 ? '' : 's'}`
            }
          </Paragraph>
        </Card.Content>
      </Card>

      {bookings.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              Book your first car service to see it here!
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Home')}
              style={styles.bookButton}
              icon="car-service"
            >
              Book a Service
            </Button>
          </Card.Content>
        </Card>
      ) : (
        bookings.map(booking => (
          <Card key={booking.id} style={styles.bookingCard} elevation={3}>
            <Card.Content>
              <View style={styles.bookingHeader}>
                <Title style={styles.serviceName}>{booking.service_name}</Title>
                <Chip 
                  mode="outlined"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
                  textStyle={styles.statusText}
                >
                  {getStatusText(booking.status)}
                </Chip>
              </View>

              <Paragraph style={styles.stationName}>
                📍 {booking.station_name}
              </Paragraph>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(booking.booking_date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{booking.booking_time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.priceValue}>${booking.final_price}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Booked on:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => handleViewDetails(booking)}
                  style={styles.detailsButton}
                  icon="information"
                >
                  Details
                </Button>
                
                <Button 
                  mode="contained" 
                  onPress={() => handleChat(booking)}
                  style={styles.chatButton}
                  icon="message-text"
                  disabled={booking.status === 'cancelled'}
                >
                  Chat
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#e3f2fd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  emptyCard: {
    margin: 16,
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookButton: {
    marginTop: 8,
  },
  bookingCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    marginLeft: 'auto',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stationName: {
    color: '#666',
    marginBottom: 12,
    fontSize: 16,
  },
  bookingDetails: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  priceValue: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  chatButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default MyBookingsScreen;