import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Electricity Load Forecasting",
  description: "Smart electricity load forecasting and analysis system",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen bg-neutral-950">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
