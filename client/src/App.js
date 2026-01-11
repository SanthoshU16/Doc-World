// Forced Refresh: 2026-01-10T17:15:00Z
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import './styles.css';

function App() {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'dark'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <>
            <div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4A9EED',
                            },
                        },
                    }}
                />
            </div>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Home theme={theme} toggleTheme={toggleTheme} />}
                    ></Route>
                    <Route
                        path="/editor/:roomId"
                        element={
                            <EditorPage
                                theme={theme}
                                toggleTheme={toggleTheme}
                            />
                        }
                    ></Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
