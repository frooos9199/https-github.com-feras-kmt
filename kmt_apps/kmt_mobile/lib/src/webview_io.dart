import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/services.dart' show rootBundle;
import 'package:webview_flutter/webview_flutter.dart';

class PlatformWebView extends StatefulWidget {
  final String initialUrl;
  const PlatformWebView({super.key, required this.initialUrl});

  @override
  State<PlatformWebView> createState() => _PlatformWebViewState();
}

class _PlatformWebViewState extends State<PlatformWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _lastError;
  // تم الاستغناء عن متغير _currentUrl بعد إزالة الشريط العلوي والسفلي.
  bool? _siteAvailable;
  // تم الاستغناء عن متغير _overlayColor بعد إزالة الأوفرلاي.

  @override
  void initState() {
    super.initState();

    // Platform-specific initialization (none required here beyond controller setup).

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) {
          setState(() {
            _isLoading = true;
            _lastError = null;
            // ...existing code...
          });
        },
        onPageFinished: (url) async {
          setState(() {
            _isLoading = false;
            // ...existing code...
          });
          // جلب لون الخلفية من الصفحة
          try {
            final bgColor = await _controller.runJavaScriptReturningResult(
              "window.getComputedStyle(document.body).backgroundColor"
            );
            if (bgColor is String && bgColor.startsWith('rgb')) {
              final rgb = bgColor.replaceAll(RegExp(r'[^\d,]'), '').split(',');
              if (rgb.length >= 3) {
                // ...existing code...
                setState(() {
                  // ...existing code...
                });
              }
            }
          } catch (_) {}
        },
        onWebResourceError: (err) {
          if (kDebugMode) {
            // Log error for debugging
            debugPrint('WebView error: ${err.description} (${err.errorCode})');
          }
          setState(() {
            _lastError = err.description;
            _isLoading = false;
          });
        },
      ));

    // If caller requested a local debug page, load the bundled HTML asset.
    if (widget.initialUrl == 'local-test') {
      rootBundle.loadString('assets/test_page.html').then((html) {
        _controller.loadHtmlString(html);
      }).catchError((e) {
        setState(() {
          _lastError = 'Failed to load local test page: $e';
        });
      });
    } else {
      // For remote URLs, perform a quick HTTP HEAD check before loading the
      // WebView. If the site responds with non-200 (for example 404 on Vercel)
      // we'll show a friendly fallback UI and let the user open the URL in
      // the external browser or load a local debug page.
      _checkAndLoad();
    }
  }

  Future<void> _checkAndLoad() async {
    setState(() {
      _isLoading = true;
      _lastError = null;
      _siteAvailable = null;
    });

    try {
      final uri = Uri.parse(widget.initialUrl);
      // Try HEAD first to save bandwidth; some servers don't support HEAD so
      // fall back to GET on non-200 or exceptions.
      late http.Response resp;
      try {
        resp = await http.head(uri).timeout(const Duration(seconds: 6));
      } catch (_) {
        // Fallback to GET if HEAD failed
        resp = await http.get(uri).timeout(const Duration(seconds: 6));
      }

      if (resp.statusCode == 200) {
        _siteAvailable = true;
        // Some sites block embedded webviews; keep a mobile Safari UA header.
        final headers = <String, String>{
          'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        };
        _controller.loadRequest(Uri.parse(widget.initialUrl), headers: headers);
      } else {
        _siteAvailable = false;
        setState(() {
          _lastError = 'HTTP ${resp.statusCode}: ${resp.reasonPhrase ?? ''}';
        });

        // Auto-fallback: if the remote site is not available, load the
        // bundled local debug page so the app stays usable without changing
        // the website. This gives the user a working WebView experience.
        try {
          final html = await rootBundle.loadString('assets/test_page.html');
          await _controller.loadHtmlString(html);
          setState(() {
            _siteAvailable = true;
            _lastError = null;
            // ...existing code...
          });
        } catch (e) {
          if (kDebugMode) debugPrint('Auto local fallback failed: $e');
          // leave _siteAvailable as false and show the error card
        }
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Pre-check failed: $e');
      _siteAvailable = false;
      setState(() {
        _lastError = 'Network check failed: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SizedBox(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          child: Container(
            color: Colors.black,
            child: Stack(
              children: [
                // Top white bar
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: constraints.maxHeight * 0.025,
                    color: Colors.white,
                  ),
                ),
                // Bottom white bar
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: constraints.maxHeight * 0.025,
                    color: Colors.white,
                  ),
                ),
                // Main WebView
                Positioned.fill(
                  top: constraints.maxHeight * 0.025,
                  bottom: constraints.maxHeight * 0.025,
                  child: WebViewWidget(controller: _controller),
                ),
                if (_lastError != null && _siteAvailable == false)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: constraints.maxWidth * 0.08),
                      child: Card(
                        child: Padding(
                          padding: EdgeInsets.all(constraints.maxWidth * 0.04),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Server responded with an error', style: Theme.of(context).textTheme.titleMedium),
                              SizedBox(height: constraints.maxHeight * 0.01),
                              Text(_lastError ?? 'Unknown error', textAlign: TextAlign.center),
                              SizedBox(height: constraints.maxHeight * 0.015),
                              Wrap(
                                alignment: WrapAlignment.center,
                                spacing: constraints.maxWidth * 0.02,
                                runSpacing: constraints.maxHeight * 0.01,
                                children: [
                                  TextButton.icon(
                                    icon: const Icon(Icons.refresh),
                                    label: const Text('Retry'),
                                    onPressed: _checkAndLoad,
                                  ),
                                  TextButton.icon(
                                    icon: const Icon(Icons.open_in_new),
                                    label: const Text('Open'),
                                    onPressed: () async {
                                      try {
                                        final uri = Uri.parse(widget.initialUrl);
                                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                                      } catch (e) {
                                        if (kDebugMode) debugPrint('Launch failed: $e');
                                      }
                                    },
                                  ),
                                  TextButton.icon(
                                    icon: const Icon(Icons.file_present),
                                    label: const Text('Local'),
                                    onPressed: () async {
                                      try {
                                        final html = await rootBundle.loadString('assets/test_page.html');
                                        _controller.loadHtmlString(html);
                                        setState(() {
                                          _siteAvailable = true;
                                          _lastError = null;
                                        });
                                      } catch (e) {
                                        if (kDebugMode) debugPrint('Local page load failed: $e');
                                        setState(() {
                                          _lastError = 'Local page failed: $e';
                                        });
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                if (_isLoading)
                  const Center(child: CircularProgressIndicator()),
              ],
            ),
          ),
        );
      },
    );
  }

  // تم الاستغناء عن دالة _updateThemeColorFromPage بعد تعديل منطق اللون.

  @override
  void dispose() {
    super.dispose();
  }
}
