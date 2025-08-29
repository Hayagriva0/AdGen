import React, { useState } from 'react';
import type { AdPackage, StoryboardScene, Variant } from '../types';
import { Card } from './ui/Card';

interface OutputDisplayProps {
  adPackage: AdPackage | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
    <p className="text-lg text-gray-300">AdGen is thinking...</p>
    <p className="text-sm text-gray-500">Crafting storyboards, writing copy, and aligning pixels. This might take a moment.</p>
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
        <p className="mt-2 text-gray-400">Your AI Advertising Director is ready.</p>
        <p className="mt-4 text-gray-300">Fill out the form on the left to generate a complete advertising package, including:</p>
        <ul className="mt-2 text-left list-disc list-inside inline-block text-gray-400">
          <li>Campaign Briefs & Strategy</li>
          <li>Multi-channel Video Storyboards</li>
          <li>Static Ad Concepts</li>
          <li>Production-ready JSON</li>
        </ul>
      </div>
    </Card>
);

const FormattedOutput: React.FC<{ adPackage: AdPackage }> = ({ adPackage }) => {
  const { campaign_brief, audience, kpi, variants, style_guide, production_checklist, disclaimer_legal } = adPackage;
  
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-indigo-400">{campaign_brief.title}</h3>
        <p className="mt-2 italic text-gray-300">"{campaign_brief.hook}"</p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-gray-400">
          {campaign_brief.value_props.map((prop, i) => <li key={i}>{prop}</li>)}
        </ul>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-bold text-lg text-white">Target Audience</h4>
          <p className="text-gray-400"><strong>Age:</strong> {audience.age_range}</p>
          <p className="text-gray-400"><strong>Segments:</strong> {audience.segments.join(', ')}</p>
          <p className="mt-2 text-gray-300"><strong>Insight:</strong> {audience.insight}</p>
        </Card>
        <Card>
          <h4 className="font-bold text-lg text-white">KPI</h4>
          <p className="text-gray-400"><strong>Primary:</strong> {kpi.primary}</p>
          <p className="mt-2 text-gray-300"><strong>Goal:</strong> {kpi.goal}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Creative Variants</h3>
        <div className="space-y-6">
          {variants.map(variant => <VariantDisplay key={variant.id} variant={variant} />)}
        </div>
      </Card>

      <Card>
          <h4 className="font-bold text-lg text-white">Style Guide</h4>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-300 font-semibold">Colors:</p>
            {style_guide.colors.map(color => (
              <div key={color} className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-gray-600" style={{ backgroundColor: color }}></div>
                <span className="text-sm text-gray-400 uppercase">{color}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-300 mt-2"><span className="font-semibold">Typography:</span> {style_guide.typography}</p>
      </Card>

      <Card>
          <h4 className="font-bold text-lg text-white">Production Checklist</h4>
          <ul className="mt-2 list-disc list-inside space-y-1 text-gray-400">
            {production_checklist.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
      </Card>

      {disclaimer_legal && (
        <Card>
          <h4 className="font-bold text-lg text-white">Legal Disclaimer</h4>
          <p className="mt-2 text-sm text-gray-500">{disclaimer_legal}</p>
        </Card>
      )}
    </div>
  );
};

const VariantDisplay: React.FC<{ variant: Variant }> = ({ variant }) => (
    <div className="p-4 border border-gray-700 rounded-lg">
        <h4 className="font-bold text-lg text-indigo-400 capitalize">{variant.id.replace('v1_', '').replace('_', ' ')}</h4>
        <div className="text-sm text-gray-400">
            <span>{variant.channel}</span> &bull; <span>{variant.duration_s}s</span> &bull; <span>{variant.aspect_ratio}</span>
        </div>
        <div className="mt-4 p-4 bg-gray-800 rounded-md">
            <p className="font-semibold text-gray-200">Headline: <span className="font-normal">{variant.copy.headline}</span></p>
            <p className="text-gray-300 mt-1">Body: {variant.copy.body}</p>
            <p className="font-semibold text-gray-200 mt-2">CTA: <span className="font-normal">{variant.copy.cta}</span></p>
        </div>
        <div className="mt-4">
            <h5 className="font-semibold text-white mb-2">Storyboard</h5>
            <div className="space-y-2">
                {variant.storyboard.map(scene => <SceneDisplay key={scene.scene_id} scene={scene} />)}
            </div>
        </div>
    </div>
);

const SceneDisplay: React.FC<{ scene: StoryboardScene }> = ({ scene }) => (
    <div className="p-3 bg-gray-900 rounded grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-1">
            <p className="font-bold text-gray-300">Scene {scene.scene_id} ({scene.duration_s}s)</p>
            <p className="text-gray-400">{scene.shot_type} ({scene.camera_move})</p>
        </div>
        <div className="col-span-2">
            <p><strong className="text-gray-400">Action:</strong> {scene.action}</p>
            {scene.dialogue_vo && <p><strong className="text-gray-400">VO/Dialogue:</strong> "{scene.dialogue_vo}"</p>}
            {scene.onscreen_text && <p><strong className="text-gray-400">On-screen Text:</strong> "{scene.onscreen_text}"</p>}
        </div>
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ adPackage, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<'formatted' | 'json'>('formatted');

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    if (!adPackage) {
      return <WelcomeMessage />;
    }
    return (
      <>
        <div className="mb-4 border-b border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`${
                activeTab === 'formatted'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Formatted
            </button>
            <button
              onClick={() => setActiveTab('json')}
               className={`${
                activeTab === 'json'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              JSON
            </button>
          </nav>
        </div>
        <div>
          {activeTab === 'formatted' ? (
            <FormattedOutput adPackage={adPackage} />
          ) : (
            <Card>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all overflow-x-auto">
                {JSON.stringify(adPackage, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
};
