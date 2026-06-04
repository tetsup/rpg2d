import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './home';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element=<HomePage /> />
      </Routes>
    </BrowserRouter>
  );
}
