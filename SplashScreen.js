import React, { useEffect, useRef, useContext } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    
    // فحص Session
    const checkSession = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          const userData = JSON.parse(userSession);
          await setUser(userData);
          setTimeout(() => {
            navigation.replace('MainTabs');
          }, 2500);
        } else {
          setTimeout(() => {
            navigation.replace('Login');
          }, 2500);
        }
      } catch (error) {
        console.error('[SPLASH] Session check error:', error);
        setTimeout(() => {
          navigation.replace('Login');
        }, 2500);
      }
    };
    
    checkSession();
  }, [navigation]);

  return (
    <LinearGradient
      colors={["#1a1a1a", "#dc2626", "#991b1b"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}> 
        <Image source={require('./assets/appicon/icon.png')} style={styles.logo} resizeMode="contain" />
  <Text style={styles.title}>Marshal Club</Text>
  <Text style={styles.subtitle}>KUWAIT MOTOR TOWN</Text>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </Animated.View>
      <Text style={styles.powered}>Powered by NexDev</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 18,
    borderRadius: 32,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#fff1',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1.2,
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 7,
    fontFamily: 'System',
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 15.5,
    opacity: 0.88,
    marginBottom: 10,
    letterSpacing: 0.7,
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    fontFamily: 'System',
    fontWeight: '400',
    textAlign: 'center',
  },
  loader: {
    marginBottom: 30,
  },
  powered: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.5,
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    letterSpacing: 1,
  },
});

export default SplashScreen;
