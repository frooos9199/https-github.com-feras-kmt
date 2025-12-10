import UIKit
import Firebase
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    // تهيئة Firebase
    FirebaseApp.configure()
    
    // تهيئة APNs والإشعارات
    UNUserNotificationCenter.current().delegate = self
    
    // طلب صلاحيات الإشعارات
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: { granted, error in
        if granted {
          print("✅ [APNs] Notification permission granted")
        } else {
          print("❌ [APNs] Notification permission denied: \(String(describing: error))")
        }
      }
    )
    
    // تسجيل الجهاز للإشعارات البعيدة
    application.registerForRemoteNotifications()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "kmtsysApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // Called when APNs registration succeeds
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print("✅ [APNs] Device registered for remote notifications")
    print("📱 [APNs] Device Token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
    
    // Pass the token to Firebase
    Messaging.messaging().apnsToken = deviceToken
  }
  
  // Called when APNs registration fails
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ [APNs] Failed to register for remote notifications: \(error.localizedDescription)")
  }
  
  // Handle notification when app is in foreground
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    print("🔔 [APNs] Notification received in foreground")
    
    // Show notification even when app is in foreground
    if #available(iOS 14.0, *) {
      completionHandler([[.banner, .sound, .badge]])
    } else {
      completionHandler([[.alert, .sound, .badge]])
    }
  }
  
  // Handle notification tap
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    print("🔔 [APNs] Notification tapped")
    let userInfo = response.notification.request.content.userInfo
    print("📦 [APNs] Notification data: \(userInfo)")
    
    completionHandler()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
