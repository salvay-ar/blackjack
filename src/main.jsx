import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Inicio from './Inicio.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <Routes>
        <Route path={"/"} element={<Inicio/>}></Route>
        <Route path={"/juego"} element={<App/>}></Route>

    </Routes>
    </BrowserRouter>
)
