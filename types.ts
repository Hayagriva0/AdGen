
export interface FileWithPreview extends File {
  preview: string;
}

export interface AdGenRequest {
  productDescription: string;
  productImages: FileWithPreview[];
  celebrityImages: FileWithPreview[];
  campaignGoals: string;
  brandGuidelines: string;
  tone: string;
  channels: string[];
  regions: string;
}

// Types based on the JSON Schema
export interface CampaignBrief {
  title: string;
  hook: string;
  value_props: string[];
}

export interface Audience {
  age_range: string;
  segments: string[];
  insight: string;
}

export interface Kpi {
  primary: string;
  goal: string;
}

export interface StoryboardScene {
  scene_id: string;
  duration_s: number;
  shot_type: string;
  camera_move: string;
  framing: string;
  action: string;
  dialogue_vo: string;
  onscreen_text: string;
  color_palette: string[];
  typography: string;
  music_sfx: string;
  transition: string;
  assets_needed: string[];
}

export interface Copy {
  headline: string;
  body: string;
  cta: string;
}

export interface RenderSpecs {
  resolution: string;
  format: string;
  filename: string;
}

export interface ABTest {
  label: string;
  change: string;
}

export interface Variant {
  id: string;
  channel: string;
  duration_s: number;
  aspect_ratio: string;
  storyboard: StoryboardScene[];
  copy: Copy;
  render_specs: RenderSpecs;
  ab_tests: ABTest[];
  legal_note: string;
}

export interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'font';
  purpose: string;
  notes: string;
}

export interface StyleGuide {
  colors: string[];
  typography: string;
  logo_placement: string;
  motion_easing: string;
}

export interface AdPackage {
  campaign_brief: CampaignBrief;
  audience: Audience;
  kpi: Kpi;
  variants: Variant[];
  assets: Asset[];
  style_guide: StyleGuide;
  production_checklist: string[];
  disclaimer_legal: string;
}
