import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BookingScreen = ({ route, navigation }) => {
  const { station, service } = route.params;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleBookService = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for your booking.');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        serviceId: service.id,
        stationId: station.id,
        date: selectedDate,
        time: selectedTime,
        clientId: user.id,
        specialInstructions: specialInstructions || null
      };

      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
      
      Alert.alert(
        'Booking Confirmed! ✅',
        `Your ${service.name} has been booked successfully!\n\n` +
        `Station: ${station.name}\n` +
        `Date: ${selectedDate}\n` +
        `Time: ${selectedTime}\n` +
        `Total: $${service.price}`,
        [
          {
            text: 'View My Bookings',
            onPress: () => navigation.navigate('MyBookings')
          },
          {
            text: 'Book Another',
            onPress: () => navigation.goBack()
          }
        ]
      );

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSpecialInstructions('');

    } catch (error) {
      console.error('❌ Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // Get tomorrow's date for minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get date 30 days from now for maximum date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container}>
      {/* Service Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Booking Summary</Title>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>${service.price}</Text>
          </View>
          <Paragraph style={styles.serviceDescription}>
            {service.description}
          </Paragraph>
          <Divider style={styles.divider} />
          <Paragraph style={styles.stationInfo}>
            📍 {station.name}{'\n'}
            {station.address}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Date Selection */}
      <Card style={styles.bookingCard}>
        <Card.Content>
          <Title>Select Date & Time</Title>
          
          <TextInput
            label="Booking Date"
            value={selectedDate}
            onChangeText={setSelectedDate}
            style={styles.input}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.dateHint}>
            Please use format: YYYY-MM-DD (e.g., 2024-01-15)
          </Text>

          <Text style={styles.timeLabel}>Available Time Slots:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeSlotsContainer}
          >
            {timeSlots.map(time => (
              <Button
                key={time}
                mode={selectedTime === time ? "contained" : "outlined"}
                onPress={() => setSelectedTime(time)}
                style={styles.timeButton}
                compact
              >
                {time}
              </Button>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Special Instructions */}
      <Card style={styles.instructionsCard}>
        <Card.Content>
          <Title>Special Instructions (Optional)</Title>
          <TextInput
            label="Any special requirements or notes..."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            style={styles.instructionsInput}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
        </Card.Content>
      </Card>

      {/* Booking Confirmation */}
      <Card style={styles.confirmationCard}>
        <Card.Content>
          <Title>Booking Details</Title>
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{service.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Station:</Text>
              <Text style={styles.detailValue}>{station.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {selectedDate || 'Not selected'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {selectedTime || 'Not selected'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.priceValue}>${service.price}</Text>
            </View>
          </View>

          <Button 
            mode="contained" 
            onPress={handleBookService}
            style={styles.bookButton}
            loading={loading}
            disabled={loading || !selectedDate || !selectedTime}
            icon="calendar-check"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            Cancel
          </Button>
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
  summaryCard: {
    margin: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  serviceDescription: {
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  stationInfo: {
    color: '#666',
    lineHeight: 20,
  },
  bookingCard: {
    margin: 16,
    marginTop: 0,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  timeSlotsContainer: {
    marginBottom: 8,
  },
  timeButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  instructionsCard: {
    margin: 16,
    marginTop: 0,
  },
  instructionsInput: {
    backgroundColor: 'white',
  },
  confirmationCard: {
    margin: 16,
    marginTop: 0,
  },
  bookingDetails: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  bookButton: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
});

export default BookingScreen;