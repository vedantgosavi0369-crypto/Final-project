import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onDecode, onError, qrboxSize = 250 }) {
    const qrRef = useRef(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        const config = {
            fps: 10,
            qrbox: { width: qrboxSize, height: qrboxSize }
        };
        scannerRef.current = new Html5Qrcode(qrRef.current.id);
        scannerRef.current
            .start({ facingMode: 'environment' }, config,
                (decoded) => {
                    onDecode(decoded);
                },
                (err) => {
                    if (onError) onError(err);
                }
            )
            .catch(err => {
                console.error('QR scanner start error', err);
                if (onError) onError(err);
            });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(e => console.warn('stop failed', e));
            }
        };
    }, []);

    return <div id="qr-scanner-container" ref={qrRef} style={{ width: qrboxSize, height: qrboxSize }} />;
}
