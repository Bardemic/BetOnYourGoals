'use client'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({ children }) {
    const initialOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "authorize",
        components: "buttons",
        debug: true,
        'disable-funding': 'card,venmo,paylater'
    };

    console.log('PayPal Provider Options:', {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.substring(0, 10) + '...',
        hasClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    });

    return (
        <PayPalScriptProvider 
            options={initialOptions}
            deferLoading={false}
        >
            <div suppressHydrationWarning>
                {children}
            </div>
        </PayPalScriptProvider>
    );
} 