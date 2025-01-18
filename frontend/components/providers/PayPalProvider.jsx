'use client'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({ children }) {
    const initialOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "authorize",
        'enable-funding': 'paypal',
        'disable-funding': 'card,venmo,paylater'

    };

    return (
        <PayPalScriptProvider 
            options={initialOptions}
            deferLoading={false}
        >
            {children}
        </PayPalScriptProvider>
    );
} 