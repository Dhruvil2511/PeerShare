import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RoomPage from './components/JoinRoom/RoomPage';
import Room from './components/JoinRoom/Room';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* <Route path='/'><></></Route> */}
          <Route path='/join' Component={RoomPage}></Route>
          <Route path='/room/:id' exact Component={Room}></Route>
        </Routes>
      </Router>

    </div>
  );
}

export default App;
