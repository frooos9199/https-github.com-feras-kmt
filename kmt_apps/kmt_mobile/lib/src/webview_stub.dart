import 'package:flutter/widgets.dart';

class PlatformWebView extends StatelessWidget {
  final String initialUrl;
  const PlatformWebView({super.key, required this.initialUrl});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('WebView is only available on Android/iOS. Open the app on a mobile device to see the website.'),
    );
  }
}
