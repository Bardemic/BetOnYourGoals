"use client"
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

export default function signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(email === '' || password === '' || name === '') {
            console.log('Please fill out all fields')
            return
        }
        try {
            const response = await fetch('http://localhost:3001/signup', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username: name })
            })
            if (!response.ok) {
                throw new Error('Failed to sign up')
            }
            setEmail('')
            setPassword('')
            setName('')
        } catch (error) {
            console.error('Error signing up:', error)
        }
    }
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="grid gap-4">
                            <div>
                                <Label>Email</Label>
                                <Input id="email" placeholder="horsetown@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
                            </div>
                            <div>
                                <Label>Username</Label>
                                <Input id="name" placeholder="PrettyHorse123" value={name} onChange={(e) => setName(e.target.value)}></Input>
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input id="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button className="w-1/2" type="submit">Sign Up</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}