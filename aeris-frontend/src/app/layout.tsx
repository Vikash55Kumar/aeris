import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'AERIS — AI-Driven Event Intelligence & Risk System | MoES Early Warning Platform',
  description:
    'From Atmospheric Signals to Localized Warnings. AI-driven severe weather nowcasting, coupled hydrological runoff forecasting, and hyper-local warning system for SIH Problem Statement SIH26077 (Ministry of Earth Sciences).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F8FB] text-[#0B2F56] flex flex-col antialiased selection:bg-[#087693] selection:text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
