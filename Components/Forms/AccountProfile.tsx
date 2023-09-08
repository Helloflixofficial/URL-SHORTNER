"use client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validation/user";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { ChangeEvent } from "react";
import { ValueOf } from "next/dist/shared/lib/constants";

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

function onSubmit(values: z.infer<typeof UserValidation>) {
  console.log(values);
}

export const AccountProfile = ({ user, btnTitle }) => {
  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: "",
      name: "",
      username: "",
      bio: "",
    },
  });
 
  const handleImage = (e:ChangeEvent,fieldChange: (Value: string) => void) => {
    e.preventDefault();
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        {/* ///////////////Profile_Image///////////////// */}
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="text-[white] account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="profile photo"
                    width={25}
                    height={24}
                    priority
                    className="rounded-full object-contain"
                  />
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="profile photo"
                    width={25}
                    height={24}
                    className="object-contain"
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input type="file" 
                accept="image/*"
                placeholder="Upload image"
                className="account-form_image-input"
                onChange={(e) => handleImage(e , field.onChange)}/>
              </FormControl>
            </FormItem>
          )}
        />
        {/* ////////////Name/////////// */}
        <FormField
          control={form.control}
          name="Name"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4 w-full">
              <FormLabel className="text-[white] account-form_image-label">
               Name
              </FormLabel>
              <FormControl className="text-base-semibold text-gray-200">
                <Input 
                type="text"
                className="account-form_input no-focus"
                {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* ////////////Username/////////// */}
        <FormField
          control={form.control}
          name="Username"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4 w-full">
              <FormLabel className="text-[white] account-form_image-label">
               Username
              </FormLabel>
              <FormControl className="text-base-semibold text-gray-200">
                <Input 
                type="text"
                className="account-form_input no-focus"
                {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* //////////////BIO//////////////// */}
        <FormField
          control={form.control}
          name="Bio"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4 w-full">
              <FormLabel className="text-[white] account-form_image-label">
               Bio
              </FormLabel>
              <FormControl className="text-base-semibold text-gray-200">
                <Textarea 
                  rows={10}
                className="account-form_input no-focus"
                {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
