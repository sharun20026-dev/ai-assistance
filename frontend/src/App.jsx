import { Routes, Route } from "react-router-dom";
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/chat" element={<Chatpage />} />
    </Routes>
  );
}

export default App;