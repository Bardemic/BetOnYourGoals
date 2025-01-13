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

export default function WagerCard ({title, date, money}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex">
                <div className="flex flex-col gap-1 w-1/2">
                    <span>- since {date}</span>
                    <span>- ${money} on the line</span>
                </div>
                <div className="w-1/2 flex justify-end items-end">
                    <Button>edit</Button>
                </div>
            </CardContent>
        </Card>
    )
}