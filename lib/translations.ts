export const translations = {
  en: {
  // Marshal Profile Page (Admin)
  admin: "ADMIN",
  marshal: "Marshal",
  marshalProfile: "Marshal Profile",
  manageMarshalData: "Manage marshal data",
  saveChanges: "Save Changes",
  deactivate: "Deactivate",
  activate: "Activate",
  confirmDeleteMarshal: "Are you sure you want to delete this marshal?",
  employeeId: "Employee ID",
  nationality: "Nationality",
  marshalTypes: "Marshal Types",
  marshalDragRace: "Drag Race Marshal",
  marshalMotocross: "Motocross Marshal",
  marshalKarting: "Karting Marshal",
  marshalDrift: "Drift Marshal",
  marshalCircuit: "Circuit Marshal",
  marshalRescue: "Rescue Marshal",
  licenseFront: "License Image (Front)",
  licenseBack: "License Image (Back)",
  noImage: "No image",
  back: "Back",
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
  // Marshal Profile Page (Admin)
  admin: "أدمن",
  marshal: "مارشال",
  marshalProfile: "بروفايل المارشال",
  manageMarshalData: "إدارة بيانات المارشال",
  saveChanges: "حفظ التعديلات",
  deactivate: "إيقاف",
  activate: "تفعيل",
  confirmDeleteMarshal: "هل أنت متأكد من حذف هذا المارشال؟",
  employeeId: "الرقم الوظيفي",
  nationality: "الجنسية",
  marshalTypes: "أنواع المارشال",
  marshalDragRace: "مارشال دراق ريس",
  marshalMotocross: "مارشال موتور كروس",
  marshalKarting: "مارشال كارتينق",
  marshalDrift: "مارشال دريفت",
  marshalCircuit: "مارشال سيركت",
  marshalRescue: "مارشال ريسك يو",
  licenseFront: "صورة الرخصة (الأمام)",
  licenseBack: "صورة الرخصة (الخلف)",
  noImage: "لا توجد صورة",
  back: "العودة",
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
