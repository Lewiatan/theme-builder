import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ThemeSettingsSidebarProps {
  onClose: () => void;
}

export function ThemeSettingsSidebar({ onClose }: ThemeSettingsSidebarProps) {
  return (
    <aside className="w-80 border-l bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Theme Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="space-y-6">
        {/* Colors section */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Colors</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="primary-color" className="text-xs text-gray-600">
                Primary Color
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  id="primary-color"
                  defaultValue="#3b82f6"
                  className="h-10 w-full cursor-pointer rounded border"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Coming soon</p>
            </div>

            <div>
              <Label htmlFor="secondary-color" className="text-xs text-gray-600">
                Secondary Color
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  id="secondary-color"
                  defaultValue="#6366f1"
                  className="h-10 w-full cursor-pointer rounded border"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Typography section */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Typography</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="font-family" className="text-xs text-gray-600">
                Font Family
              </Label>
              <select
                id="font-family"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                disabled
              >
                <option>Inter</option>
                <option>Roboto</option>
                <option>Open Sans</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Spacing section */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Spacing</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="base-spacing" className="text-xs text-gray-600">
                Base Spacing
              </Label>
              <input
                type="range"
                id="base-spacing"
                min="4"
                max="16"
                step="2"
                defaultValue="8"
                className="mt-2 w-full"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-gray-500">
            Theme customization features will be available in a future update.
          </p>
        </div>
      </div>
    </aside>
  );
}
