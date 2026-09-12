import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio render crash:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', color: '#ff6b6b', background: '#0f0505', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '22px', marginBottom: '10px' }}>⚠️ Studio Render Error</h1>
          <p style={{ fontSize: '14px', color: '#fff' }}>{this.state.error?.toString()}</p>
          <pre style={{ marginTop: '20px', padding: '15px', background: '#1c0a0a', color: '#fca5a5', overflow: 'auto', borderRadius: '8px' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Catch any global uncaught script errors
window.addEventListener('error', (e) => {
  console.error('Global window error:', e);
  const root = document.getElementById('root');
  if (root && (!root.children || root.children.length === 0)) {
    root.innerHTML = `
      <div style="padding:30px;color:#ff6b6b;background:#0f0505;min-height:100vh;font-family:monospace">
        <h1 style="font-size:22px;margin-bottom:10px">⚠️ Global Script Error</h1>
        <p style="font-size:14px;color:#fff">${e.message}</p>
        <p style="color:#aaa">${e.filename}:${e.lineno}:${e.colno}</p>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in document');
}

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
