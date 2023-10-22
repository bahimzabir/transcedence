import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
    Profile,
    Landing,
    Chat,
    ViewProfile,
    GameMode,
    Dashboard,
    Challenge,
    Practice,
    Error404,
} from "./Pages/index";
import "./App.css";
import Game from "./Game/Game";
import { setOnline, recieveNotification } from "./components/mainGateway";
import { ToastContainer } from "react-toastify";
import RouteProtector from "./auth";
import VerifyLogin from "./components/VerifyLogin";
import JwtRouteProtector from "./authjwt";
import LandinRouteProtector from "./authhome";
const App = () => {
    setOnline();
    recieveNotification();
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<LandinRouteProtector />} >
          <Route path="/" element= {<VerifyLogin />} />
        </Route>        <Route element={<JwtRouteProtector />} >
        <Route path="/verify" element= {<VerifyLogin />} />
        </Route>
        <Route element={<RouteProtector />} >
            <Route path="/profile" element= {<Profile />}/>
            <Route path="/gamemode" element= {<GameMode /> }/>
            <Route path="/game" element= {<Game />}/>
            <Route path="/challenge" element= {<Challenge />}/>
            <Route path="/practice" element= {<Practice />}/>
            <Route path="/home" element= { <Dashboard /> }/>
            <Route path="/view-profile" element={<ViewProfile />} />
            <Route path="/chat" element= {<Chat />} />
        </Route>
        <Route path="/*" element={<Error404 />} />      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
