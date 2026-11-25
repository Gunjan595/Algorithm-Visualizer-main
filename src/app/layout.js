import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"], // optional weights, adjust as needed
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"], // optional
});

export const metadata = {
  title: "Algorithm Visualizer",
  description: "Interactive visualization of sorting, searching, and pathfinding algorithms built with Next.js, Framer Motion, and Tailwind CSS.",
  keywords: "algorithm, visualizer, sorting, searching, pathfinding, Next.js, Framer Motion, Tailwind CSS",
  author: "Your Name",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You can add custom meta tags or scripts here if needed */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
