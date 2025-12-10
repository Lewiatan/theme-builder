import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PageType } from '../../types/api';

export interface TopNavigationBarProps {
  currentPageType: PageType;
  pageTypes: PageType[];
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isResetting: boolean;
  onPageTypeChange: (type: PageType) => void;
  onReset: () => void;
  onSave: () => void;
  onDemo: () => void;
  onThemeToggle: () => void;
  isThemeSidebarOpen: boolean;
}

export function TopNavigationBar({
  currentPageType,
  pageTypes,
  hasUnsavedChanges,
  isSaving,
  isResetting,
  onPageTypeChange,
  onReset,
  onSave,
  onDemo,
  onThemeToggle,
  isThemeSidebarOpen,
}: TopNavigationBarProps) {
  return (
    <header className="border-b bg-white px-6 py-4" data-testid="workspace-header">
      <div className="flex items-center justify-between">
        {/* Left: Page selector and unsaved changes indicator */}
        <div className="flex items-center gap-4">
          <Select value={currentPageType} onValueChange={onPageTypeChange}>
            <SelectTrigger className="w-[180px] cursor-pointer" data-testid="page-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageTypes.map((type) => (
                <SelectItem key={type} value={type} className="cursor-pointer">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasUnsavedChanges && (
            <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={isResetting}
            className="cursor-pointer"
          >
            {isResetting ? 'Resetting...' : 'Reset'}
          </Button>

          <Button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Button variant="outline" onClick={onDemo} data-testid="demo-button" className="cursor-pointer">
            Demo
          </Button>

          <Button
            variant={isThemeSidebarOpen ? 'default' : 'outline'}
            onClick={onThemeToggle}
            className="cursor-pointer"
          >
            Theme
          </Button>
        </div>
      </div>
    </header>
  );
}
