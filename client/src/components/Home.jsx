import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Home = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isCreated, setIsCreated] = useState(false);

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        setIsCreated(true);
        toast.success('Created a new Space');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('SPACE ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
                isCreated,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">
            <ThemeToggle
                theme={theme}
                toggleTheme={toggleTheme}
                style={{ position: 'fixed', top: '20px', right: '20px' }}
            />
            <div className="formWrapper">
                <img
                    className="homePageLogo"
                    src="/doc-world.png"
                    alt="doc-world-logo"
                />
                <h4 className="mainLabel">Paste invitation SPACE ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="SPACE ID"
                        onChange={(e) => {
                            setRoomId(e.target.value);
                            setIsCreated(false);
                        }}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a href="" onClick={createNewRoom} className="createNewBtn">
                            new Space
                        </a>
                    </span>
                </div>
            </div>

        </div>
    );
};

export default Home;
