export default function Home() {
  return (
    <main className="h-screen bg-card flex">
      <div className="p-4 flex-col h-1/2 w-1/2 items-center justify-end flex">
        <span className="text-6xl text-primary">BetOnGoals</span>
        <span className="text-xl text-foreground">Complete your tasks or lose your cash</span>
      </div>
      <div className="p-4 flex-col h-full w-1/2 justify-end flex">
        <div className="p-8">
            <h1 className="text-3xl text-primary">What is BetOnGoals?</h1>
            <h2 className="text-xl text-foreground">You set some sort of goal, whether it is to go to the gym 3 times a week, study for an hour a day, or anything else. You then wager some amount of money, and after a set period of time, you get that money back <span className="text-primary">only</span> if you reached your goal</h2>
        </div>
      </div>
    </main>
  )
}
