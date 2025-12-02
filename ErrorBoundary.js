// ErrorBoundary.js - مكون للتعامل مع الأخطاء العامة في التطبيق
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // تحديث الـ state عند حدوث خطأ
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // يمكنك إرسال الخطأ لـ error reporting service هنا
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient colors={['#000', '#b71c1c']} style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="alert-circle" size={80} color="#dc2626" />
            <Text style={styles.title}>عذراً، حدث خطأ!</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
            
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity style={styles.button} onPress={this.handleReload}>
              <Ionicons name="refresh" size={20} color="#fff" style={{ marginEnd: 8 }} />
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
            
            <Text style={styles.hint}>
              إذا استمرت المشكلة، يرجى إعادة تشغيل التطبيق
            </Text>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 20,
    maxHeight: 200,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorStack: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
