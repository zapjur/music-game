import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Game from './pages/Game'
import Callback from './pages/Callback'

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/game" element={<Game />} />
            <Route path="/" element={<Game />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="*" element={<div>404 – Nie znaleziono</div>} />
        </Routes>
    )
}
