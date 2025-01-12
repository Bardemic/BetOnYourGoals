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

export default function login() {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-4">
                            <div>
                                <Label>Username</Label>
                                <Input id="name" placeholder="PrettyHorse123"></Input>
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input id="password" placeholder="********"></Input>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button className="w-1/2">Login</Button>
                </CardFooter>
            </Card>
        </div>
    )
}