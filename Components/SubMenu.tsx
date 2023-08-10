"use client";
import { motion } from "framer-motion";
import { React, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import { sidebarData } from "./sidebardata";
export const SubMenu = ({ data }) => {
 const [subMenusList, setSubMenusList] = useState(false);
  return (
    <>
      <li
        className={`Link ${sidebarData.includes(data.name) && "text-blue-600"}`}
        onClick={() => setSubMenusList(!subMenusList)}
      >
        <data.icon size={23} className="min-w-max" />
        <p className="flex-1 capitalize">{data.name}</p>

        <IoIosArrowDown
          className={` ${subMenusList && "rotate-180"} duration-200 `}
        />
      </li>

      <motion.ul
        animate={
          subMenusList
            ? {
                height: "fit-content",
              }
            : {
                height: 0,
              }
        }
        className="flex h-0 flex-col pl-14 text-[0.8rem] font-normal overflow-hidden"
      >
        {data.menus?.map((menu) => (
          <li key={menu} className="hover:text-blue-600 hover:font-medium">
            <Link
              href={`/${data.name}/${menu}`}
              className="link !bg-transparent capitalize"
            >
              {menu}
            </Link>
          </li>
        ))}
      </motion.ul>
    </>
  );
};
