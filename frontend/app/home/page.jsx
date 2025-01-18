"use client"

import WagerCard from "@/components/ui/wagercard"
import NewWager from "@/components/ui/newwager"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import PayPalProvider from '@/components/providers/PayPalProvider'
async function getWages(user_id){
    const response = await fetch(`http://localhost:3001/get-wages/${user_id}`)
    const data = await response.json()
    return data
}

export default function home() {
    const router = useRouter()
    const [auth, setAuth] = useState(null)
    const [wages, setWages] = useState([])

    useEffect(() => {
        const authData = JSON.parse(localStorage.getItem('auth'))
        setAuth(authData)
        
        if (!authData) {
            router.push('/login')
            return
        }

        // Fetch wages only if authenticated
        async function fetchWages(){
            try{
                const data = await getWages(authData.user_id)
                setWages(data)
            } catch(error){
                console.error('Error fetching wages:', error)
            }
        }
        fetchWages()
    }, [router])

    useEffect(() => {
        const handleWagerUpdate = async () => {
            if (auth) {
                const data = await getWages(auth.user_id);
                setWages(data);
            }
        };

        window.addEventListener('wager-updated', handleWagerUpdate);
        return () => window.removeEventListener('wager-updated', handleWagerUpdate);
    }, [auth]);

    return (
        <PayPalProvider>
            <div className="min-h-screen w-screen">
                <header className="p-4 w-screen">
                    <span className="text-xl">BetOnGoals</span>
                </header>
                <div className="flex w-full flex-col justify-center items-center mt-8">
                    <h1 className="text-3xl text-ring">New day new you, right Brandon?</h1>
                    
                    <div className="flex justify-around w-full">
                        <div className="mt-12 w-full max-w-md">
                            <h2 className="text-center mb-2">Create New Wager</h2>
                            <NewWager
                                auth={auth}
                                onWagerCreated={() => {
                                    // Refresh wages when a new wager is created
                                    if (auth) {
                                        getWages(auth.user_id).then(setWages);
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 w-full max-w-md">
                            <h2 className="text-center mb-2">
                                Current Wagers
                            </h2>
                            <div className="flex flex-col gap-4">
                                {wages && wages.length > 0 ? (
                                    wages.map((wage, index) => (
                                        <WagerCard
                                            key={index}
                                            wage={wage}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">No wagers yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PayPalProvider>
    )
}
