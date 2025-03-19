export interface ImageAnalysis {
  text: string;
  objects: string[];
}

export interface ImageAnalyzer {
  analyze(image: string): Promise<ImageAnalysis>;
}

export class ImageAnalyzerImpl implements ImageAnalyzer {
  async analyze(imageSrc: string): Promise<ImageAnalysis> {
    return { text: "test", objects: ["test"] };
  }
}
