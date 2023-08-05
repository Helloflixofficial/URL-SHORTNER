"use client";
import { IoMdArrowDown } from "react-icons/io";
import Link from "next/link";
export const SubMenu = ({ data }) => {
  return (
    <>
      <li className="Link">
        <data.icon size={23} className="min-w-max"   />
        <p className="flex-1 capitalize">{data.name}</p>
        <IoMdArrowDown className="" />
      </li>
      <ul>
        {data.menus.map((menu) => (
          <li key={menu}  className="hover:text-blue-600 hover:font-medium" >
            <Link
              href={`/${data.name}/${menu}`}
              className="Link !bg-transparent capitalize"
            >{menu}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
