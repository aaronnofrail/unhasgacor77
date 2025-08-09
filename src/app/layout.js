import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['italic', 'normal'],
  fallback: ['Helvetica Neue', 'sans-serif'],
  subsets: ['latin-ext', 'latin'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'unhasgacor77',
  description: 'Project By Meja Makan',
  icons: {
    icon: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
