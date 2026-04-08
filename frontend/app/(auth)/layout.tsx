import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 transition-transform hover:scale-105">
            <Image src="/logo.svg" alt="" width={120} height={88} className="h-auto w-auto rounded-2xl" priority />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
