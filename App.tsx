
import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import type { CreativeOutput, AdGenRequest } from './types';
import { generateCreativeConcept } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [creativeOutput, setCreativeOutput] = useState<CreativeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (formData: AdGenRequest) => {
    setIsLoading(true);
    setError(null);
    setCreativeOutput(null);

    try {
      const result = await generateCreativeConcept(formData);
      setCreativeOutput(result);
    } catch (err: any) {
      console.error("Error generating ad package:", err);
      setError(err.message || 'An unknown error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-8">
          <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <OutputDisplay creativeOutput={creativeOutput} isLoading={isLoading} error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
