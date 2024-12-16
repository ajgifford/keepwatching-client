import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navigation from './navigation/navigation';
import Discover from './pages/discover';
import Home from './pages/home';
import ManageFamily from './pages/manageFamily';
import Movies from './pages/movies';
import ShowSeasons from './pages/showSeasons';
import Shows from './pages/shows';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/shows/:id" element={<ShowSeasons />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/manageFamily" element={<ManageFamily />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
