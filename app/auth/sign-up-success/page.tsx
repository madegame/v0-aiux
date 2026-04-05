import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Terminal, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VSCodeux</span>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Mail className="h-5 w-5" />
            <span>Please check your inbox</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to confirm your account and get started with VSCodeux.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">
              Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
