"use client";

import { Button } from "@/src/client/shared/shadcn/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/client/shared/shadcn/components/form";
import { Input } from "@/src/client/shared/shadcn/components/input";
import { useForm } from "react-hook-form";

export function BlogUrlForm() {
  const form = useForm({
    defaultValues: {
      url: "",
    },
  });

  const handleSubmit = (data: { url: string }) => {
    alert(data.url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>블로그 URL</FormLabel>
              <Input placeholder="블로그 URL을 입력하세요" {...field} />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
