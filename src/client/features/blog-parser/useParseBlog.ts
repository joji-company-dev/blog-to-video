import { apiFetchers } from "@/src/client/shared/api";
import { useQuery } from "@tanstack/react-query";

export function useParseBlog(url: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-parser", url],
    queryFn: () =>
      apiFetchers.blogParser.blogParserFetcher({ queryParam: { url } }),
  });

  return {
    data,
    isLoading,
    error,
  };
}
