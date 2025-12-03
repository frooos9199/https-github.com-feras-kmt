export const translations = {
  en: {
    // Common
    loading: "Loading...",
    login: "Login",
    logout: "Logout",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    name: "Full Name",
    phone: "Phone Number",
    civilId: "Civil ID",
    dateOfBirth: "Date of Birth",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    
    // Navigation
    home: "Home",
    events: "Events",
    dashboard: "Dashboard",
    profile: "Profile",
    
    // Marshal
    marshalDashboard: "Marshal Dashboard",
    upcomingEvents: "Upcoming Events",
    myAttendance: "My Attendance",
    registerAttendance: "Register Attendance",
    
    // Admin
    adminDashboard: "Admin Dashboard",
    manageEvents: "Manage Events",
    manageMarshals: "Manage Marshals",
    attendanceRequests: "Attendance Requests",
    reports: "Reports",
    
    // Events
    eventName: "Event Name",
    eventDate: "Event Date",
    eventLocation: "Location",
    eventType: "Event Type",
    maxMarshals: "Max Marshals",
    registeredMarshals: "Registered",
    
    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    active: "Active",
    cancelled: "Cancelled",
    completed: "Completed",
  },
  ar: {
    // Common
    loading: "جاري التحميل...",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    signup: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم الكامل",
    phone: "رقم الجوال",
    civilId: "الرقم المدني",
    dateOfBirth: "تاريخ الميلاد",
    submit: "إرسال",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    view: "عرض",
    
    // Navigation
    home: "الرئيسية",
    events: "الفعاليات",
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    
    // Marshal
    marshalDashboard: "لوحة المارشال",
    upcomingEvents: "الفعاليات القادمة",
    myAttendance: "حضوري",
    registerAttendance: "تسجيل الحضور",
    
    // Admin
    adminDashboard: "لوحة الأدمن",
    manageEvents: "إدارة الفعاليات",
    manageMarshals: "إدارة المارشال",
    attendanceRequests: "طلبات الحضور",
    reports: "التقارير",
    
    // Events
    eventName: "اسم الفعالية",
    eventDate: "تاريخ الفعالية",
    eventLocation: "المكان",
    eventType: "نوع الفعالية",
    maxMarshals: "عدد المارشال المطلوب",
    registeredMarshals: "المسجلين",
    
    // Status
    pending: "معلق",
    approved: "مقبول",
    rejected: "مرفوض",
    active: "نشط",
    cancelled: "ملغي",
    completed: "منتهي",
  }
}

export type Language = "en" | "ar"
export type TranslationKey = keyof typeof translations.en
