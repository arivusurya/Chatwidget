import Header from "@/components/Own/Header";
import SideNav from "@/components/Own/SideNav";
import type { Metadata } from "next";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
        <div className="md:w-64 hidden md:block fixed h-full">
          <SideNav />
        </div>
        <div className="flex-1 md:ml-64 flex flex-col">
          <Header />
          <div className=" flex-1 overflow-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
