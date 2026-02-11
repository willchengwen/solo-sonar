'use client';

import { useState, useEffect, useCallback } from 'react';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [noteColor, setNoteColor] = useState('var(--accent)');

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleNotify = useCallback(() => {
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes('@')) {
            setNoteColor('var(--warm)');
            setNote('Please enter a valid email');
            return;
        }
        setNoteColor('var(--accent)');
        setNote("You're on the list! We'll notify you when accounts launch.");
        setEmail('');
        setTimeout(() => {
            onClose();
            setNote('');
        }, 2500);
    }, [email, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${isOpen ? 'open' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="modal">
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-icon">🔑</div>
                <h3 className="modal-title">Accounts are coming soon</h3>
                <p className="modal-desc">
                    We&apos;re building user accounts with personal bookshelves, follow curators, and more.
                    Leave your email and we&apos;ll let you know when it&apos;s ready.
                </p>
                <div className="modal-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="modal-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNotify(); }}
                    />
                    <button className="modal-btn" onClick={handleNotify}>Notify Me</button>
                </div>
                <p className="modal-note" style={{ color: noteColor }}>{note}</p>
            </div>
        </div>
    );
}
