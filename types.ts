
export interface FileWithPreview extends File {
  preview: string;
}

export interface AdGenRequest {
  productDescription: string;
  productImages: FileWithPreview[];
  celebrityImages: FileWithPreview[];
  tone: string;
}

export interface StoryboardScene {
  scene_id: string;
  description: string;
  action: string;
  shot_type: string;
  mood: string;
}

export interface CreativeOutput {
  headline: string;
  body: string;
  cta: string;
  storyboard: StoryboardScene[];
}
