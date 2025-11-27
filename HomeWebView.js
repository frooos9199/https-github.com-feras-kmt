import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const HomeWebView = () => (
  <View style={{ flex: 1, backgroundColor: '#000', marginBottom: 20 }}>
    <WebView
      source={{ uri: 'https://www.kmtsys.com/login' }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      containerStyle={{ backgroundColor: 'transparent' }}
    />
  </View>
);

export default HomeWebView;
