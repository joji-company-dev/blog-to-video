"use client";

import { PATHS } from "@/src/client/app/routes/paths";
import { Button } from "@/src/client/shared/shadcn/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/client/shared/shadcn/components/form";
import { Input } from "@/src/client/shared/shadcn/components/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
export function BlogUrlForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      url: "",
    },
  });

  const validateUrl = (url: string) => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(url);
  };

  const handleSubmit = async (data: { url: string }) => {
    if (!validateUrl(data.url)) {
      alert("올바른 URL을 입력해주세요.");
      return;
    }

    router.push(`${PATHS.BLOG_PARSER}?url=${encodeURIComponent(data.url)}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-2 md:space-y-4">
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
          <Button type="submit">다음</Button>
        </div>
      </form>
    </Form>
  );
}
