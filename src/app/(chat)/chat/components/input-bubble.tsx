'use client'

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from '@/components/ui/input-group'

import { ArrowUpIcon } from 'lucide-react'

export default function InputBubble({
    handleSubmit,
    input,
    handleInputChange,
    disabled,
}: {
    handleSubmit: () => void
    input: string
    handleInputChange: (text: string) => void
    disabled?: boolean
}) {
    return (
        <InputGroup className="bg-background">
            <InputGroupTextarea
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                    }
                }}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ask something"
            />
            <InputGroupAddon className="bg-back" align="block-end">
                <InputGroupButton
                    onClick={() => {
                        handleSubmit()
                    }}
                    disabled={disabled}
                    size="sm"
                    className="ml-auto"
                    variant="default"
                >
                    <span className="hidden sm:block">Send</span>{' '}
                    <ArrowUpIcon />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}
