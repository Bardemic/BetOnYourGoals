'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export default function NewWager({auth, onWagerCreated}) {
    const [{ isResolved, isPending }] = usePayPalScriptReducer();
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        llm_checker: '',
        frequency: 'once',
        frequency_unit: 'day'
    })
    const [showPayPal, setShowPayPal] = useState(false)
    const [error, setError] = useState(null)
    const [llmChecker, setLlmChecker] = useState('')

    const createOrder = async (data, actions) => {
        try {
            console.log('Creating order with amount:', formData.amount);
            
            const amount = parseFloat(formData.amount);
            if (!amount || isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount greater than 0');
            }

            const response = await fetch('http://localhost:3001/create-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount.toFixed(2) // Ensure proper decimal formatting
                }),
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                console.error('Server error response:', responseData);
                throw new Error(responseData.details || responseData.error || 'Server error');
            }

            console.log('Order created:', responseData);
            
            if (!responseData.orderId) {
                throw new Error('No order ID received from server');
            }

            return responseData.orderId;
        } catch (error) {
            console.error('Error creating PayPal order:', {
                message: error.message,
                error: error
            });
            setError(`Failed to create order: ${error.message}`);
            throw error;
        }
    };

    const onApprove = async (data, actions) => {
        try {
            const response = await fetch('http://localhost:3001/authorize-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderID: data.orderID
                }),
            });

            const authData = await response.json();
            if (authData.status === "COMPLETED" || authData.status === "CREATED") {
                await handleWagerCreation(authData.authorizationId);
            } else {
                throw new Error('Authorization not completed');
            }
        } catch (error) {
            console.error('Error authorizing PayPal order:', error);
            setError('Failed to authorize payment');
        }
    };

    const onError = (err) => {
        console.error('PayPal error details:', {
            message: err.message,
            stack: err.stack,
            details: err
        });
        setError(`PayPal error: ${err.message || 'Unknown error'}`);
    };

    const onCancel = (data) => {
        console.log('Payment cancelled:', data);
        setError('Payment was cancelled');
    };

    const handleWagerCreation = async (authorizationId) => {
        try {
            const response = await fetch('http://localhost:3001/add-wage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: auth.user_id,
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    authorization_id: authorizationId,
                    llm_checker: llmChecker,
                    frequency: formData.frequency,
                    frequency_unit: formData.frequency_unit
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create wage');
            }

            setFormData({ name: '', amount: '', llm_checker: '' });
            setShowPayPal(false);
            setError(null);
            
            if (onWagerCreated) {
                onWagerCreated();
            }
        } catch (error) {
            console.error('Error creating wage:', error);
            setError('Failed to create wager');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted, showing PayPal');
        setError(null)
        if (formData.name && formData.amount) {
            setShowPayPal(true)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else if (name === 'llm_checker') {
            setLlmChecker(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    useEffect(() => {
        console.log('PayPal Script Status:', { isResolved, isPending });
    }, [isResolved, isPending]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Wager</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label>Wager Name</Label>
                            <Input 
                                type="text" 
                                placeholder="Go to the gym 3 times a week"
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div>
                            <Label>Wager Amount ($)</Label>
                            <Input 
                                type="number" 
                                name="amount" 
                                placeholder="10"
                                value={formData.amount} 
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <Label>Proof of Completion</Label>
                            <Input 
                                type="text" 
                                name="llm_checker" 
                                placeholder="a selfie of me at the gym"
                                value={llmChecker} 
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <div className="flex gap-2 items-center">
                                Check
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" type="button">
                                            {formData.frequency}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency: 'once' }))} >once</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency: 'twice' }))} >twice</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency: '3x' }))} >3x</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency: '4x' }))} >4x</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                a
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" type="button">
                                            {formData.frequency_unit}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency_unit: 'day' }))} >day</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency_unit: 'week' }))} >week</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFormData(prev => ({ ...prev, frequency_unit: 'month' }))} >month</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    {!showPayPal ? (
                        <Button type="submit">Proceed to Payment</Button>
                    ) : (
                        <>
                            <div className="w-full">
                                {isPending ? (
                                    <div className="text-center py-4">
                                        <p>Loading PayPal...</p>
                                    </div>
                                ) : isResolved ? (
                                    <PayPalButtons
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={onError}
                                        onCancel={onCancel}
                                        style={{ 
                                            layout: "horizontal",
                                            shape: "rect",
                                            color: "gold",
                                            tagline: false
                                        }}
                                        forceReRender={[formData.amount]}
                                    />
                                ) : (
                                    <div className="text-red-500 text-center py-4">
                                        <p>Failed to load PayPal</p>
                                    </div>
                                )}
                            </div>
                            <Button 
                                type="button" 
                                onClick={() => setShowPayPal(false)}
                                variant="outline"
                            >
                                Back
                            </Button>
                        </>
                    )}
                </CardFooter>
            </form>
        </Card>
    )
}