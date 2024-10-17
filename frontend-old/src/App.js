import { Container } from 'react-bootstrap'
import Header from './components/Header'
import Footer from './components/Footer'
//import GoogleChart from './screens/GoogleChart';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import RecordScreen from './screens/RecordScreen';
import TestScreen from './screens/TestScreen';

//import './App.css';

function App() {
  return (
    
    <Router>
      <Header />
      <Routes>
      <Route path="/" Component={TestScreen} />
      <Route path="/home" Component={TestScreen} />
        <Route path="/record" Component={RecordScreen} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
