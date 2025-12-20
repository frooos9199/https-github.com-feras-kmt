import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AuthProvider from "@/components/AuthProvider";


const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "KMT Marshal System | Kuwait Motor Town",
  description: "Marshal Management System for Kuwait Motor Town",
  icons: {
    icon: "/kmt-logo-copy.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Show STC warning if user might be on STC network
              setTimeout(() => {
                const warning = document.getElementById('stc-warning');
                if (warning) {
                  // Show warning for all users initially, they can close it if not on STC
                  warning.classList.remove('hidden');
                }
              }, 1000);
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {/* STC Network Warning */}
            <div id="stc-warning" className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 hidden" role="alert">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">
                    <strong>تنبيه:</strong> إذا كنت تستخدم شبكة STC، قد تواجه صعوبة في الوصول للموقع. يرجى تجربة شبكة أخرى أو استخدام VPN.
                  </p>
                </div>
                <button onClick={() => document.getElementById('stc-warning')?.classList.add('hidden')} className="text-yellow-700 hover:text-yellow-900">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Build Tue Dec  9 11:33:44 +03 2025
