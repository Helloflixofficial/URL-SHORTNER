"use client";
import { useForm } from "react-hook-form";
import { Form } from "@/Components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
interface props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}
export const AccountProfile = ({ user, btnTitle }) => {
  const Form = useForm({
    resolver : zodResolver()
  });
  return 
  <>
    <Form/>
  </>;
};
