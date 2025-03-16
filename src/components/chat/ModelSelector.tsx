
import React, { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ModelOption {
  id: string;
  name: string;
  hugging_face_alternative?: string;
}

interface ProviderOption {
  id: string;
  name: string;
  models: ModelOption[];
}

const providers: ProviderOption[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4", hugging_face_alternative: "HuggingFaceM4/idefics-9b" },
      { id: "gpt-4o", name: "GPT-4o", hugging_face_alternative: "HuggingFaceM4/idefics-9b" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", hugging_face_alternative: "Salesforce/blip-image-captioning-large" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", hugging_face_alternative: "google/PaLI-2B" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", hugging_face_alternative: "google/vit-large-patch16-224" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: [
      { id: "deepseek-coder", name: "DeepSeek Coder", hugging_face_alternative: "deepseek-ai/deepseek-coder-33b-instruct" },
      { id: "deepseek-chat", name: "DeepSeek Chat", hugging_face_alternative: "deepseek-ai/deepseek-llm-7b-chat" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    models: [
      { id: "mistral-large", name: "Mistral Large", hugging_face_alternative: "mistralai/Mistral-7B-Instruct-v0.2" },
      { id: "mistral-small", name: "Mistral Small", hugging_face_alternative: "mistralai/Mistral-7B-Instruct-v0.2" },
    ],
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    models: [
      { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3" },
      { id: "microsoft/phi-3-mini-4k-instruct", name: "Phi-3 Mini" },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B" },
      { id: "tiiuae/falcon-7b-instruct", name: "Falcon 7B" },
    ],
  },
];

interface ModelSelectorProps {
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  defaultProvider?: string;
  defaultModel?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onProviderChange,
  onModelChange,
  defaultProvider = "openai",
  defaultModel = "gpt-4o",
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(defaultProvider);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);

  // Update available models when provider changes
  useEffect(() => {
    const providerData = providers.find((p) => p.id === selectedProvider);
    if (providerData) {
      setAvailableModels(providerData.models);
      // Select first model of the provider if current model doesn't belong to the new provider
      const modelExists = providerData.models.some((m) => m.id === selectedModel);
      if (!modelExists && providerData.models.length > 0) {
        setSelectedModel(providerData.models[0].id);
        onModelChange?.(providerData.models[0].id);
      }
    }
  }, [selectedProvider]);

  // Handle provider change
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    onProviderChange?.(value);
  };

  // Handle model change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelChange?.(value);
  };

  // Find provider and model display names
  const getProviderName = () => {
    const provider = providers.find((p) => p.id === selectedProvider);
    return provider ? provider.name : "Select Provider";
  };

  const getModelName = () => {
    const model = availableModels.find((m) => m.id === selectedModel);
    return model ? model.name : "Select Model";
  };

  return (
    <div className="flex space-x-2">
      {/* Provider dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center justify-between min-w-[120px]">
            <span>{getProviderName()}</span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuRadioGroup value={selectedProvider} onValueChange={handleProviderChange}>
            {providers.map((provider) => (
              <DropdownMenuRadioItem key={provider.id} value={provider.id}>
                {provider.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Model dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center justify-between min-w-[140px]">
            <span>{getModelName()}</span>
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuRadioGroup value={selectedModel} onValueChange={handleModelChange}>
            {availableModels.map((model) => (
              <DropdownMenuRadioItem key={model.id} value={model.id}>
                {model.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ModelSelector;
