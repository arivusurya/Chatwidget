"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  BotIcon,
  FileClock,
  Home,
  Settings,
  User,
  WalletCards,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideNav() {
  const path = usePathname();
  const Menulist = [
    {
      name: "Home",
      icon: Home,
      path: "/dashboard",
    },
    {
      name: "Chat",
      icon: FileClock,
      path: "/dashboard/chat",
    },
    {
      name: "Customer",
      icon: User,
      path: "/dashboard/customer",
    },
    {
      name: "Bot",
      icon: BotIcon,
      path: "/dashboard/bot",
    },
  ];
  useEffect(() => {
    console.log(path);
  }, []);

  return (
    <div className="h-screen relative p-5 shadow-sm border">
      <div className="flex justify-center">
        <Image src={"/logo.svg"} alt="logo" width={120} height={100} />
      </div>
      <div className="mt-10">
        {Menulist.map((menu, index) => (
          <Link href={menu.path}>
            <div
              className={`flex gap-2 mb-2 p-3 hover:bg-primary hover:text-white rounded-lg cursor-pointer items-center ${
                path === menu.path && "bg-primary text-white"
              } `}
            >
              <menu.icon className="h-7 w-6" />
              <h2 className="text-lg">{menu.name}</h2>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-10 left-0 w-full">{/* <Usage /> */}</div>
    </div>
  );
}

export default SideNav;
