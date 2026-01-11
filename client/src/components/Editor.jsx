import React, { useEffect, useState, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
import { initSocket } from '../services/socket';
import toast from 'react-hot-toast';
import ImageResize from 'quill-image-resize-module-react';

Quill.register('modules/imageResize', ImageResize);

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    ['image', 'blockquote', 'code-block'],
    ['clean'],
];

export default function Editor({ socketRef, roomId, onCodeChange, isCreated, isJoined, isReadOnly, onSaveStart, onSaveEnd }) {
    const [quill, setQuill] = useState();

    useEffect(() => {
        if (quill == null) return;
        if (isReadOnly) {
            quill.disable();
        } else {
            quill.enable();
        }
    }, [quill, isReadOnly]);

    useEffect(() => {
        console.log('[Editor] useEffect triggered', { socketRef: !!socketRef.current, quill: !!quill, isJoined, roomId, isCreated });

        if (socketRef.current == null || quill == null || !isJoined) return;

        const socket = socketRef.current;

        socket.once('load-document', (document) => {
            console.log('[Editor] load-document event received', document);
            quill.setContents(document);
            onCodeChange(quill.getContents(), quill.getText(), quill.root.innerHTML);
            if (!isReadOnly) {
                quill.enable();
            }
        });

        console.log('[Editor] Emitting get-document (Ready check passed)');
        socket.emit('get-document', { roomId, isCreated });

        socket.on('document-error', (msg) => {
            console.error('[Editor] document-error received:', msg);
            toast.error(msg);
            window.location.href = "/";
        });
    }, [quill, roomId, socketRef, isCreated, isJoined, isReadOnly]);

    useEffect(() => {
        if (socketRef.current == null || quill == null) return;
        const socket = socketRef.current;

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
            onCodeChange(quill.getContents(), quill.getText(), quill.root.innerHTML);
        };
        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        };
    }, [quill, socketRef, onCodeChange]);

    useEffect(() => {
        if (socketRef.current == null || quill == null) return;
        const socket = socketRef.current;

        const handler = (delta) => {
            quill.updateContents(delta);
            onCodeChange(quill.getContents(), quill.getText(), quill.root.innerHTML);
        };
        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        };
    }, [quill, socketRef, onCodeChange]);

    useEffect(() => {
        if (socketRef.current == null || quill == null) return;
        const socket = socketRef.current;

        const interval = setInterval(() => {
            if (onSaveStart) onSaveStart();
            socket.emit('save-document', quill.getContents());
            // Simulate brief delay for status feedback
            setTimeout(() => {
                if (onSaveEnd) onSaveEnd();
            }, 500);
        }, 5000); // 5 seconds for a more natural feel

        return () => {
            clearInterval(interval);
        };
    }, [quill, socketRef, onSaveStart, onSaveEnd]);

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;

        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);
        const q = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: TOOLBAR_OPTIONS,
                },
                imageResize: {
                    parchment: Quill.import('parchment'),
                    modules: ['Resize', 'DisplaySize', 'Toolbar']
                }
            },
        });
        q.disable();
        q.setText('Loading...');
        setQuill(q);
    }, []);

    useEffect(() => {
        // Force the toolbar into the specific container
        const toolbar = document.querySelector('.ql-toolbar');
        const container = document.getElementById('toolbar-container');
        if (toolbar && container && !container.contains(toolbar)) {
            container.appendChild(toolbar);
        }
    }, [quill]);

    return (
        <div
            className="container"
            ref={wrapperRef}
            onClick={() => quill && quill.focus()}
        ></div>
    );
}
