import { useState } from 'react';
import { useStore } from '../store';

export function BrowserUseControls() {
  const browserSession = useStore(s => s.browserSession);
  const executeBrowserAction = useStore(s => s.executeBrowserAction);
  const takeScreenshot = useStore(s => s.takeBrowserScreenshot);

  const [actionType, setActionType] = useState('navigate');
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [text, setText] = useState('');
  const [script, setScript] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      let action: any = { type: actionType };

      switch (actionType) {
        case 'navigate':
          action.url = url;
          break;
        case 'click':
        case 'fill':
        case 'scrape':
        case 'wait':
        case 'extract':
          action.selector = selector;
          if (actionType === 'fill') {
            action.value = text;
          }
          break;
        case 'evaluate':
          action.script = script;
          break;
        case 'screenshot':
          action.fullPage = false;
          break;
      }

      const res = await executeBrowserAction(action);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleScreenshot = async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      const screenshot = await takeScreenshot();
      setResult({ type: 'screenshot', data: screenshot });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="browser-use-controls">
      <div className="browser-controls-header">
        <h3>Browser Automation</h3>
        {browserSession && (
          <span className="browser-session-info">
            Session: {browserSession.id}
          </span>
        )}
      </div>

      <div className="browser-controls-content">
        <div className="action-selector">
          <label>Action Type</label>
          <select
            value={actionType}
            onChange={e => setActionType(e.target.value)}
            className="action-select"
          >
            <option value="navigate">Navigate</option>
            <option value="click">Click Element</option>
            <option value="fill">Fill Input</option>
            <option value="scrape">Scrape Content</option>
            <option value="wait">Wait For Element</option>
            <option value="evaluate">Execute JavaScript</option>
            <option value="extract">Extract Data</option>
            <option value="screenshot">Take Screenshot</option>
          </select>
        </div>

        <div className="action-parameters">
          {actionType === 'navigate' && (
            <div className="param-group">
              <label>URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="param-input"
              />
            </div>
          )}

          {(actionType === 'click' || actionType === 'fill' || 
            actionType === 'scrape' || actionType === 'wait' || 
            actionType === 'extract') && (
            <div className="param-group">
              <label>CSS Selector</label>
              <input
                type="text"
                value={selector}
                onChange={e => setSelector(e.target.value)}
                placeholder="#element-id or .class-name"
                className="param-input"
              />
            </div>
          )}

          {actionType === 'fill' && (
            <div className="param-group">
              <label>Value</label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Text to fill"
                className="param-input"
              />
            </div>
          )}

          {actionType === 'evaluate' && (
            <div className="param-group">
              <label>JavaScript Code</label>
              <textarea
                value={script}
                onChange={e => setScript(e.target.value)}
                placeholder="document.title"
                className="param-textarea"
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="execute-btn"
          >
            {isExecuting ? 'Executing...' : 'Execute'}
          </button>
          <button
            onClick={handleScreenshot}
            disabled={isExecuting}
            className="screenshot-btn"
          >
            {isExecuting ? 'Capturing...' : 'Quick Screenshot'}
          </button>
        </div>

        {error && (
          <div className="action-error">
            <span className="error-icon">❌</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {result && (
          <div className="action-result">
            <h4>Result</h4>
            {result.type === 'screenshot' ? (
              <img
                src={`data:image/png;base64,${result.data}`}
                alt="Screenshot"
                className="result-screenshot"
              />
            ) : (
              <pre className="result-json">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
