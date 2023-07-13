import { DashBoard, Login, Register } from "./pages/index";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="*" element={<center>
          <h1>Page Not Found</h1>
        </center>}/>
      </Routes>
    </div>
  );
}

export default App;
