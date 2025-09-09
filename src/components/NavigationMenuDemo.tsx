"use client"

import * as React from "react"
import { istqbChapters } from "@/constants/istqbChapters"
import { udemyChapters } from "@/constants/udemyChapters"
import { fragenChapters } from "@/constants/fragenChapters"

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

export function NavigationMenuDemo() {
    const [selectedChapter, setSelectedChapter] = React.useState<string | null>(null);
    const [selectedUdemyChapter, setSelectedUdemyChapter] = React.useState<string | null>(null);
    const [selectedFragenChapter, setSelectedFragenChapter] = React.useState<string | null>(null);

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>ISTQB</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="w-[800px] gap-3 p-4 overflow-visible min-h-96">
                            <div className="grid grid-cols-2 gap-4 overflow-visible h-full" onMouseLeave={() => setSelectedChapter(null)}>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-purple-600">Hauptkapitel</h3>
                                    <ul className="space-y-1">
                                        {Object.entries(istqbChapters).map(([key, chapter]) => (
                                            <li key={key}>
                                                <button
                                                    onMouseEnter={() => setSelectedChapter(key)}
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
                                    <h3 className="mb-2 text-sm font-semibold text-purple-600">Unterkapitel</h3>
                                    {selectedChapter && istqbChapters[selectedChapter as keyof typeof istqbChapters] ? (
                                        <div className="h-full max-h-96 overflow-y-auto">
                                            <ul className="space-y-1">
                                                {istqbChapters[selectedChapter as keyof typeof istqbChapters].subChapters.map((subChapter, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={`/quiz/${selectedChapter}?sub=${index}`}
                                                            className="block p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground text-left"
                                                        >
                                                            {subChapter}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Wählen Sie ein Hauptkapitel</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Udemy</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="w-[800px] gap-3 p-4 overflow-visible min-h-96">
                            <div className="grid grid-cols-2 gap-4 overflow-visible h-full" onMouseLeave={() => setSelectedUdemyChapter(null)}>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-blue-600">Udemy Kurskapitel</h3>
                                    <ul className="space-y-1">
                                        {Object.entries(udemyChapters).map(([key, chapter]) => (
                                            <li key={key}>
                                                <button
                                                    onMouseEnter={() => setSelectedUdemyChapter(key)}
                                                    className={`block w-full text-left p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground ${selectedUdemyChapter === key ? 'bg-accent text-accent-foreground' : ''
                                                        }`}
                                                >
                                                    {chapter.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-blue-600">Quizler</h3>
                                    {selectedUdemyChapter && udemyChapters[selectedUdemyChapter as keyof typeof udemyChapters] ? (
                                        <div className="h-full max-h-96 overflow-y-auto">
                                            <ul className="space-y-1">
                                                {udemyChapters[selectedUdemyChapter as keyof typeof udemyChapters].subChapters.map((subChapter, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={`/quiz/${selectedUdemyChapter}?sub=${index}`}
                                                            className="block p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground text-left"
                                                        >
                                                            {subChapter}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Wählen Sie ein Kurskapitel</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Fragen</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="w-[800px] gap-3 p-4 overflow-visible min-h-96">
                            <div className="grid grid-cols-2 gap-4 overflow-visible h-full" onMouseLeave={() => setSelectedFragenChapter(null)}>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-green-600">Allgemeine Fragenkategorien</h3>
                                    <ul className="space-y-1">
                                        {Object.entries(fragenChapters).map(([key, chapter]) => (
                                            <li key={key}>
                                                <button
                                                    onMouseEnter={() => setSelectedFragenChapter(key)}
                                                    className={`block w-full text-left p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground ${selectedFragenChapter === key ? 'bg-accent text-accent-foreground' : ''
                                                        }`}
                                                >
                                                    {chapter.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-green-600">Unterkategorien</h3>
                                    {selectedFragenChapter && fragenChapters[selectedFragenChapter as keyof typeof fragenChapters] ? (
                                        <div className="h-full max-h-96 overflow-y-auto">
                                            <ul className="space-y-1">
                                                {fragenChapters[selectedFragenChapter as keyof typeof fragenChapters].subChapters.map((subChapter, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={`/quiz/${selectedFragenChapter}?sub=${index}`}
                                                            className="block p-2 text-sm rounded hover:bg-accent hover:text-accent-foreground text-left"
                                                        >
                                                            {subChapter}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Wählen Sie eine Kategorie</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>CMS</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid w-[600px] gap-6 p-4">
                            <div className="grid grid-cols-3 gap-4">
                                {/* ISTQB Section */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-purple-600">ISTQB</h3>
                                    <ul className="space-y-2">
                                        <ListItem href="/cms/istqb-form" title="Frage hinzufügen">
                                            Neue ISTQB-Frage hinzufügen
                                        </ListItem>
                                        <ListItem href="/cms/istqb-quiz" title="Fragen anzeigen">
                                            ISTQB-Fragen anzeigen und lösen
                                        </ListItem>
                                    </ul>
                                </div>

                                {/* Udemy Section */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-blue-600">Udemy</h3>
                                    <ul className="space-y-2">
                                        <ListItem href="/docs/cms/udemy" title="Frage hinzufügen">
                                            Neue Udemy-Frage hinzufügen
                                        </ListItem>
                                        <ListItem href="/cms/udemy-quiz" title="Fragen anzeigen">
                                            Udemy-Fragen anzeigen und lösen
                                        </ListItem>
                                    </ul>
                                </div>

                                {/* Fragen Section */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-green-600">Fragen</h3>
                                    <ul className="space-y-2">
                                        <ListItem href="/docs/cms/fragen" title="Frage hinzufügen">
                                            Neue Fragen-Frage hinzufügen
                                        </ListItem>
                                        <ListItem href="/cms/fragen-quiz" title="Fragen anzeigen">
                                            Fragen anzeigen und lösen
                                        </ListItem>
                                    </ul>
                                </div>
                            </div>

                            {/* Veri Yönetimi Section */}
                            <div className="border-t pt-4">
                                <ul className="grid w-[200px] gap-3">
                                    <ListItem href="/data-management" title="Datenverwaltung">
                                        Alle Fragen anzeigen und als JSON exportieren
                                    </ListItem>
                                </ul>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <a href="/docs" className={navigationMenuTriggerStyle()}>
                        Dokumentation
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
