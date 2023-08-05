"use client";
import Image from "next/image";
import Link from "next/link";
import { subMenusList, sidebarData } from "./sidebardata";
import { IoIosArrowBack } from "react-icons/io";
import { SlSettings } from "react-icons/sl";
// import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import { useState } from "react";
import { SubMenu } from "./SubMenu";
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const Animation = {
    open: {
      x: 0,
      width: "16rem",
      transition: {
        damping: 40,
      },
    },
    closed: {
      x: -250,
      width: 0,
      transition: {
        damping: 40,
        delay: 0.15,
      },
    },
  };

  return (
    <>
      <div>
        <motion.div
          variants={Animation}
          animate={isOpen ? "open" : "close"}
          className=" bg-white text-gray shadow-xl z-[999] max-w-[16rem]  w-[16rem]
            overflow-hidden md:relative fixed
         h-screen"
        >
          <div className="flex items-center gap-2.5 font-medium border-b py-3 border-slate-300  mx-3">
            <img
              src="https://avatars.githubusercontent.com/u/73479034?v=4"
              width={45}
              alt="logo"
              className="profile"
            />
            <span className="text-xl whitespace-pre Sharmaji">Sharmaji</span>
          </div>
          {/* ////////////////// */}
          <div className="flex flex-col h-full">
            <ul className="whitespace-pre px-2.5 text-[0.9rem] py-5 flex flex-col gap-1  font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100   md:h-[68%] h-[70%]">
              {sidebarData.map(({ name, url, icon: Icon }, index) => (
                <li key={index}>
                  <Link href={url} className="Link">
                    <Icon size={23} className="min-w-max" />
                    <span>{name}</span>
                  </Link>
                </li>
              ))}
              {/* ///submenus///// */}
              <div className="border-y py-5 border-slate-300 ">
                <small className="pl-3 text-slate-500 inline-block mb-2">
                  products
                </small>
                {subMenusList?.map((menu) => (
                  <div key={menu.name}  className="flex flex-col gap-1">
                    <SubMenu data={menu} />
                  </div>
                ))}
              </div>

              <li>
                <Link href={"/settings"} className="Link">
                  <SlSettings size={23} className="min-w-max" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          {/* ////////////////// */}
          <motion.div
            animate={
              isOpen
                ? {
                    x: 195,
                    y: 0,
                  }
                : {
                    x: -10,
                    y: 10,
                    rotate: 180,
                  }
            }
            transition={{
              duration: 0,
            }}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 font-medium border-b py-3 border-slate-300  mx-3 "
          >
            <IoIosArrowBack size={25} />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
