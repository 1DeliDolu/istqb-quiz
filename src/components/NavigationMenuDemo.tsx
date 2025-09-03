"use client"

import * as React from "react"
import { istqbChapters } from "@/constants/istqbChapters"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

export function NavigationMenuDemo() {
    const [selectedChapter, setSelectedChapter] = React.useState<string | null>(null);

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid w-[800px] gap-3 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold">Ana Bölümler</h3>
                                    <ul className="space-y-1">
                                        {Object.entries(istqbChapters).map(([key, chapter]) => (
                                            <li key={key}>
                                                <button
                                                    onClick={() => setSelectedChapter(key)}
                                                    className={`block w-full text-left p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground ${selectedChapter === key ? 'bg-accent text-accent-foreground' : ''
                                                        }`}
                                                >
                                                    {chapter.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold">Alt Bölümler</h3>
                                    {selectedChapter && istqbChapters[selectedChapter as keyof typeof istqbChapters] ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            <ul className="space-y-1">
                                                {istqbChapters[selectedChapter as keyof typeof istqbChapters].subChapters.map((subChapter, index) => (
                                                    <li key={index}>
                                                        <NavigationMenuLink asChild>
                                                            <a
                                                                href={`/quiz/${selectedChapter}?sub=${index}`}
                                                                className="block p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                                                            >
                                                                {subChapter}
                                                            </a>
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Bir ana bölüm seçin</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>CSM</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[300px] gap-3 p-4">
                            <ListItem href="/csm/istqb-form" title="ISTQB">
                                Add new questions via form.
                            </ListItem>
                            <ListItem href="/docs/csm/udemy" title="Udemy">
                                Udemy related content.
                            </ListItem>
                            <ListItem href="/docs/csm/fragen" title="Fragen">
                                General questions.
                            </ListItem>
                            <ListItem href="/data-management" title="Veri Yönetimi">
                                View and export saved questions to JSON.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <a href="/docs" className={navigationMenuTriggerStyle()}>
                        Documentation
                    </a>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
} const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
