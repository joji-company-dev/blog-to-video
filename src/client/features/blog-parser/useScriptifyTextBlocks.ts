import { apiFetchers } from "@/src/client/shared/api";
import {
  BlogBlockWithAnalysis,
  textBlockModelWithAnalysis,
} from "@/src/common/model/blocks";
import { useMutation } from "@tanstack/react-query";

export function useScriptifyTextBlocks() {
  const { data, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      targetBlock,
      systemPromptOverride,
    }: {
      targetBlock: BlogBlockWithAnalysis;
      systemPromptOverride?: string;
    }) =>
      apiFetchers.scriptifyTextBlocks
        .sequencifyBlogFetcher({
          body: {
            targetBlock: targetBlock,
            systemPromptOverride: systemPromptOverride,
          },
        })
        .then((res) =>
          res.data.map((block) => textBlockModelWithAnalysis.parse(block))
        ),
  });

  const scriptifyTextBlocks = async (
    targetBlock: BlogBlockWithAnalysis,
    systemPromptOverride?: string
  ) => mutateAsync({ targetBlock, systemPromptOverride });

  return {
    data,
    scriptifyTextBlocks,
    isLoading: isPending,
    error,
  };
}
