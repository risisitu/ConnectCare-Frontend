import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './VideoCall.css';

// Socket.IO server URL - adjust if backend runs on a different port
const SOCKET_URL = 'http://localhost:3000';

interface User {
    id: string;
    username: string;
}

interface IncomingCall {
    from: string;
    offer: RTCSessionDescriptionInit;
    username: string;
}

interface VideoCallProps {
    isModal?: boolean;
    localUser?: { id: string; name: string };
    targetUser?: { id: string; name: string };
    onClose?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ isModal, localUser, targetUser, onClose }) => {
    // State
    const [username, setUsername] = useState(localUser?.name || '');
    const [isRegistered, setIsRegistered] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [callStatus, setCallStatus] = useState<string>('Disconnected');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [mySocketId, setMySocketId] = useState<string>('');
    const [remoteUsername, setRemoteUsername] = useState<string>('Remote User');

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // ICE Servers
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL);

        const socket = socketRef.current;

        socket.on('connect', () => {
            setCallStatus('Connected to Server');
            if (localUser) {
                registerUser(localUser.name, localUser.id);
            }
        });

        socket.on('disconnect', () => {
            setCallStatus('Disconnected');
        });

        socket.on('socket-id', (id: string) => {
            setMySocketId(id);
        });

        socket.on('user-joined', (data: { userId: string; username: string; users: User[] }) => {
            setOnlineUsers(data.users);
            // Auto call if target user just joined and we are waiting
        });

        socket.on('user-left', (data: { userId: string; users: User[] }) => {
            setOnlineUsers(data.users);
            // If the connected user left, close connection
            if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== 'closed') { // Simplified check
                // We might want to check if the specific user who left was the one we were talking to
                // But for now, we leave it to the connection state change handler or manual hangup
            }
        });

        socket.on('offer', (data: IncomingCall) => {
            setIncomingCall(data);
        });

        socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                } catch (err) {
                    console.error('Error setting remote description:', err);
                }
            }
        });

        socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate:', err);
                }
            }
        });

        socket.on('call-declined', () => {
            alert('Call declined');
            cleanupCall();
        });

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []); // Run once on mount

    // Auto-call effect
    useEffect(() => {
        if (isRegistered && targetUser && onlineUsers.length > 0) {
            // Find target user in online list (by userId if available, or name?)
            // The backend storage uses socket ID as key but stores userId.
            // onlineUsers comes from values(users), so it has {id(socket), userId, username}
            const target = onlineUsers.find(u => (u as any).userId === targetUser.id || u.username === targetUser.name);
            if (target) {
                // Check if already calling?
                // startCall(target.id, target.username); // This might trigger too often
            }
        }
    }, [isRegistered, targetUser, onlineUsers]);

    const getMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Could not access camera/microphone');
            return null;
        }
    };

    const createPeerConnection = (userId: string) => {
        const pc = new RTCPeerConnection(iceServers);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    to: userId,
                    from: mySocketId,
                    candidate: event.candidate
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                // Handle cleanup if needed
                console.log("Connection state change:", pc.connectionState);
            }
        }

        peerConnectionRef.current = pc;
        return pc;
    };

    // Modified register to accept optional explicit params
    const registerUser = (nameStr: string = username, userIdStr?: string) => {
        if (nameStr.trim() && socketRef.current) {
            // Send object if userId exists
            if (userIdStr) {
                socketRef.current.emit('register-user', { username: nameStr, userId: userIdStr });
            } else {
                socketRef.current.emit('register-user', nameStr);
            }
            setIsRegistered(true);
            getMediaStream();
        }
    };

    const startCall = async (targetSocketId: string, targetUsername: string) => {
        const pc = createPeerConnection(targetSocketId);
        setRemoteUsername(targetUsername);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (socketRef.current) {
                socketRef.current.emit('offer', {
                    to: targetSocketId,
                    from: mySocketId,
                    offer: offer,
                    username: username
                });
            }
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    };

    const acceptCall = async () => {
        if (!incomingCall || !socketRef.current) return;

        const pc = createPeerConnection(incomingCall.from);
        setRemoteUsername(incomingCall.username);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current.emit('answer', {
                to: incomingCall.from,
                from: mySocketId,
                answer: answer
            });

            setIncomingCall(null);
        } catch (err) {
            console.error('Error accepting call:', err);
        }
    };

    const declineCall = () => {
        if (!incomingCall || !socketRef.current) return;

        socketRef.current.emit('call-declined', {
            to: incomingCall.from,
            from: mySocketId
        });
        setIncomingCall(null);
    };

    const cleanupCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        setRemoteUsername('Remote User');
    };

    const hangUp = () => {
        cleanupCall();
        if (onClose) {
            onClose(); // Close modal if provided
        } else {
            window.location.reload();
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    // Helper to find target user from online list
    const findTargetUser = () => {
        if (!targetUser) return null;
        // Search by userId first, then username
        return onlineUsers.find(u => (u as any).userId === targetUser.id || u.username === targetUser.name);
    };

    return (
        <div className={`video-call-container ${isModal ? 'h-full rounded-none' : ''}`}>
            {!isRegistered && !localUser ? (
                <div className="setup-section">
                    <h2>Join Video Call</h2>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={() => registerUser()}>Join</button>
                </div>
            ) : (
                <div className="video-section">
                    <div className="status-bar">
                        <span>Status: {callStatus}</span>
                        <span>Logged in as: <strong>{username}</strong></span>
                        {targetUser && (
                            <span className="ml-4">
                                Target: <strong>{targetUser.name}</strong>
                                {findTargetUser() ? ' (Online)' : ' (Offline)'}
                            </span>
                        )}
                    </div>

                    <div className="main-area">
                        <div className="videos-container">
                            <div className="video-wrapper">
                                <video ref={localVideoRef} autoPlay muted playsInline />
                                <span className="video-label">You ({username})</span>
                            </div>
                            <div className="video-wrapper">
                                <video ref={remoteVideoRef} autoPlay playsInline />
                                <span className="video-label">{remoteUsername}</span>
                            </div>
                        </div>

                        <div className="sidebar">
                            <div className="sidebar-header">Online Users</div>
                            <div className="users-list">
                                {onlineUsers.filter(u => u.id !== mySocketId).map(user => (
                                    <div key={user.id} className="user-item">
                                        <div className="flex flex-col">
                                            <span>{user.username}</span>
                                            {(user as any).userId && <span className="text-xs text-gray-500">{(user as any).userId}</span>}
                                        </div>
                                        <button className="call-btn" onClick={() => startCall(user.id, user.username)}>Call</button>
                                    </div>
                                ))}
                                {onlineUsers.length <= 1 && <div style={{ padding: '1rem', color: '#666' }}>No other users online</div>}
                            </div>
                        </div>
                    </div>

                    <div className="controls-bar">
                        <button
                            className={`control-btn ${!isAudioEnabled ? 'active' : ''}`}
                            onClick={toggleAudio}
                            title="Toggle Audio"
                        >
                            {isAudioEnabled ? '🔊' : '🔇'}
                        </button>
                        <button
                            className={`control-btn ${!isVideoEnabled ? 'active' : ''}`}
                            onClick={toggleVideo}
                            title="Toggle Video"
                        >
                            {isVideoEnabled ? '📹' : '🚫'}
                        </button>
                        <button
                            className="control-btn danger"
                            onClick={hangUp}
                            title="Hang Up"
                        >
                            📞
                        </button>
                    </div>
                </div>
            )}

            {incomingCall && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Incoming Call...</h2>
                        <p>{incomingCall.username} is calling you.</p>
                        <div className="modal-actions">
                            <button className="modal-btn accept" onClick={acceptCall}>
                                <span>✓</span> Accept
                            </button>
                            <button className="modal-btn decline" onClick={declineCall}>
                                <span>✕</span> Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
