'use client'
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

export default function WagerCard({ wage = {} }) {
    if (!wage || !wage.name) {
        return null; 
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {wage.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex">
                <div className="flex flex-col gap-1 w-1/2">
                    <span>- since {new Date(wage.created_at).toLocaleDateString()}</span>
                    <span>- ${wage.amount} on the line</span>
                    <span>- Status: {wage.status || 'pending'}</span>
                    <span>- Proof of Completion: {wage.llm_checker || ''}</span>
                </div>
                <div className="w-1/2 flex justify-end items-end">
                    <Button>edit</Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {wage.status === 'authorized' && (
                    <Button 
                        onClick={handleCancel}
                        variant="destructive"
                    >
                        Cancel Wager
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}