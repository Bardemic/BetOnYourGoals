"use client"

import { useRouter } from 'next/navigation'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(email === '' || password === '') {
            console.log('Please fill out all fields')
            return
        }
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to login')
            }

            const data = await response.json()

            if(data.user){
                localStorage.setItem('auth', JSON.stringify(data.user))
                console.log(data)
                setEmail('')
                setPassword('')
                router.push('/home')
            }
            
        } catch (error) {
            console.error('Error logging in:', error)
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-xl">Login</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent>
                        <div className="grid gap-4">
                            <div>
                                <Label>Email</Label>
                                <Input id="email" placeholder="PrettyHorse123@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input id="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button className="w-1/2">Login</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}