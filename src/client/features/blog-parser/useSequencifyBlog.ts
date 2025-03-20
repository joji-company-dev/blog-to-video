import { sequencifyBlogFetcher } from "@/src/client/shared/api/sequencify-blog/fetcher";
import {
  BlogContent,
  blogContentModelWithAnalysis,
} from "@/src/common/model/blog-content.model";
import { useMutation } from "@tanstack/react-query";

export function useSequencifyBlog() {
  const { data, mutateAsync, isPending, error } = useMutation({
    mutationFn: (content: BlogContent) =>
      sequencifyBlogFetcher({ body: { content } }).then((res) =>
        blogContentModelWithAnalysis.parse(res.data)
      ),
  });

  const sequencifyBlog = async (content: BlogContent) => {
    const response = await mutateAsync(content);
    return response;
  };

  return { data, sequencifyBlog, isLoading: isPending, error };
}
