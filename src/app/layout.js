import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Fomi — AI Image & Video Generation",
    template: "%s · Fomi",
  },
  description:
    "Create, edit, transform and upscale images and videos with state-of-the-art AI models.",
};

export const viewport = {
  themeColor: "#fbf7f5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
