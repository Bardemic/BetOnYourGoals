'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function NewWager() {

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3001/add-wage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: '123', //add actual when auth
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    created_at: new Date().toISOString()
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create wage')
            }

            // Reset form
            setFormData({ name: '', amount: '' })
            //add refresh wage list code
        } catch (error) {
            console.error('Error creating wage:', error)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Wager</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
            <CardContent>
                    <div>
                        <Label>Wager Name</Label>
                        <Input type="text" name="name" value={formData.name} onChange={handleChange} />
                        <Label>Wager Amount</Label>
                        <Input type="number" name="amount" value={formData.amount} onChange={handleChange} />
                    </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Create Wager</Button>
            </CardFooter>
            </form>
        </Card>
    )
  
}