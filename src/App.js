import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoomPage from './components/JoinRoom/RoomPage';
import Room from './components/JoinRoom/Room';
import Home from './components/Landing/Home';
function App() {
  return (
    <>
      <div className='landing'>
        <Router>
          <Routes>
            <Route path='/' Component={Home}></Route>
          </Routes>
        </Router>
      </div>
      <div className='room'>
        <Router>
          <Routes>
            <Route path='/join' Component={RoomPage}></Route>
            <Route path='/room/:id' exact Component={Room}></Route>
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
