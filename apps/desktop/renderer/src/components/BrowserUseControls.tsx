// ============================================================================
// Browser Use Controls - Browser automation controls
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  Globe,
  MousePointer,
  Type,
  Camera,
  Search,
  Play,
  Square,
  RotateCw,
} from 'lucide-react';

export function BrowserUseControls() {
  const {
    executeBrowserAction,
    isBrowserActionRunning,
    currentUrl,
    navigateTo,
  } = useStore();

  const [url, setUrl] = useState(currentUrl || '');
  const [selector, setSelector] = useState('');
  const [text, setText] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleNavigate = async () => {
    if (url) {
      setActiveAction('navigate');
      await navigateTo(url);
      setActiveAction(null);
    }
  };

  const handleClick = async () => {
    if (selector) {
      setActiveAction('click');
      await executeBrowserAction({
        type: 'click',
        selector,
      });
      setActiveAction(null);
    }
  };

  const handleFill = async () => {
    if (selector && text) {
      setActiveAction('fill');
      await executeBrowserAction({
        type: 'fill',
        selector,
        text,
      });
      setActiveAction(null);
    }
  };

  const handleScreenshot = async () => {
    setActiveAction('screenshot');
    await executeBrowserAction({
      type: 'screenshot',
    });
    setActiveAction(null);
  };

  const handleScrape = async () => {
    setActiveAction('scrape');
    await executeBrowserAction({
      type: 'scrape',
      selector: selector || 'body',
    });
    setActiveAction(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">
          Browser Automation
        </h2>
        {isBrowserActionRunning && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-300">Navigation</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleNavigate}
            disabled={!url || activeAction === 'navigate'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Go
          </button>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Click Action */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <MousePointer className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-300">Click Element</h3>
          </div>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="CSS selector (e.g., #button, .class)"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
          />
          <button
            onClick={handleClick}
            disabled={!selector || activeAction === 'click'}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MousePointer className="w-4 h-4" />
            Click
          </button>
        </div>

        {/* Fill Action */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-medium text-gray-300">Fill Input</h3>
          </div>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="CSS selector"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text to fill"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
          />
          <button
            onClick={handleFill}
            disabled={!selector || !text || activeAction === 'fill'}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Type className="w-4 h-4" />
            Fill
          </button>
        </div>

        {/* Screenshot Action */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-300">Screenshot</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Take a screenshot of the current page
          </p>
          <button
            onClick={handleScreenshot}
            disabled={activeAction === 'screenshot'}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Take Screenshot
          </button>
        </div>

        {/* Scrape Action */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-medium text-gray-300">Scrape Content</h3>
          </div>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="CSS selector (default: body)"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
          />
          <button
            onClick={handleScrape}
            disabled={activeAction === 'scrape'}
            className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Scrape
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h3 className="text-sm font-medium text-blue-300 mb-2">
          💡 Tips
        </h3>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• Use CSS selectors to target elements (e.g., #id, .class, tag)</li>
          <li>• Browser actions require approval for security</li>
          <li>• Screenshots are saved to the workspace</li>
          <li>• Scrape content extracts text from the page</li>
        </ul>
      </div>
    </div>
  );
}
