'use client'
import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function WagerCard({ wage: initialWage = {} }) {
    const [wage, setWage] = useState(initialWage);

    if (!wage || !wage.name) {
        return null; 
    }

    const handleSubmission = async () => {
        try {
            const response = await fetch('http://localhost:3001/submit-proof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wage_id: wage.wage_id }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit proof');
            }

            const data = await response.json();
            if (data.success) {
                // Update the wage state with the new completions
                setWage(prev => ({
                    ...prev,
                    completions: data.completions
                }));
            }
        } catch (error) {
            console.error('Error submitting proof:', error);
            alert('Failed to submit proof');
        }
    }

    const handleCancel = async () => {
        try {
            if (!wage.authorization_id) {
                throw new Error('No authorization ID found');
            }

            const response = await fetch('http://localhost:3001/void-authorization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authorizationId: wage.authorization_id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel wager');
            }

            // update ui
            alert('Wager cancelled successfully');
        } catch (error) {
            console.error('Error cancelling wager:', error);
            alert('Failed to cancel wager: ' + error.message);
        }
    };



    const isDateCompleted = (date) => {
        if (!wage.completions) return false;
        const dateStr = date.toISOString().split('T')[0];
        return wage.completions.includes(dateStr);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {wage.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex">
                <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-1/2">
                        <span>- since {new Date(wage.created_at).toLocaleDateString()}</span>
                        <span>- ${wage.amount} on the line</span>
                        <span>- Status: {wage.status || 'pending'}</span>
                        <span>- Proof of Completion: {wage.llm_checker || ''}</span>
                    </div>
                    <div className="w-1/2 flex flex-col justify-between">
                        <div className="grid grid-cols-7 gap-1">
                            {(() => {
                                const startDate = new Date(wage.created_at);
                                const today = new Date();
                                
                                // Calculate days between creation and today (inclusive)
                                const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                                // Show all days from creation to today
                                const daysToShow = Math.max(1, daysDiff);
                                
                                return [...Array(daysToShow)].map((_, index) => {
                                    const date = new Date(startDate);
                                    date.setDate(startDate.getDate() + index);
                                    const completed = isDateCompleted(date);
                                    
                                    return (
                                        <Card 
                                            key={index}
                                            className={`aspect-square cursor-pointer ${
                                                completed 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-card-foreground text-card'
                                            }`}
                                            title={date.toLocaleDateString()}
                                        >
                                            <CardContent className="p-0 h-full flex items-center justify-center text-xs">
                                                {date.getDate()}
                                            </CardContent>
                                        </Card>
                                    );
                                });
                            })()}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                            Progress
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {wage.status === 'authorized' && (
                    <>
                        <Button
                            onClick={handleCancel}
                            variant="destructive"
                        >
                            Cancel Wager
                        </Button>
                        <Button
                            onClick={handleSubmission}
                        >
                            Submit Proof
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}