import { Button } from '~/common/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import { useState, useEffect } from 'react';

interface NetworkControlsProps {
  onSearch: (query: string) => void;
}

export default function NetworkControls({ onSearch }: NetworkControlsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      setSearchTerm(value);
      onSearch(value);
      setIsSearchActive(value.trim() !== '');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    onSearch('');
    // Input 요소 찾아서 비우기
    const inputElement = document.querySelector(
      'input[type="search"]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
      inputElement.focus();
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="고객 검색..."
            className="w-[200px] pl-8"
            onKeyDown={handleSearchInput}
            defaultValue={searchTerm}
          />
        </div>
        {isSearchActive && (
          <div className="flex items-center">
            <Badge
              className="bg-primary text-primary-foreground"
              variant="default"
            >
              "{searchTerm}" 검색 결과
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 ml-1"
              onClick={handleClearSearch}
            >
              ✕
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
