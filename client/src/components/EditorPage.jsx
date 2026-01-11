import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Client from './Client';
import Editor from './Editor';
import ThemeToggle from './ThemeToggle';
import { initSocket } from '../services/socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = ({ theme, toggleTheme }) => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const textRef = useRef("");
    const htmlRef = useRef("");
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [docTitle, setDocTitle] = useState("Untitled Document");
    const [saveStatus, setSaveStatus] = useState("All changes saved");
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }


            // Listening for joined event
            socketRef.current.on('joined', ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the Space.`);
                }
                setClients(clients);
                setIsJoined(true);
            });

            // Listening for join-error event
            socketRef.current.on('join-error', (err) => {
                toast.error(err);
                reactNavigator('/');
            });

            // Listening for disconnected
            socketRef.current.on('disconnected', ({ socketId, username }) => {
                toast.success(`${username} left the Space.`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });

            // Emit join AFTER listeners are ready
            console.log('[EditorPage] Emitting join', { roomId, username: location.state?.username });
            socketRef.current.emit('join', {
                roomId,
                username: location.state?.username,
                isCreated: location.state?.isCreated,
            });
        };
        init();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off('joined');
                socketRef.current.off('disconnected');
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Space ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Space ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    async function downloadFile() {
        try {
            const response = await fetch('http://localhost:3001/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: htmlRef.current,
                    title: docTitle
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTitle.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("File downloaded as .docx!");
        } catch (error) {
            console.error('Download error:', error);
            toast.error(`Could not generate .docx file: ${error.message}`);
        }
    }

    function handleSave() {
        if (socketRef.current && codeRef.current) {
            setSaveStatus("Saving...");
            socketRef.current.emit('save-document', codeRef.current);
            setTimeout(() => {
                setSaveStatus("All changes saved");
                toast.success("Document saved successfully!");
            }, 1000);
        }
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className={`mainWrap ${!isSidebarVisible ? 'sidebar-hidden' : ''}`}>
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/doc-world.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy SPACE ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <div
                    className="topBarContainer"
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-color)',
                    }}
                >
                    <div
                        className="editorHeader"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 20px',
                            height: '60px'
                        }}
                    >
                        <div className="headerLeft" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button
                                className="btn sidebarToggle"
                                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                                title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                            >
                                {isSidebarVisible ? '◂' : '▸'}
                            </button>
                            <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="docTitleInput"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-color)',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    width: '250px'
                                }}
                            />
                            <span className="saveStatus" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                {saveStatus}
                            </span>
                        </div>
                        <div className="headerRight" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                className={`btn modeToggleBtn ${isReadOnly ? 'active' : ''}`}
                                onClick={() => setIsReadOnly(!isReadOnly)}
                            >
                                {isReadOnly ? 'View Mode' : 'Edit Mode'}
                            </button>
                            <button
                                className="btn saveBtn"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            <button
                                className="btn downloadBtn"
                                onClick={downloadFile}
                            >
                                Download as .Docx
                            </button>
                        </div>
                    </div>
                    {/* Dedicated container for Quill Toolbar */}
                    <div id="toolbar-container"></div>
                </div>
                <div className="scrollCanvas">
                    <div
                        className="documentPage"
                        onClick={() => document.querySelector('.ql-editor')?.focus()}
                    >
                        <Editor
                            socketRef={socketRef}
                            roomId={roomId}
                            onCodeChange={(code, text, html) => {
                                codeRef.current = code;
                                textRef.current = text;
                                htmlRef.current = html;
                            }}
                            isCreated={location.state?.isCreated}
                            isJoined={isJoined}
                            isReadOnly={isReadOnly}
                            onSaveStart={() => setSaveStatus("Saving...")}
                            onSaveEnd={() => setSaveStatus("All changes saved")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
