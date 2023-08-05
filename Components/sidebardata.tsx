import { AiOutlineHome } from "react-icons/ai";
import { SlSettings } from "react-icons/sl";
import { BsPerson } from "react-icons/bs";
import { HiOutlineDatabase } from "react-icons/hi";
import { AiOutlineAppstore } from "react-icons/ai";
import { RiBuilding3Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
export const sidebarData = [
  {
    name: "Home",
    url: "/",
    icon: AiOutlineAppstore,
  },
  {
    name: "Storage",
    url: "/storage",
    icon: HiOutlineDatabase,
  },
  {
    name: "Authentication",
    url: "/authentication",
    icon: BsPerson,
  },
  {
    name: "Status",
    url: "/status",
    icon: BsPerson,
  },
  
];


export const subMenusList = [
  {
    name: "build",
    icon: RiBuilding3Line,
    menus: ["auth", "app settings", "stroage", "hosting"],
  },
  {
    name: "analytics",
    icon: TbReportAnalytics,
    menus: ["dashboard", "realtime", "events"],
  },
];
