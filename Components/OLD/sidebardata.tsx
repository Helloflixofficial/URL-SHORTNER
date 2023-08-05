import { AiOutlineHome } from "react-icons/ai";
import { SlSettings } from "react-icons/sl";
import { BsPerson } from "react-icons/bs";
import { HiOutlineDatabase } from "react-icons/hi";
export const sidebarData = [
  {
    name: "Home",
    url: "/",
    icon: AiOutlineHome,
  },
  {
    name: "storage",
    url: "/storage",
    icon: HiOutlineDatabase,
  },
  {
    name: "settings",
    url: "/settings",
    icon: SlSettings,
  },
  {
    name: "authentication",
    url: "/authentication",
    icon: BsPerson,
  },
  
];
