import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './index.css';
import { DependencyGraph } from './components/dependency-graph';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <DependencyGraph />
      </ReactFlowProvider>
    </div>
  </React.StrictMode>
);
