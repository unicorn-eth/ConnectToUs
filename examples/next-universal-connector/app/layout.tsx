import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Web3Provider from '@/components/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Unicorn dApp',
  description: 'A Next.js app with Unicorn wallet integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}