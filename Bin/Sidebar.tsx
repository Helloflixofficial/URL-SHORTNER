"use client";
import Image from "next/image";
import Link from "next/link";
import { sidebarData } from "./sidebardata";
export const Sidebar = () => {
  return (
    <>
      <div className="sidebar_top">
        <Image
          src="/assets/logo.png"
          width={50}
          height={30}
          alt="logo"
          className="sidebar_logo"
        />
      </div>

      <div className="flex flex-col  h-full">
        <ul className="whitespace-pre px-2.5 text-[0.9rem] py-5 flex flex-col gap-1  font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100   md:h-[68%] h-[70%]">
          {sidebarData.map(({ name, url, icon: Icon }, index) => (
            <li key={index}>
              <Link href={url} className="link">
                <Icon size={23} className="min-w-max" />
                <span className="sidebar_name">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      </>
  );
};
