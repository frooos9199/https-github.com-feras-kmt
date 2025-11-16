import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'platform_webview.dart';

/// Top-level background message handler required by firebase_messaging.
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, initialize here.
  await Firebase.initializeApp();
  // For now, just log the message for debugging in debug builds.
  if (kDebugMode) debugPrint('Background message received: ${message.messageId}');
}

final FlutterLocalNotificationsPlugin _localNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> _setupLocalNotifications() async {
  const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
  const iosSettings = DarwinInitializationSettings();
  const initSettings = InitializationSettings(
    android: androidSettings,
    iOS: iosSettings,
  );
  await _localNotificationsPlugin.initialize(initSettings);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Make the app full-screen: hide status and navigation bars where possible.
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  // Initialize Firebase and messaging (guarded). If Firebase config is missing
  // (e.g. GoogleService-Info.plist / google-services.json) we catch the error
  // and continue so the app can run without Firebase during development.
  var firebaseAvailable = false;
  try {
    await Firebase.initializeApp();
    firebaseAvailable = true;
  } catch (e) {
    if (kDebugMode) debugPrint('Firebase initialize failed: $e');
  }

  await _setupLocalNotifications();

  // Background handler only make sense when Firebase is available.
  if (firebaseAvailable) {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  runApp(KmtWebApp(firebaseAvailable: firebaseAvailable));
}

class KmtWebApp extends StatefulWidget {
  final bool firebaseAvailable;
  const KmtWebApp({super.key, this.firebaseAvailable = false});

  @override
  State<KmtWebApp> createState() => _KmtWebAppState();
}

class _KmtWebAppState extends State<KmtWebApp> {
  // Toggle this flag to `true` to load a local debug HTML page instead of the live site.
  // Set to false to load the real website.
  static const bool _useLocalDebugPage = false;
  // Updated to the working Vercel deployment slug discovered during debugging.
  static const _initialUrl = _useLocalDebugPage ? 'local-test' : 'https://https-github-com-feras-kmt.vercel.app';

  // Single main page (WebView). The bottom navigation was removed per request.
  late final Widget _page = const PlatformWebView(initialUrl: _initialUrl);

  @override
  void initState() {
    super.initState();
    if (widget.firebaseAvailable) {
      _initMessaging();
    } else {
      if (kDebugMode) debugPrint('Skipping Firebase messaging init (not available).');
    }
  }

  Future<void> _initMessaging() async {
    final messaging = FirebaseMessaging.instance;

    // Request permissions on iOS
    if (Platform.isIOS) {
      await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
    }

    // Get the token for debug/registration
  final token = await messaging.getToken();
  if (kDebugMode) debugPrint('FCM token: $token');

    // Handle foreground messages and show local notification
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  if (kDebugMode) debugPrint('Foreground message received: ${message.messageId}');
      final notification = message.notification;
      if (notification != null) {
        _localNotificationsPlugin.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              'kmt_channel',
              'KMT Notifications',
              channelDescription: 'Notifications for KMT app',
              importance: Importance.max,
              priority: Priority.high,
            ),
            iOS: DarwinNotificationDetails(),
          ),
        );
      }
    });

    // Handle message opened from background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (kDebugMode) debugPrint('Message opened app: ${message.messageId}');
      // Optional: navigate to a page inside the app based on message data
    });
  }

  // Navigation removed: no handler needed

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'KMT Mobile',
      home: Scaffold(
        body: SafeArea(
          // Show the WebView full-screen (no bottom navigation bar).
          child: _page,
        ),
        // bottomNavigationBar intentionally removed
      ),
    );
  }
}
