import WagerCard from "@/components/ui/wagercard"
import NewWager from "@/components/ui/newwager"

export default function home() {
    return (
        <div className="min-h-screen w-screen">
            <header className="p-4 w-screen">
                <span className="text-xl">BetOnGoals</span>
            </header>
            <div className="flex w-1/2 flex-col justify-center items-center mt-8">
                <h1 className="text-3xl text-ring">New day new you, right Brandon?</h1>
                
                <div className="mt-12 w-full max-w-md">
                    <h2 className="text-center mb-2">Create New Wager</h2>
                    <NewWager></NewWager>
                </div>
                <div className="mt-4">
                    <h2 className="text-center mb-2">
                        Current Wagers
                    </h2>
                    <div className="flex flex-col justify-stretch min-w-96">
                        <WagerCard title="Workout 3x a Week" date="01/05/2025" money="25"></WagerCard>
                    </div>
                </div>
            </div>
        </div>
    )
}