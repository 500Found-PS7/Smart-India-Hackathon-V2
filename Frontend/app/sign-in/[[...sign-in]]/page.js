'use client';
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full p-6">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
              card: 'bg-neutral-900 border border-neutral-800',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'border-gray-700 text-white hover:bg-neutral-800',
              socialButtonsBlockButtonText: 'text-white',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-neutral-800 border-neutral-700 text-white',
              footerActionLink: 'text-blue-500 hover:text-blue-400',
              formFieldInputShowPasswordButton: 'text-gray-400',
              dividerLine: 'bg-neutral-800',
              dividerText: 'text-gray-400',
              formFieldInputShowPasswordIcon: 'text-gray-400',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 