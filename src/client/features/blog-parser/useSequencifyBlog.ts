import { sequencifyBlogFetcher } from "@/src/client/shared/api/sequencify-blog/fetcher";
import {
  BlogContent,
  blogContentModel,
} from "@/src/common/model/blog-parser.model";
import { useMutation } from "@tanstack/react-query";

export function useSequencifyBlog() {
  const { data, mutateAsync, isPending, error } = useMutation({
    mutationFn: (content: BlogContent) =>
      sequencifyBlogFetcher({ body: { content } }).then((res) =>
        blogContentModel.parse(res.data)
      ),
  });

  const sequencifyBlog = async (content: BlogContent) => {
    const response = await mutateAsync(content);
    return response;
  };

  return { data, sequencifyBlog, isLoading: isPending, error };
}
