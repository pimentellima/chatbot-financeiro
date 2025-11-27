// layout.tsx
import { auth } from '@/lib/auth'
import getUserChatHistory from '@/lib/chat/get-user-chat-history'
import getUserImports from '@/lib/chat/get-user-imports'
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Drawer from './chat/components/drawer'

export default async function ChatLayout({
    children,
}: {
    children: ReactNode
}) {
    const session = await auth()

    if (!session?.user.id) {
        return redirect('/sign-in')
    }
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['imports'],
        queryFn: async () => await getUserImports(session.user.id as string),
    })
    await queryClient.prefetchQuery({
        queryKey: ['history'],
        queryFn: async () =>
            await getUserChatHistory(session.user.id as string),
    })
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="h-screen bg-background flex">
                <Drawer />
                <div className="py-3 pr-3 h-full w-full md:pl-0 pl-3">
                    <div className="w-full py-4 h-full border rounded-md bg-muted/90">
                        {children}
                    </div>
                </div>
            </div>
        </HydrationBoundary>
    )
}
