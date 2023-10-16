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
} from "./Pages/index";
import "./App.css";
import Game from "./Game/Game";
import { setOnline, recieveNotification } from "./components/mainGateway";
import { ToastContainer } from "react-toastify";
import RouteProtector from "./auth";

const App = () => {
    setOnline();
    recieveNotification();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                    path="/profile"
                    element={
                        <RouteProtector>
                            <Profile />
                        </RouteProtector>
                    }
                />
                <Route
                    path="/gamemode"
                    element={
                        <RouteProtector>
                            <GameMode />
                        </RouteProtector>
                    }
                />
                <Route
                    path="/game"
                    element={
                        <RouteProtector>
                            <Game />
                        </RouteProtector>
                    }
                />
                <Route path="/challenge" element={<Challenge />} />
                <Route path="/practice" element={<Practice />}/>
                <Route
                    path="/home"
                    element={
                        <RouteProtector>
                            <Dashboard />
                        </RouteProtector>
                    }
                />
                <Route
                    path="/view-profile"
                    element={
                        <RouteProtector>
                            <ViewProfile />
                        </RouteProtector>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <RouteProtector>
                            <Chat />
                        </RouteProtector>
                    }
                />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
};

export default App;
