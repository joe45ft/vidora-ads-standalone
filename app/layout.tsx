import "./globals.css";

export const metadata = {
  title: "Vidora Ads",
  description: "Independent course advertisements platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
