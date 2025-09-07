import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

interface DocumentationPageProps { }

const DocumentationPage: React.FC<DocumentationPageProps> = () => {
    const { chapter, section } = useParams<{ chapter: string; section: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDocumentation = async () => {
            if (!chapter || !section) {
                setError('Kapitel oder Abschnitt nicht gefunden');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Decode URL parameters to handle special characters
                const decodedChapter = decodeURIComponent(chapter);
                const decodedSection = decodeURIComponent(section);

                console.log('📖 Loading documentation:', {
                    originalChapter: chapter,
                    decodedChapter,
                    originalSection: section,
                    decodedSection
                });

                // Try to dynamically import the markdown file
                const markdownPath = `/src/istqb-foundation-level/${decodedChapter}/${decodedSection}.md`;

                try {
                    // For development, try to fetch from the actual file system
                    const response = await fetch(markdownPath);
                    if (response.ok) {
                        const markdownContent = await response.text();
                        setContent(markdownContent);
                    } else {
                        throw new Error('File not found via fetch');
                    }
                } catch (fetchError) {
                    // Fallback: Create a sample content based on the section
                    const sampleContent = generateSampleContent(decodedSection);
                    setContent(sampleContent);
                }
            } catch (err) {
                setError('Fehler beim Laden der Dokumentation');
                console.error('Documentation loading error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDocumentation();
    }, [chapter, section]);

    // Generate sample content for the documentation
    const generateSampleContent = (sectionParam: string) => {
        const sectionTitle = getSectionTitle(sectionParam);

        // Check if this is the specific section mentioned in the example
        if (sectionParam.includes('1.2.3_Fehlhandlungen')) {
            return `# ${sectionTitle}

## Lernziele
- [ ] Die Begriffe Fehlhandlung, Fehlerzustand und Fehlerwirkung unterscheiden
- [ ] Den Zusammenhang zwischen diesen Begriffen verstehen
- [ ] Grundursachenanalyse durchführen können

## Inhalt

### Definitionen

**Fehlhandlung (Error):** Eine menschliche Handlung, die zu einem inkorrekten Ergebnis führt.

**Fehlerzustand (Defect/Bug):** Ein Fehlerzustand ist eine Unzulänglichkeit oder ein Mangel in einem Arbeitsergebnis, sodass es seine Anforderungen oder Spezifikationen nicht erfüllt.

**Fehlerwirkung (Failure):** Abweichung einer Komponente oder eines Systems von der erwarteten Lieferung, Dienstleistung oder vom erwarteten Ergebnis.

### Zusammenhang

Der Zusammenhang zwischen diesen Begriffen ist wie folgt:
1. **Fehlhandlung** → führt zu → **Fehlerzustand** → führt zu → **Fehlerwirkung**

### Grundursachenanalyse

Die Grundursachenanalyse hilft dabei, die eigentliche Ursache eines Problems zu identifizieren:
- **Was** ist passiert?
- **Warum** ist es passiert?
- **Wie** können wir es verhindern?

## Zusammenfassung

Das Verständnis der Unterschiede zwischen Fehlhandlung, Fehlerzustand und Fehlerwirkung ist fundamental für das Software-Testing. Diese Begriffe helfen dabei, Probleme systematisch zu analysieren und zu beheben.

## Übungsaufgaben

1. Definieren Sie die drei Begriffe mit eigenen Worten
2. Geben Sie Beispiele für jeden Begriff aus der Praxis
3. Führen Sie eine Grundursachenanalyse für einen selbst gewählten Fehler durch

## Weiterführende Links

- ISTQB Glossar
- ISO/IEC/IEEE 29119 Standard
- Basiswissen Softwaretest (Spillner & Linz)`;
        } else {
            return `# ${sectionTitle}

## Lernziele
- [ ] Wichtige Konzepte des Themas verstehen
- [ ] Praktische Anwendung lernen
- [ ] Zusammenhänge erkennen

## Inhalt

*Dieses Kapitel behandelt das Thema: ${sectionTitle}*

Die Inhalte werden basierend auf dem ISTQB Foundation Level Lehrplan erstellt und kontinuierlich erweitert.

## Zusammenfassung

## Übungsaufgaben

## Weiterführende Links

- ISTQB Foundation Level Lehrplan
- Relevante Standards und Normen`;
        }
    };

    // Funktion zum Parsen des Markdown-Inhalts (sola dayalı)
    const parseMarkdown = (markdown: string) => {
        return markdown
            // Headers
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-3 text-left">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-gray-700 mt-8 text-left">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-gray-600 mt-6 text-left">$1</h3>')
            // Checkboxes
            .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center mb-2 ml-4 justify-start"><input type="checkbox" class="mr-2 text-amber-500" disabled> <span class="text-left">$1</span></div>')
            .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center mb-2 ml-4 justify-start"><input type="checkbox" class="mr-2 text-amber-500" checked disabled> <span class="line-through text-gray-500 text-left">$1</span></div>')
            // List items
            .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-2 ml-4 text-left"><span class="font-medium text-amber-600">$1.</span> $2</li>')
            .replace(/^- (.*$)/gim, '<li class="mb-2 ml-4 list-disc text-left">$1</li>')
            // Bold and italic
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-800">$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700">$1</em>')
            // Code blocks
            .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
            // Paragraphs
            .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed text-left">')
            .replace(/\n/gim, '<br>');
    };

    const getChapterTitle = (chapterParam: string) => {
        const chapterMap: { [key: string]: string } = {
            '0_Einführung': '0. Einführung',
            '1_Grundlagen_des_Testens': '1. Grundlagen des Testens',
            '2_Testen_während_des_Softwareentwicklungslebenszyklus': '2. Testen während des Softwareentwicklungslebenszyklus',
            '3_Statischer_Test': '3. Statischer Test',
            '4_Testanalyse_und_-entwurf': '4. Testanalyse und -entwurf',
            '5_Management_der_Testaktivitäten': '5. Management der Testaktivitäten',
            '6_Testwerkzeuge': '6. Testwerkzeuge',
            '7_Literaturhinweise': '7. Literaturhinweise',
            '8_Anhang_A': '8. Anhang A',
            '9_Anhang_B': '9. Anhang B',
            '10_Anhang_C': '10. Anhang C',
            '11_Index': '11. Index'
        };
        return chapterMap[chapterParam] || chapterParam;
    };

    const getSectionTitle = (sectionParam: string) => {
        return sectionParam.replace(/_/g, ' ').replace(/\.md$/, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-8 max-w-4xl">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                        <span className="ml-3 text-muted-foreground">Dokumentation wird geladen...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-8 max-w-4xl">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-destructive mb-2">Fehler</h2>
                        <p className="text-destructive/80">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                            Zurück
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors mr-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück
                    </button>
                    <div className="flex items-center text-amber-600">
                        <BookOpen className="w-5 h-5 mr-2" />
                        <span className="font-medium">ISTQB Dokumentation</span>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="flex text-sm text-muted-foreground mb-6">
                    <span>ISTQB Foundation Level</span>
                    <span className="mx-2">›</span>
                    <span>{getChapterTitle(decodeURIComponent(chapter || ''))}</span>
                    <span className="mx-2">›</span>
                    <span className="text-foreground font-medium">{getSectionTitle(decodeURIComponent(section || ''))}</span>
                </nav>

                {/* Content */}
                <div className="bg-card rounded-lg border p-8">
                    <div
                        className="prose prose-lg max-w-none text-card-foreground"
                        style={{ textAlign: 'left' }}
                        dangerouslySetInnerHTML={{
                            __html: `<div class="mb-4" style="text-align:left;">${parseMarkdown(content)}</div>`
                        }}
                    />

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>ISTQB Foundation Level Lehrplan</span>
                            <button
                                onClick={() => navigate('/quiz')}
                                className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Zum Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
