import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Searchbar,
  FAB,
  Menu,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [serviceStations, setServiceStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch service stations
  const fetchServiceStations = async () => {
    try {
      setLoading(true);
      console.log('🔗 Fetching stations from:', `${API_BASE_URL}/services/stations`);
      const response = await axios.get(`${API_BASE_URL}/services/stations`);
      setServiceStations(response.data);
      setFilteredStations(response.data);
      console.log('✅ Stations fetched successfully:', response.data.length, 'stations');
    } catch (error) {
      console.error('❌ Error fetching stations:', error.message);
      Alert.alert('Error', 'Failed to load service stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter stations based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredStations(serviceStations);
    } else {
      const filtered = serviceStations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, serviceStations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceStations();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchServiceStations();
  }, []);

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

  const handleViewServices = (station) => {
    navigation.navigate('ServiceList', { station });
  };

  const handleViewBookings = () => {
    navigation.navigate('MyBookings');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <Title style={styles.welcomeText}>Welcome, {user.name}!</Title>
                <Paragraph>Email: {user.email}</Paragraph>
                <Paragraph>Role: {user.role}</Paragraph>
                {user.phone && <Paragraph>Phone: {user.phone}</Paragraph>}
              </View>
              
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={openMenu}
                    icon="menu"
                    style={styles.menuButton}
                  >
                    Menu
                  </Button>
                }
              >
                <Menu.Item 
                  onPress={() => { closeMenu(); handleViewBookings(); }} 
                  title="My Bookings" 
                  leadingIcon="calendar-clock"
                />
                <Menu.Item 
                  onPress={() => { closeMenu(); handleViewProfile(); }} 
                  title="My Profile" 
                  leadingIcon="account"
                />
                <Divider />
                <Menu.Item 
                  onPress={() => { closeMenu(); handleLogout(); }} 
                  title="Logout" 
                  leadingIcon="logout"
                  titleStyle={{ color: 'red' }}
                />
              </Menu>
            </View>
            
            <View style={styles.quickStats}>
              <Card style={styles.statCard} mode="contained">
                <Card.Content style={styles.statContent}>
                  <Text style={styles.statNumber}>{serviceStations.length}</Text>
                  <Text style={styles.statLabel}>Stations</Text>
                </Card.Content>
              </Card>
              
              <Button 
                mode="contained" 
                onPress={handleViewBookings}
                style={styles.bookingsButton}
                icon="calendar-clock"
              >
                My Bookings
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Search Bar */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search service stations..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon="magnify"
            />
          </Card.Content>
        </Card>

        {/* Stations List */}
        <View style={styles.stationsSection}>
          <Title style={styles.sectionTitle}>
            Available Service Stations
            {searchQuery && (
              <Text style={styles.resultsText}>
                {' '}({filteredStations.length} results)
              </Text>
            )}
          </Title>

          {loading ? (
            <Card style={styles.loadingCard}>
              <Card.Content style={styles.loadingContent}>
                <Text>Loading stations...</Text>
              </Card.Content>
            </Card>
          ) : filteredStations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No stations found matching your search.' : 'No service stations available.'}
                </Text>
                {searchQuery && (
                  <Button 
                    mode="outlined" 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    Clear Search
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredStations.map(station => (
              <Card key={station.id} style={styles.stationCard} elevation={3}>
                <Card.Content>
                  <View style={styles.stationHeader}>
                    <Title style={styles.stationName}>{station.name}</Title>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>⭐ 4.5</Text>
                    </View>
                  </View>
                  
                  <Paragraph style={styles.stationAddress}>
                    📍 {station.address}
                  </Paragraph>
                  
                  <Paragraph style={styles.stationPhone}>
                    📞 {station.phone}
                  </Paragraph>
                  
                  {station.admin_name && (
                    <Paragraph style={styles.stationManager}>
                      👨‍💼 Manager: {station.admin_name}
                    </Paragraph>
                  )}

                  <View style={styles.stationActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => handleViewServices(station)}
                      style={styles.servicesButton}
                      icon="wrench"
                    >
                      View Services & Book
                    </Button>
                    
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate('Chat', { station })}
                      style={styles.chatButton}
                      icon="message-text"
                    >
                      Chat
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="bookmark"
        label="My Bookings"
        onPress={handleViewBookings}
        variant="primary"
      />
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  menuButton: {
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#bbdefb',
  },
  statContent: {
    alignItems: 'center',
    padding: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  statLabel: {
    fontSize: 12,
    color: '#1565c0',
  },
  bookingsButton: {
    flex: 1,
    marginLeft: 8,
  },
  searchCard: {
    margin: 16,
    marginTop: 0,
  },
  searchBar: {
    backgroundColor: 'white',
  },
  stationsSection: {
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
  stationCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 18,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#ffeb3b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  stationAddress: {
    color: '#666',
    marginBottom: 4,
  },
  stationPhone: {
    color: '#666',
    marginBottom: 4,
  },
  stationManager: {
    color: '#666',
    marginBottom: 12,
  },
  stationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicesButton: {
    flex: 2,
    marginRight: 8,
  },
  chatButton: {
    flex: 1,
  },
  loadingCard: {
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  emptyCard: {
    marginBottom: 16,
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 12,
  },
  clearSearchButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3',
  },
});

export default HomeScreen;