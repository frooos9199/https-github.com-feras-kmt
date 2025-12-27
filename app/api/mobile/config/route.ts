import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mobile app configuration
    const config = {
      version: "2.7.5",
      minVersion: "2.7.0",
      features: {
        pushNotifications: true,
        offlineMode: false,
        multiLanguage: true,
        attendanceTracking: true,
        eventManagement: true,
        marshalAssignment: true
      },
      api: {
        baseUrl: process.env.NODE_ENV === 'production'
          ? 'https://www.kmtsys.com/api'
          : 'http://localhost:3000/api',
        timeout: 30000
      },
      ui: {
        primaryColor: "#16a34a",
        secondaryColor: "#dc2626",
        theme: "dark"
      }
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Mobile config error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to load configuration" },
      { status: 500 }
    );
  }
}