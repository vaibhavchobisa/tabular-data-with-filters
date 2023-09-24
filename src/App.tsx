import React from 'react';
import {
  Routes,
  Route,
} from 'react-router-dom';

import Home from './components/home.component';

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
};

export default App;
