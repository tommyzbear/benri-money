import { QRCodeCanvas } from 'qrcode.react';
import { PaymentRequest } from '@/types/data';
import { formatEther, parseEther } from 'viem';

interface PaymentRequestQRProps {
    request: PaymentRequest;
}

export function PaymentRequestQR({ request }: PaymentRequestQRProps) {
    // For local development:
    const qrData = JSON.stringify(request);

    // Later in production:
    // const qrData = `wanderer://payment-request/${request.id}`;

    return (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg">
            <QRCodeCanvas
                value={qrData}
                size={256}
                level="H"
                includeMargin
                className="rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
                Scan to pay {formatEther(request.amount)} {request.token_name}
            </p>
        </div>
    );
}