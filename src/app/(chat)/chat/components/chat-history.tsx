import { Button } from '@/components/ui/button'
import { Chat } from '@/lib/db/schema'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ChatHistory({ chat }: { chat?: Chat[] }) {
    const params = useParams()
    if (!chat || chat.length === 0) return null

    return (
        <div className="contents">
            {chat.map((chat, i) => {
                const message = chat.messages
                    .filter((message) => message.role === 'user')?.[0]
                    .parts.find((p) => p.type === 'text')?.text
                return (
                    <Button
                        asChild
                        key={i}
                        data-selected={params.id === chat.id}
                        variant="ghost"
                        className="justify-start w-full data-[selected=true]:bg-accent/60 truncate"
                    >
                        <Link href={'/chat/' + chat.id}>{message}</Link>
                    </Button>
                )
            })}
        </div>
    )
}
