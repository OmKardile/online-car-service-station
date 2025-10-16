import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  ActivityIndicator,
  Chip,
  Searchbar
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ServiceListScreen = ({ route, navigation }) => {
  const { station } = route.params;
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Maintenance', 'Repair', 'Cleaning', 'Inspection'];

  useEffect(() => {
    fetchServices();
  }, [station]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/services/station/${station.id}`);
      setServices(response.data);
      console.log('✅ Services fetched:', response.data.length);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (you might need to add category to your service model)
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleBookService = (service) => {
    navigation.navigate('Booking', { station, service });
  };

  const getServiceCategory = (serviceName) => {
    if (serviceName.includes('Oil') || serviceName.includes('Tire')) return 'Maintenance';
    if (serviceName.includes('Brake') || serviceName.includes('Engine')) return 'Repair';
    if (serviceName.includes('Wash') || serviceName.includes('Clean')) return 'Cleaning';
    if (serviceName.includes('Inspection') || serviceName.includes('Check')) return 'Inspection';
    return 'Maintenance';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Station Info Header */}
      <Card style={styles.stationHeaderCard}>
        <Card.Content>
          <Title style={styles.stationName}>{station.name}</Title>
          <Paragraph style={styles.stationAddress}>📍 {station.address}</Paragraph>
          <Paragraph style={styles.stationPhone}>📞 {station.phone}</Paragraph>
        </Card.Content>
      </Card>

      {/* Search and Filter */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search services..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.chipContainer}
          >
            {categories.map(category => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.chip}
                mode="outlined"
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Services List */}
      <View style={styles.servicesSection}>
        <Title style={styles.sectionTitle}>
          Available Services
          {searchQuery || selectedCategory !== 'All' ? (
            <Text style={styles.resultsText}> ({filteredServices.length} results)</Text>
          ) : null}
        </Title>

        {filteredServices.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'All' 
                  ? 'No services found matching your criteria.' 
                  : 'No services available at this station.'}
              </Text>
              {(searchQuery || selectedCategory !== 'All') && (
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={styles.clearButton}
                >
                  Clear Filters
                </Button>
              )}
            </Card.Content>
          </Card>
        ) : (
          filteredServices.map(service => (
            <Card key={service.id} style={styles.serviceCard} elevation={2}>
              <Card.Content>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Title style={serviceName}>{service.name}</Title>
                    <Chip 
                      mode="outlined" 
                      compact 
                      style={styles.categoryChip}
                      textStyle={styles.categoryText}
                    >
                      {getServiceCategory(service.name)}
                    </Chip>
                  </View>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                </View>

                <Paragraph style={styles.serviceDescription}>
                  {service.description}
                </Paragraph>

                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {formatDuration(service.duration_minutes)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Base Price:</Text>
                    <Text style={styles.detailValue}>${service.base_price}</Text>
                  </View>
                </View>

                <Button 
                  mode="contained" 
                  onPress={() => handleBookService(service)}
                  style={styles.bookButton}
                  icon="calendar-plus"
                >
                  Book This Service
                </Button>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
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
  stationHeaderCard: {
    margin: 16,
    backgroundColor: '#e8f5e8',
  },
  stationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  stationAddress: {
    color: '#666',
    marginBottom: 4,
  },
  stationPhone: {
    color: '#666',
  },
  filterCard: {
    margin: 16,
    marginTop: 0,
  },
  searchBar: {
    backgroundColor: 'white',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  servicesSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  resultsText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'normal',
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  serviceDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#2196f3',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 12,
  },
  clearButton: {
    marginTop: 8,
  },
});

export default ServiceListScreen;