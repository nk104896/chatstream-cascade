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
      { id: "gpt-4", name: "GPT-4" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: [
      { id: "deepseek-coder", name: "DeepSeek Coder" },
      { id: "deepseek-chat", name: "DeepSeek Chat" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    models: [
      { id: "mistral-large", name: "Mistral Large" },
      { id: "mistral-small", name: "Mistral Small" },
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

  useEffect(() => {
    const providerData = providers.find((p) => p.id === selectedProvider);
    if (providerData) {
      setAvailableModels(providerData.models);
      const modelExists = providerData.models.some((m) => m.id === selectedModel);
      if (!modelExists && providerData.models.length > 0) {
        setSelectedModel(providerData.models[0].id);
        onModelChange?.(providerData.models[0].id);
      }
    }
  }, [selectedProvider]);

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    onProviderChange?.(value);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelChange?.(value);
  };

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
