import { Button } from '~/common/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '~/common/components/ui/input';

interface NetworkControlsProps {
  onSearch: (query: string) => void;
}

export default function NetworkControls({ onSearch }: NetworkControlsProps) {
  const handleSearchInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch((e.target as HTMLInputElement).value);
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
          />
        </div>
      </div>
    </div>
  );
}
