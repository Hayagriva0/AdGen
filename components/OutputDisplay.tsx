
import React, { useState } from 'react';
import type { CreativeOutput, StoryboardScene } from '../types';
import { Card } from './ui/Card';
import { generateAdImage, generateAdVideo } from '../services/geminiService';
import { SparklesIcon, VideoIcon } from './ui/icons';
import { Button } from './ui/Button';

interface OutputDisplayProps {
  creativeOutput: CreativeOutput | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
    <p className="text-lg text-gray-300">AdGen is thinking...</p>
    <p className="text-sm text-gray-500">Crafting a new creative concept. This might take a moment.</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <Card>
    <div className="flex flex-col items-center text-center text-red-400">
      <h3 className="text-lg font-bold">Generation Failed</h3>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  </Card>
);

const WelcomeMessage: React.FC = () => (
    <Card>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Welcome to AdGen</h2>
        <p className="mt-2 text-gray-400">Your AI Creative Generator is ready.</p>
        <p className="mt-4 text-gray-300">Fill out the form on the left to generate a complete advertising concept with storyboard, images, and video.</p>
      </div>
    </Card>
);

const CreativeConceptDisplay: React.FC<{ creativeOutput: CreativeOutput }> = ({ creativeOutput }) => {
  const { headline, body, cta, storyboard } = creativeOutput;
  
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-2xl font-bold text-indigo-400">{headline}</h3>
        <p className="mt-2 text-gray-300">{body}</p>
        <p className="mt-4 font-semibold text-white tracking-wider uppercase">{cta}</p>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Storyboard</h3>
        <div className="space-y-4">
          {storyboard.map(scene => <SceneDisplay key={scene.scene_id} scene={scene} />)}
        </div>
      </Card>
    </div>
  );
};

const SceneDisplay: React.FC<{ scene: StoryboardScene }> = ({ scene }) => {
  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>('');

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    setVideoUrl(null); // Clear video if generating image

    const prompt = `Cinematic photo, ${scene.shot_type}, ${scene.mood} mood. Action: "${scene.action}". Style: hyper-realistic, professional commercial photography.`;

    try {
      const resultUrl = await generateAdImage(prompt);
      setImageUrl(resultUrl);
    } catch (err: any) {
      setImageError(err.message || "An unknown error occurred.");
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoError(null);
    setImageUrl(null); // Clear image if generating video
    setVideoStatus('Sending request to the video model...');

    const prompt = `Cinematic video, ${scene.shot_type}, ${scene.mood} mood. Action: "${scene.action}". High-resolution, professional commercial footage.`;
    
    try {
      setVideoStatus('Generating video... This can take a few minutes. Please wait.');
      const resultUrl = await generateAdVideo(prompt);
      setVideoUrl(resultUrl);
      setVideoStatus('');
    } catch (err: any) {
      setVideoError(err.message || "An unknown error occurred during video generation.");
      setVideoStatus('');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const isGenerating = isGeneratingImage || isGeneratingVideo;

  return (
    <div className="p-4 bg-gray-900 rounded-lg flex flex-col md:grid md:grid-cols-2 gap-4 items-center">
      <div className="flex-grow w-full">
          <p className="font-bold text-indigo-400">Scene {scene.scene_id}</p>
          <p className="text-sm text-gray-400 capitalize"><strong className="text-gray-300">Shot:</strong> {scene.shot_type} | <strong className="text-gray-300">Mood:</strong> {scene.mood}</p>
          <p className="mt-2 text-gray-300"><strong className="text-gray-400">Description:</strong> {scene.description}</p>
      </div>
      <div className="w-full aspect-video flex-shrink-0 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden">
        {isGeneratingImage && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-xs text-gray-400">Generating Image...</p>
          </div>
        )}
        {isGeneratingVideo && (
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-xs text-gray-400">{videoStatus}</p>
          </div>
        )}
        {imageError && (
          <div className="text-center p-2">
            <p className="text-sm text-red-400 font-semibold">Image Failed</p>
            <p className="text-xs text-gray-500 mt-1">{imageError}</p>
          </div>
        )}
        {videoError && (
          <div className="text-center p-2">
            <p className="text-sm text-red-400 font-semibold">Video Failed</p>
            <p className="text-xs text-gray-500 mt-1">{videoError}</p>
          </div>
        )}
        {imageUrl && !isGenerating && (
          <img src={imageUrl} alt={`Generated image for scene ${scene.scene_id}`} className="w-full h-full object-cover"/>
        )}
        {videoUrl && !isGenerating && (
            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
        )}
        {!isGenerating && !imageUrl && !videoUrl && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button onClick={handleGenerateImage} disabled={isGenerating} size="sm">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
              <Button onClick={handleGenerateVideo} disabled={isGenerating} size="sm">
                <VideoIcon className="w-4 h-4 mr-2" />
                Generate Video
              </Button>
          </div>
        )}
      </div>
    </div>
  );
};


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ creativeOutput, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorDisplay message={error} />;
  }
  if (!creativeOutput) {
    return <WelcomeMessage />;
  }
  return <CreativeConceptDisplay creativeOutput={creativeOutput} />;
};
