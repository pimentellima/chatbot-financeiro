'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useHistory from '@/lib/hooks/use-history'
import useImports from '@/lib/hooks/use-imports'
import {
    ArrowLeftFromLineIcon,
    FileIcon,
    LogOutIcon,
    MenuIcon,
    PlusIcon,
    XIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ChatHistory from './chat-history'
import { ImportStatementsDialog } from './import-statements-dialog'

export default function Drawer() {
    const [open, setOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    const { data: imports } = useImports()
    const { data: history } = useHistory()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth >= 768) {
                setOpen(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Fecha o drawer ao clicar fora (mobile)
    useEffect(() => {
        if (!isMobile || !open) return

        const handleClickOutside = (e: MouseEvent) => {
            const drawer = document.getElementById('mobile-drawer')
            if (drawer && !drawer.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isMobile, open])

    // Botão de menu mobile (fixo no canto)
    if (isMobile) {
        return (
            <>
                {/* Botão flutuante para abrir o drawer */}
                <Button
                    onClick={() => setOpen(true)}
                    className="fixed top-4 left-4 z-40 md:hidden"
                    size="icon"
                    variant="outline"
                >
                    <MenuIcon />
                </Button>

                {/* Overlay escuro */}
                {open && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                )}

                {/* Drawer mobile (overlay) */}
                <div
                    id="mobile-drawer"
                    data-open={open}
                    className="fixed top-0 left-0 h-full w-64 bg-background z-50 
                    transform transition-transform duration-300 ease-in-out
                    data-[open=false]:-translate-x-full data-[open=true]:translate-x-0
                    shadow-xl md:hidden"
                >
                    <div className="flex flex-col h-full p-4 gap-1 text-muted-foreground">
                        <Button
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => setOpen(false)}
                        >
                            <XIcon />
                            Close menu
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setOpen(false)}
                        >
                            <Link href="/chat">
                                <PlusIcon />
                                New chat
                            </Link>
                        </Button>

                        <ImportStatementsDialog imports={imports}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                            >
                                <FileIcon />
                                {imports && imports.length > 0
                                    ? `(${imports.length}) `
                                    : ''}
                                Import statements
                            </Button>
                        </ImportStatementsDialog>

                        <Separator className="my-2 opacity-70" />

                        <div className="flex-1 overflow-y-auto">
                            <ChatHistory chat={history} />
                        </div>

                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="w-full justify-start mt-auto"
                        >
                            <LogOutIcon />
                            Sign out
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    // Drawer desktop (comportamento original)
    return (
        <div className="hidden md:flex h-full">
            <div
                data-open={open}
                className="data-[open=true]:w-60 w-16 h-full px-2 py-4
                transition-all duration-300 ease-in-out flex flex-col items-center gap-1 text-muted-foreground"
            >
                <Button
                    variant={'ghost'}
                    className="w-full overflow-hidden"
                    onClick={() => setOpen(!open)}
                >
                    <ArrowLeftFromLineIcon
                        data-open={open}
                        className="data-[open=true]:rotate-0 rotate-180 transition-transform"
                    />
                    {open && 'Close drawer'}
                </Button>
                <Button
                    asChild
                    variant={'ghost'}
                    className="w-full overflow-hidden"
                >
                    <Link href={'/chat'}>
                        <PlusIcon />
                        {open && 'New chat'}
                    </Link>
                </Button>
                <ImportStatementsDialog imports={imports}>
                    <Button
                        variant={'ghost'}
                        className="w-full overflow-hidden"
                    >
                        <FileIcon />
                        {open &&
                            `${
                                imports && imports.length > 0
                                    ? `(${imports.length}) `
                                    : ''
                            }Import statements`}
                    </Button>
                </ImportStatementsDialog>

                {open && (
                    <div className="contents w-full mt-10">
                        <Separator className="opacity-70" />
                        <ChatHistory chat={history} />
                    </div>
                )}
                <div className="flex-1 flex items-end w-full">
                    <Button
                        onClick={() => signOut()}
                        variant="ghost"
                        className="w-full overflow-hidden"
                    >
                        <LogOutIcon />
                        {open && 'Sign out'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
