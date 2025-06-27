import { SignIn } from "@clerk/nextjs"

function SignInPage() {
  return <SignIn signUpUrl="/sign-up" />
}

export default SignInPage
