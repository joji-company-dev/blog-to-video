import { apiFetchers } from "@/src/client/shared/api";
import { useQuery } from "@tanstack/react-query";

export function useParseBlog(url: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-parser", url],
    queryFn: () =>
      apiFetchers.blogParser.blogParserFetcher({ queryParam: { url } }),
    retry: 2,
  });

  return {
    data,
    isLoading,
    error,
  };
}
