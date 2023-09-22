import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomPage from './components/JoinRoom/RoomPage';
import Room from './components/JoinRoom/Room';
import Home from './components/Landing/Home';
import About from './components/Landing/About';
import FAQ from './components/Landing/FAQ';
function App() {
  return (
    <>
      <div className='room'>
        <Router>
          <Routes>
            <Route path='/' Component={Home}></Route>
            <Route path='/about' Component={About}></Route>
            <Route path='/faq' Component={FAQ}></Route>
            <Route path='/join' Component={RoomPage}></Route>
            <Route path='/room/:id' exact Component={Room}></Route>
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
