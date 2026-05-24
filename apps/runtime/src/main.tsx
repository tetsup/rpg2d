import { createRoot } from 'react-dom/client';
import App from './App';

if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}
createRoot(document.getElementById('root')!).render(<App />);
