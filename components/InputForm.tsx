import React, { useState, useCallback, DragEvent } from 'react';
import type { AdGenRequest, FileWithPreview } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card } from './ui/Card';
import { Checkbox } from './ui/Checkbox';
import { UploadIcon, TrashIcon } from './ui/icons';

interface InputFormProps {
  onGenerate: (formData: AdGenRequest) => void;
  isLoading: boolean;
}

const ImagePreview: React.FC<{ file: FileWithPreview; onRemove: () => void }> = ({ file, onRemove }) => (
  <div className="relative group w-24 h-24">
    <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded-md shadow-lg" />
    <button
      onClick={onRemove}
      className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      aria-label={`Remove ${file.name}`}
    >
      <TrashIcon className="w-6 h-6" />
    </button>
  </div>
);

const FileUpload: React.FC<{
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  id: string;
  label: string;
}> = ({ files, onFilesChange, id, label }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      const newFileArray = Array.from(newFiles).map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      onFilesChange([...files, ...newFileArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
          <div className="flex text-sm text-gray-400">
            <span className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
              <span>Upload files</span>
              <input id={id} name={id} type="file" multiple accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} />
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </label>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {files.map((file, index) => (
            <ImagePreview key={index} file={file} onRemove={() => handleRemoveFile(index)} />
          ))}
        </div>
      )}
    </div>
  );
};

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<Omit<AdGenRequest, 'channels'>>({
    productDescription: '',
    productImages: [],
    celebrityImages: [],
    campaignGoals: '',
    brandGuidelines: '',
    tone: '',
    regions: '',
  });
  const [channels, setChannels] = useState<string[]>([]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChannelChange = useCallback((channel: string, isChecked: boolean) => {
    setChannels(prev => isChecked ? [...prev, channel] : prev.filter(c => c !== channel));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onGenerate({ ...formData, channels });
  };
  
  const channelOptions = ['TikTok', 'YouTube', 'Instagram Feed', 'Instagram Reels', 'Billboard'];

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-white">Campaign Details</h2>
        
        <Textarea
          id="productDescription"
          name="productDescription"
          label="Product Description"
          placeholder="e.g., An eco-friendly, solar-powered backpack for tech-savvy hikers."
          value={formData.productDescription}
          onChange={handleInputChange}
          required
        />
        
        <FileUpload
          id="productImages"
          label="Product Images"
          files={formData.productImages}
          onFilesChange={(files) => setFormData(prev => ({ ...prev, productImages: files }))}
        />

        <FileUpload
          id="celebrityImages"
          label="Celebrity / Influencer Images (Optional)"
          files={formData.celebrityImages}
          onFilesChange={(files) => setFormData(prev => ({ ...prev, celebrityImages: files }))}
        />

        <Input
          id="campaignGoals"
          name="campaignGoals"
          label="Campaign Goals"
          placeholder="e.g., Increase brand awareness among millennials, drive online sales by 20%."
          value={formData.campaignGoals}
          onChange={handleInputChange}
          required
        />
        
        <Textarea
          id="brandGuidelines"
          name="brandGuidelines"
          label="Brand Guidelines (Optional)"
          placeholder="e.g., Use a minimalist and clean aesthetic. Primary color: #FFFFFF. Avoid playful fonts."
          value={formData.brandGuidelines}
          onChange={handleInputChange}
        />

        <Input
          id="tone"
          name="tone"
          label="Tone"
          placeholder="e.g., Energetic and inspiring, luxurious and sophisticated, witty and humorous."
          value={formData.tone}
          onChange={handleInputChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300">Channels</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {channelOptions.map(channel => (
              <Checkbox
                key={channel}
                id={channel}
                label={channel}
                checked={channels.includes(channel)}
                onChange={(e) => handleChannelChange(channel, e.target.checked)}
              />
            ))}
          </div>
        </div>

        <Input
          id="regions"
          name="regions"
          label="Target Regions (for localization)"
          placeholder="e.g., North America, Japan, Brazil"
          value={formData.regions}
          onChange={handleInputChange}
          required
        />

        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Ad Package'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
