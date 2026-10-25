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
    // suppressHydrationWarning only skips attribute diffs on these two
    // elements (not their children): browser extensions such as ColorZilla
    // inject attributes into <body>, and the theme is set on <html> before
    // React hydrates.
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
