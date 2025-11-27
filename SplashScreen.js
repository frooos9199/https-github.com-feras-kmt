import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    return () => clearTimeout(timer);
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
        <Text style={styles.title}>نظام إدارة المارشلات</Text>
        <Text style={styles.subtitle}>نادي الكويت للسيارات</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1.2,
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 17,
    opacity: 0.85,
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
