import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Background } from './Background';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-[#D4D4D4] selection:bg-[#c9a84c]/30">
      <Background />
      <Navbar />
      <main className="flex-grow pt-[70px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
