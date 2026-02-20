import Sidebar from "@/components/common/Sidebar";
import { LanguageProvider } from "../context/LanguageContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
      suppressHydrationWarning>
        <LanguageProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main content - automatically adjusts based on sidebar */}
          <main className="flex-1 md:ml-70 w-full transition-all duration-300">
            {children}
          </main>
        </div>
        </LanguageProvider>
      </body>
    </html>
  );
}