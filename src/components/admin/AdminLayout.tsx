import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#06090E] text-[#F5F7FA] font-sans antialiased selection:bg-[#B8FF3D] selection:text-[#070A0F]">
      {children}
    </div>
  );
};
