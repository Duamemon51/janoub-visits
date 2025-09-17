import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="h-full overflow-x-hidden">
      <body
        className="min-h-screen flex flex-col overflow-x-hidden antialiased"
        style={{ fontFamily: "Montserrat" }}
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
