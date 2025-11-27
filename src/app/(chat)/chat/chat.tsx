'use client'
import { Button } from '@/components/ui/button'
import { BarChartSchema, PieChartSchema } from '@/lib/ai/tools'
import useImports from '@/lib/hooks/use-imports'
import { UIMessage, useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import BarChartMultiple from '../../../components/bar-chart-multiple'
import { PieChartComponent } from '../../../components/pie-chart'
import { ImportStatementsInput } from './components/import-statements-input'
import InputBubble from './components/input-bubble'

export default function Chat({
    id,
    initialMessages,
}: {
    id?: string
    initialMessages?: UIMessage[]
}) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: imports } = useImports()
    const [input, setInput] = useState('')
    const userHasImports = imports && imports.length > 0
    const {
        messages,
        sendMessage,
        id: chatId,
    } = useChat({
        ...(id ? { id } : {}),
        transport: new DefaultChatTransport({
            api: '/api/chat',
            prepareSendMessagesRequest({ messages, id }) {
                return { body: { message: messages[messages.length - 1], id } }
            },
        }),
        messages: initialMessages,
        onFinish: async () => {
            if (!initialMessages) {
                router.replace(`/chat/${chatId}`)
                await queryClient.refetchQueries({
                    queryKey: ['history'],
                })
            }
        },
    })
    const messageEndRef = useRef<HTMLDivElement>(null)
    const scrollToBottom = () => {
        const scrollHeight = messageEndRef.current?.scrollHeight
        if (scrollHeight === 0) {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const submitMessage = () => {
        if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
            scrollToBottom()
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="w-full flex flex-col justify-between items-center h-full px-2">
            <div className="overflow-auto w-full flex justify-center mb-10 ">
                <div
                    className="flex flex-col gap-10
                   leading-relaxed items-center w-[750px] relative"
                >
                    {!userHasImports ? (
                        <div className="flex justify-center items-center h-full">
                            <ImportStatementsInput />
                        </div>
                    ) : messages.length === 0 ? (
                        <QuestionPrompts
                            sendMessage={(text) => sendMessage({ text })}
                        />
                    ) : (
                        messages.map((message) =>
                            message.role === 'user' ? (
                                <UserMessage
                                    key={message.id}
                                    message={message}
                                />
                            ) : (
                                <BotMessage
                                    key={message.id}
                                    message={message}
                                    isLastMessage={
                                        messages.findIndex(
                                            (m) => m.id === message.id
                                        ) ===
                                        messages.length - 1
                                    }
                                />
                            )
                        )
                    )}
                    <div ref={messageEndRef} />
                </div>
            </div>
            <div className="w-full sm:w-[750px]">
                <InputBubble
                    disabled={!userHasImports}
                    handleSubmit={submitMessage}
                    handleInputChange={(input) => setInput(input)}
                    input={input}
                />
            </div>
        </div>
    )
}

function BotMessage({
    message,
    isLastMessage,
}: {
    message: UIMessage
    isLastMessage: boolean
}) {
    const isCallingTool = message.parts.some((p) => p.type === 'dynamic-tool')

    const hasChart = message.parts?.some(
        (p) =>
            p.type === 'dynamic-tool' &&
            ['createBarChartMultiple', 'createPieChart'].includes(p.toolName)
    )
    if (isLastMessage && isCallingTool)
        return (
            <div className="flex gap-2 w-full px-2">
                <div className="flex-1">Buscando informações...</div>
            </div>
        )

    const messageContent = message.parts?.find((p) => p.type === 'text')?.text
    const toolParts = message.parts.filter((p) => p.type === 'dynamic-tool')
    if (!messageContent && !hasChart) return null
    return (
        <div className="flex gap-2 w-full px-2">
            <div className="flex-1">
                {messageContent}
                <div>
                    {toolParts.map((toolPart) => {
                        const { toolName, state } = toolPart
                        if (
                            toolName === 'createBarChartMultiple' &&
                            state === 'output-available'
                        )
                            return (
                                <BarChartMultiple
                                    key={toolPart.toolCallId}
                                    {...(toolPart.output as BarChartSchema)}
                                />
                            )
                        if (
                            toolName === 'createPieChart' &&
                            state === 'output-available'
                        ) {
                            return (
                                <PieChartComponent
                                    key={toolPart.toolCallId}
                                    {...(toolPart.output as PieChartSchema)}
                                />
                            )
                        }
                    })}
                </div>
            </div>
        </div>
    )
}

function UserMessage({ message }: { message: UIMessage }) {
    if (!message.parts) return null
    return (
        <div className="flex justify-end w-full px-2 items-center">
            <div className="text-right py-2 px-4 rounded-md bg-background border">
                <div className="whitespace-pre-wrap">
                    {message.parts.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return (
                                    <div key={`${message.id}-${i}`}>
                                        {part.text}
                                    </div>
                                )
                        }
                    })}
                </div>
            </div>
        </div>
    )
}

function QuestionPrompts({
    sendMessage,
}: {
    sendMessage: (text: string) => void
}) {
    return (
        <div className="grid gap-1">
            <QuestionButton
                sendMessage={sendMessage}
                question="What did I spend the most on in January?"
            />
            <QuestionButton
                sendMessage={sendMessage}
                question="Make a comparison between my income and expenses over the last 3 months."
            />
            <QuestionButton
                sendMessage={sendMessage}
                question="How have my expenses on entertainment changed over the past 6 months?"
            />
            <QuestionButton
                sendMessage={sendMessage}
                question="Show me a pie chart of my expenses by category for last month."
            />
        </div>
    )
}

function QuestionButton({
    question,
    sendMessage,
}: {
    question: string
    sendMessage: (text: string) => void
}) {
    return (
        <Button
            onClick={() => sendMessage(question)}
            size="lg"
            variant={'outline'}
            className="text-wrap hover:bg-background/50"
        >
            {question}
        </Button>
    )
}
