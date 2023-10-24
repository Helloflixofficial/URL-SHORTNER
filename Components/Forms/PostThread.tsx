"use client";
import { Button } from "@/Components/ui/button";
import { useForm } from "react-hook-form";
import { Textarea } from "@/Components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThreadValidation } from "@/lib/validation/thread";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { usePathname, useRouter } from "next/navigation";
import { updateUser } from "@/lib/actions/user.actions";

// Import 'Botton' if it's a custom component
import Botton from "@/Components/ui/botton";

interface Props {
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

export function PostThread({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      Thread: "",
      accountId: userId,
    },
  });

  const onSubmit = () => {
    // Define your submission logic here
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Content of the Thread
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Use the correct 'Button' component instead of 'Botton' */}
        <Button>Submit</Button>

        {/* Remove the extra form and Form components */}
      </form>
    </Form>
  );
}
