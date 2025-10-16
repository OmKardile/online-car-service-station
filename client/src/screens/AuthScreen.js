import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Title,
  ActivityIndicator 
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Server configuration - handle different environments
const SERVER_PORT = 5001;

// Determine the correct API URL based on the environment
const getApiBaseUrl = () => {
  if (__DEV__) {
    // For Android emulator
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${SERVER_PORT}/api`;
    }
    // For iOS simulator
    if (Platform.OS === 'ios') {
      return `http://localhost:${SERVER_PORT}/api`;
    }
    // For physical device - COMMON IPs (try these)
    return `http://192.168.1.68:${SERVER_PORT}/api`; // ← CHANGE THIS TO YOUR IP
  }
  return 'https://your-production-server.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const AuthScreen = ({ navigation }) => {
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.phone) {
        Alert.alert('Error', 'Name and phone are required for registration');
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Enhanced test server connection - tries multiple URLs
  const testServerConnection = async () => {
    setLoading(true);
    
    // Test multiple possible URLs in sequence
    const testUrls = [
      `http://localhost:${SERVER_PORT}/api/health`,
      `http://10.0.2.2:${SERVER_PORT}/api/health`,
      `http://192.168.1.100:${SERVER_PORT}/api/health`,
      `http://192.168.0.101:${SERVER_PORT}/api/health`,
      `http://192.168.1.101:${SERVER_PORT}/api/health`,
    ];

    let successUrl = null;
    let lastError = '';
    let workingUrl = '';

    for (const testUrl of testUrls) {
      try {
        console.log('🔗 Testing connection to:', testUrl);
        
        const response = await axios.get(testUrl, {
          timeout: 3000
        });
        
        if (response.data.status === 'OK') {
          successUrl = testUrl;
          workingUrl = testUrl.replace('/api/health', '/api');
          console.log('✅ Found working URL:', successUrl);
          break;
        }
      } catch (error) {
        lastError = error.message;
        console.log(`❌ Failed: ${testUrl} - ${error.message}`);
      }
    }

    if (successUrl) {
      Alert.alert(
        '✅ Server Connection Successful', 
        `Connected to: ${successUrl}\n\n` +
        `Status: OK\n` +
        `Database: Connected\n\n` +
        `Use this URL in your app:\n${workingUrl}`
      );
    } else {
      Alert.alert(
        '❌ All Connection Attempts Failed', 
        `Tried:\n• localhost:${SERVER_PORT}\n• 10.0.2.2:${SERVER_PORT}\n• 192.168.1.100:${SERVER_PORT}\n\n` +
        `To Fix:\n1. Find your IP (ipconfig in PowerShell)\n2. Update the IP in AuthScreen.js\n3. Ensure server is running\n4. Check firewall settings\n\n` +
        `Last error: ${lastError}`
      );
    }
    
    setLoading(false);
  };

  // Handle authentication
  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        if (!isLogin) {
          // If registration was successful, switch to login
          Alert.alert('Success', 'Registration successful! Please login.');
          setIsLogin(true);
          // Clear form but keep email
          setFormData(prev => ({ 
            ...prev, 
            password: '', 
            name: '', 
            phone: '' 
          }));
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show IP help instructions
  const showIPHelp = () => {
    Alert.alert(
      'How to Find Your IP Address',
      '1. Open PowerShell (Windows)\n' +
      '2. Run: ipconfig\n' +
      '3. Look for "IPv4 Address" under your network adapter\n' +
      '4. It will look like: 192.168.1.100\n' +
      '5. Replace 192.168.1.100 in AuthScreen.js with your IP\n' +
      '6. Restart the Expo app\n\n' +
      'Current API URL: ' + API_BASE_URL
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card} elevation={5}>
          <Card.Content>
            <Title style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Title>
            
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to your account' : 'Sign up for car services'}
            </Text>

            {/* Registration Fields - Only show when not in login mode */}
            {!isLogin && (
              <>
                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                  disabled={loading}
                  autoCapitalize="words"
                />
                
                <TextInput
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="phone" />}
                  keyboardType="phone-pad"
                  disabled={loading}
                />
              </>
            )}
            
            {/* Common Fields */}
            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              autoComplete="email"
            />
            
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              secureTextEntry
              disabled={loading}
              autoComplete="password"
            />
            
            {/* Auth Button */}
            <Button 
              mode="contained" 
              onPress={handleAuth} 
              style={styles.authButton}
              loading={loading}
              disabled={loading}
              icon={isLogin ? "login" : "account-plus"}
            >
              {loading ? 'Please Wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            {/* Switch Mode Button */}
            <Button 
              mode="text" 
              onPress={() => {
                setIsLogin(!isLogin);
                // Clear form when switching modes
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  phone: ''
                });
              }}
              style={styles.switchButton}
              disabled={loading}
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"
              }
            </Button>

            {/* Test Server Connection Button */}
            <Button 
              mode="outlined" 
              onPress={testServerConnection}
              style={styles.testButton}
              disabled={loading}
              loading={loading}
              icon="server-network"
            >
              {loading ? 'Testing Connection...' : 'Test Server Connection'}
            </Button>

            {/* Demo & Help Section */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Test & Help</Text>
              
              {/* Demo Client Button */}
              <Button 
                mode="contained" 
                onPress={() => {
                  setFormData({
                    email: 'demo@example.com',
                    password: 'password123',
                    name: 'Demo User',
                    phone: '123-456-7890'
                  });
                  Alert.alert('Demo Credentials', 'Demo client credentials filled! You can now register or login.');
                }}
                style={styles.demoButton}
                disabled={loading}
                icon="account"
                compact
              >
                Fill Demo Client
              </Button>

              {/* Quick Login Button - Only show in login mode */}
              {isLogin && (
                <Button 
                  mode="outlined" 
                  onPress={async () => {
                    setFormData({
                      email: 'test@example.com',
                      password: 'password123',
                      name: '',
                      phone: ''
                    });
                    
                    // Auto-attempt login after a brief delay
                    setTimeout(async () => {
                      const result = await login('test@example.com', 'password123');
                      if (!result.success) {
                        Alert.alert('Demo Login', 
                          'Login attempt failed. This is expected if the user doesnt exist yet. ' +
                          'You can register first with these credentials.'
                        );
                      }
                    }, 500);
                  }}
                  style={styles.demoButton}
                  disabled={loading}
                  icon="login"
                  compact
                >
                  Quick Login Test
                </Button>
              )}

              {/* IP Help Button */}
              <Button 
                mode="text" 
                onPress={showIPHelp}
                style={styles.helpButton}
                icon="help-circle"
                compact
              >
                Network Help - Find Your IP
              </Button>

              {/* Server Info */}
              <View style={styles.serverInfo}>
                <Text style={styles.serverText}>Trying to connect to:</Text>
                <Text style={styles.serverUrl}>{API_BASE_URL}</Text>
                <Text style={styles.serverText}>Server Port: {SERVER_PORT}</Text>
                <Text style={styles.instructionText}>
                  ↑ If connection fails, update the IP address in code
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#7f8c8d',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  authButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  switchButton: {
    marginBottom: 16,
  },
  testButton: {
    marginBottom: 16,
    borderColor: '#3498db',
  },
  demoSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginTop: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  demoButton: {
    marginBottom: 8,
    width: '100%',
  },
  helpButton: {
    marginBottom: 8,
    width: '100%',
  },
  serverInfo: {
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  serverText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 2,
  },
  serverUrl: {
    fontSize: 11,
    color: '#e74c3c',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 10,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default AuthScreen;