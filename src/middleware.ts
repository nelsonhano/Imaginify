import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/', '/api/webhooks/clerk', '/api/webhooks/stripe', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect()
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}




// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher(["/api/webhooks/clerk", "/api/webhooks/stripe", '/']);

// export default clerkMiddleware((auth, req) => {
//     if (!isProtectedRoute(req)) auth().protect()
// })

// export const config = {
//     matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };