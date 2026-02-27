import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGenerator({ value, size = 200 }) {
    const [src, setSrc] = useState('');

    useEffect(() => {
        if (value) {
            QRCode.toDataURL(value, { width: size, margin: 2 })
                .then(url => setSrc(url))
                .catch(err => {
                    console.error('QRCode generation error', err);
                    setSrc('');
                });
        }
    }, [value, size]);

    if (!value) return null;
    return <img src={src} alt="QR Code" width={size} height={size} />;
}
