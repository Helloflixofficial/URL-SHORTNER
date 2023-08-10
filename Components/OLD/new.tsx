import { IoMdArrowDown } from "react-icons/io";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const SubMenu = ({ data }) => {
  const router = useRouter();
  const { pathname } = router;
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <>
      <li
        className={`Link ${pathname.includes(data.name) && "text-blue-600"}`}
        onClick={() => setSubMenuOpen(!subMenuOpen)}
      >
        <data.icon size={23} className="min-w-max" />
        <p className="flex-1 capitalize">{data.name}</p>
        <IoMdArrowDown className="" />
      </li>
      <ul>
        {data.menus.map((menu) => (
          <li key={menu} className="hover:text-blue-600 hover:font-medium">
            <Link href={`/${data.name}/${menu}`}>
              <a className="Link !bg-transparent capitalize">{menu}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SubMenu;



("use client");
import { IoMdArrowDown } from "react-icons/io";
import { Link } from "next/link";
import { NavLink, useLocation } from "react-router-dom";
export const SubMenu = ({ data }) => {
  const { pathname } = useLocation();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <>
      <li
        className={`Link ${pathname.includes(data.name) && "text-blue-600"}`}
        onClick={() => setSubMenuOpen(!subMenuOpen)}
      >
        <data.icon size={23} className="min-w-max" />
        <p className="flex-1 capitalize">{data.name}</p>
        <IoMdArrowDown className="" />
      </li>
      <ul>
        {data.menus.map((menu) => (
          <li key={menu} className="hover:text-blue-600 hover:font-medium">
            <Link
              href={`/${data.name}/${menu}`}
              className="Link !bg-transparent capitalize"
            >
              {menu}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
