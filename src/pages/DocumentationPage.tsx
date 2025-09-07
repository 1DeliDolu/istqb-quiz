import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface DocumentationPageProps { }

const DocumentationPage: React.FC<DocumentationPageProps> = () => {
    const { chapter, section } = useParams<{ chapter: string; section: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');

    // Bölüm alt başlıkları (örnek: 0_Einführung)
    const allSectionIndex: { [chapter: string]: { file: string; title: string; page: number }[] } = {
        '0_Einführung': [
            { file: '0.1_Zweck_dieses_Dokuments.md', title: '0.1 Zweck dieses Dokuments', page: 10 },
            { file: '0.2_Certified_Tester_Foundation_Level_im_Softwaretest.md', title: '0.2 Certified Tester Foundation Level im Softwaretest', page: 10 },
            { file: '0.3_Karriereweg_für_Tester.md', title: '0.3 Karriereweg für Tester', page: 10 },
            { file: '0.4_Geschäftlicher_Nutzen.md', title: '0.4 Geschäftlicher Nutzen', page: 11 },
            { file: '0.5_Prüfbare_Lernziele_und_kognitive_Stufen_des_Wissens.md', title: '0.5 Prüfbare Lernziele und kognitive Stufen des Wissens', page: 12 },
            { file: '0.6_Die_Foundation-Level-Zertifizierungsprüfung.md', title: '0.6 Die Foundation-Level-Zertifizierungsprüfung', page: 12 },
            { file: '0.7_Akkreditierung.md', title: '0.7 Akkreditierung', page: 12 },
            { file: '0.8_Umgang_mit_Standards.md', title: '0.8 Umgang mit Standards', page: 12 },
            { file: '0.9_Auf_dem_Laufenden_bleiben.md', title: '0.9 Auf dem Laufenden bleiben', page: 13 },
            { file: '0.10_Detaillierungsgrad.md', title: '0.10 Detaillierungsgrad', page: 13 },
            { file: '0.11_Aufbau_des_Lehrplans.md', title: '0.11 Aufbau des Lehrplans', page: 13 },
        ],
        '1_Grundlagen_des_Testens': [
            { file: '1.1_Was_ist_Testen.md', title: '1.1 Was ist Testen?', page: 16 },
            { file: '1.1.1_Testziele.md', title: '1.1.1 Testziele', page: 16 },
            { file: '1.1.2_Testen_und_Debugging.md', title: '1.1.2 Testen und Debugging', page: 17 },
            { file: '1.2_Warum_ist_Testen_notwendig.md', title: '1.2 Warum ist Testen notwendig?', page: 18 },
            { file: '1.2.1_Der_Beitrag_des_Testens_zum_Erfolg.md', title: '1.2.1 Der Beitrag des Testens zum Erfolg', page: 18 },
            { file: '1.2.2_Testen_und_Qualitätssicherung.md', title: '1.2.2 Testen und Qualitätssicherung', page: 18 },
            { file: '1.2.3_Fehlhandlungen_Fehlerzustände_Fehlerwirkungen_und_Grundursachen.md', title: '1.2.3 Fehlhandlungen, Fehlerzustände, Fehlerwirkungen und Grundursachen', page: 19 },
            { file: '1.3_Grundsätze_des_Testens.md', title: '1.3 Grundsätze des Testens', page: 19 },
            { file: '1.4_Testaktivitäten_Testmittel_und_Rollen_des_Testens.md', title: '1.4 Testaktivitäten, Testmittel und Rollen des Testens', page: 20 },
            { file: '1.4.1_Testaktivitäten_und_-aufgaben.md', title: '1.4.1 Testaktivitäten und -aufgaben', page: 21 },
            { file: '1.4.2_Testprozess_im_Kontext.md', title: '1.4.2 Testprozess im Kontext', page: 22 },
            { file: '1.4.3_Testmittel.md', title: '1.4.3 Testmittel', page: 22 },
            { file: '1.4.4_Verfolgbarkeit_zwischen_der_Testbasis_und_den_Testmitteln.md', title: '1.4.4 Verfolgbarkeit zwischen der Testbasis und den Testmitteln', page: 23 },
            { file: '1.4.5_Rollen_des_Testens.md', title: '1.4.5 Rollen des Testens', page: 24 },
            { file: '1.5_Wesentliche_Kompetenzen_und_bewährte_Praktiken_beim_Testen.md', title: '1.5 Wesentliche Kompetenzen und bewährte Praktiken beim Testen', page: 24 },
            { file: '1.5.2_Whole-Team-Ansatz.md', title: '1.5.2 Whole-Team-Ansatz (Whole Team Approach)', page: 25 },
            { file: '1.5.3_Unabhängigkeit_des_Testens.md', title: '1.5.3 Unabhängigkeit des Testens', page: 26 },
        ],
        '2_Testen_während_des_Softwareentwicklungslebenszyklus': [
            { file: '2.1_Testen_im_Kontext_eines_SDLC.md', title: '2.1 Testen im Kontext eines SDLC', page: 27 },
            { file: '2.1.1_Auswirkungen_des_SDLC_auf_das_Testen.md', title: '2.1.1 Auswirkungen des SDLC auf das Testen', page: 27 },
            { file: '2.1.2_SDLC_und_bewährte_Testpraktiken.md', title: '2.1.2 SDLC und bewährte Testpraktiken', page: 28 },
            { file: '2.1.3_Testen_als_Treiber_für_die_Softwareentwicklung.md', title: '2.1.3 Testen als Treiber für die Softwareentwicklung', page: 29 },
            { file: '2.1.4_DevOps_und_Testen.md', title: '2.1.4 DevOps und Testen', page: 29 },
            { file: '2.1.5_Shift-Left-Ansatz.md', title: '2.1.5 Shift-Left-Ansatz', page: 30 },
            { file: '2.1.6_Retrospektiven_und_Prozessverbesserung.md', title: '2.1.6 Retrospektiven und Prozessverbesserung', page: 30 },
            { file: '2.2_Teststufen_und_Testarten.md', title: '2.2 Teststufen und Testarten', page: 31 },
            { file: '2.2.1_Teststufen.md', title: '2.2.1 Teststufen', page: 31 },
            { file: '2.2.2_Testarten.md', title: '2.2.2 Testarten', page: 33 },
            { file: '2.2.3_Bestätigungstest_und_Regressionstest.md', title: '2.2.3 Bestätigungstest und Regressionstest', page: 35 },
            { file: '2.3_Wartungstest.md', title: '2.3 Wartungstest', page: 36 },
            { file: '2.3.1_Auslöser_für_Wartungstest.md', title: '2.3.1 Auslöser für Wartungstest', page: 36 },
            { file: '2.3.2_Auswirkungsanalyse_für_Wartungstest.md', title: '2.3.2 Auswirkungsanalyse für Wartungstest', page: 37 },
        ],
        '3_Statischer_Test': [
            { file: '3.1_Grundlagen_der_statischen_Testverfahren.md', title: '3.1 Grundlagen der statischen Testverfahren', page: 38 },
            { file: '3.1.1_Testmittel_die_statisch_getestet_werden_können.md', title: '3.1.1 Testmittel, die statisch getestet werden können', page: 38 },
            { file: '3.1.2_Nutzen_der_statischen_Testverfahren.md', title: '3.1.2 Nutzen der statischen Testverfahren', page: 39 },
            { file: '3.1.3_Unterschiede_zwischen_statischen_und_dynamischen_Testverfahren.md', title: '3.1.3 Unterschiede zwischen statischen und dynamischen Testverfahren', page: 39 },
            { file: '3.2_Feedback_und_Review-Prozess.md', title: '3.2 Feedback und Review-Prozess', page: 40 },
            { file: '3.2.1_Nutzen_von_frühem_und_häufigem_Feedback.md', title: '3.2.1 Nutzen von frühem und häufigem Feedback', page: 40 },
            { file: '3.2.2_Review-Prozess_Aktivitäten.md', title: '3.2.2 Review-Prozess Aktivitäten', page: 40 },
            { file: '3.2.3_Rollen_und_Verantwortlichkeiten_in_Reviews.md', title: '3.2.3 Rollen und Verantwortlichkeiten in Reviews', page: 41 },
            { file: '3.2.4_Review-Arten.md', title: '3.2.4 Review-Arten', page: 42 },
            { file: '3.2.5_Erfolgsfaktoren_für_Reviews.md', title: '3.2.5 Erfolgsfaktoren für Reviews', page: 43 },
        ],
        '4_Testanalyse_und_-entwurf': [
            { file: '4.1_Testverfahren_im_Überblick.md', title: '4.1 Testverfahren im Überblick', page: 45 },
            { file: '4.2_Black-Box-Testverfahren.md', title: '4.2 Black-Box-Testverfahren', page: 45 },
            { file: '4.2.1_Äquivalenzklassenbildung.md', title: '4.2.1 Äquivalenzklassenbildung', page: 45 },
            { file: '4.2.2_Grenzwertanalyse.md', title: '4.2.2 Grenzwertanalyse', page: 46 },
            { file: '4.2.3_Entscheidungstabellentest.md', title: '4.2.3 Entscheidungstabellentest', page: 47 },
            { file: '4.2.4_Zustandsübergangstest.md', title: '4.2.4 Zustandsübergangstest', page: 48 },
            { file: '4.3_White-Box-Testverfahren.md', title: '4.3 White-Box-Testverfahren', page: 49 },
            { file: '4.3.1_Anweisungstest_und_Anweisungsüberdeckung.md', title: '4.3.1 Anweisungstest und Anweisungsüberdeckung', page: 50 },
            { file: '4.3.2_Zweigtest_und_Zweigüberdeckung.md', title: '4.3.2 Zweigtest und Zweigüberdeckung', page: 50 },
            { file: '4.3.3_Der_Wert_des_White-Box-Tests.md', title: '4.3.3 Der Wert des White-Box-Tests', page: 51 },
            { file: '4.4_Erfahrungsbasierter_Test.md', title: '4.4 Erfahrungsbasierter Test', page: 51 },
            { file: '4.4.1_Intuitive_Testfallermittlung.md', title: '4.4.1 Intuitive Testfallermittlung', page: 51 },
            { file: '4.4.2_Explorativer_Test.md', title: '4.4.2 Explorativer Test', page: 52 },
            { file: '4.4.3_Checklistenbasierter_Test.md', title: '4.4.3 Checklistenbasierter Test', page: 52 },
            { file: '4.5_Auf_Zusammenarbeit_basierende_Testansätze.md', title: '4.5 Auf Zusammenarbeit basierende Testansätze', page: 53 },
            { file: '4.5.1_Gemeinsames_Schreiben_von_User-Storys.md', title: '4.5.1 Gemeinsames Schreiben von User-Storys', page: 53 },
            { file: '4.5.2_Akzeptanzkriterien.md', title: '4.5.2 Akzeptanzkriterien', page: 54 },
            { file: '4.5.3_Abnahmetestgetriebene_Entwicklung_ATDD.md', title: '4.5.3 Abnahmetestgetriebene Entwicklung (ATDD)', page: 54 },
        ],
        '5_Management_der_Testaktivitäten': [
            { file: '5.1_Testplanung.md', title: '5.1 Testplanung', page: 55 },
            { file: '5.1.1_Zweck_und_Inhalt_eines_Testkonzepts.md', title: '5.1.1 Zweck und Inhalt eines Testkonzepts', page: 55 },
            { file: '5.1.2_Der_Beitrag_des_Testers_zur_Iterations-_und_Releaseplanung.md', title: '5.1.2 Der Beitrag des Testers zur Iterations- und Releaseplanung', page: 56 },
            { file: '5.1.3_Eingangskriterien_und_Endekriterien.md', title: '5.1.3 Eingangskriterien und Endekriterien', page: 56 },
            { file: '5.1.4_Schätzverfahren.md', title: '5.1.4 Schätzverfahren', page: 57 },
            { file: '5.1.5_Priorisierung_von_Testfällen.md', title: '5.1.5 Priorisierung von Testfällen', page: 57 },
            { file: '5.1.6_Testpyramide.md', title: '5.1.6 Testpyramide', page: 58 },
            { file: '5.1.7_Testquadranten.md', title: '5.1.7 Testquadranten', page: 58 },
            { file: '5.2_Risikomanagement.md', title: '5.2 Risikomanagement', page: 59 },
            { file: '5.2.1_Risikodefinition_und_Risikoattribute.md', title: '5.2.1 Risikodefinition und Risikoattribute', page: 59 },
            { file: '5.2.2_Projektrisiken_und_Produktrisiken.md', title: '5.2.2 Projektrisiken und Produktrisiken', page: 60 },
            { file: '5.2.3_Produktrisikoanalyse.md', title: '5.2.3 Produktrisikoanalyse', page: 60 },
            { file: '5.2.4_Produktrisikosteuerung.md', title: '5.2.4 Produktrisikosteuerung', page: 61 },
            { file: '5.3_Testüberwachung_Teststeuerung_und_Testabschluss.md', title: '5.3 Testüberwachung, Teststeuerung und Testabschluss', page: 61 },
            { file: '5.3.1_Beim_Testen_verwendete_Metriken.md', title: '5.3.1 Beim Testen verwendete Metriken', page: 62 },
            { file: '5.3.2_Zweck_Inhalt_und_Zielgruppen_für_Testberichte.md', title: '5.3.2 Zweck, Inhalt und Zielgruppen für Testberichte', page: 62 },
            { file: '5.3.3_Kommunikation_des_Teststatus.md', title: '5.3.3 Kommunikation des Teststatus', page: 63 },
            { file: '5.4_Konfigurationsmanagement.md', title: '5.4 Konfigurationsmanagement', page: 63 },
            { file: '5.5_Fehlermanagement.md', title: '5.5 Fehlermanagement', page: 64 },
        ],
        '6_Testwerkzeuge': [
            { file: '6.1_Werkzeugunterstützung_für_das_Testen.md', title: '6.1 Werkzeugunterstützung für das Testen', page: 65 },
            { file: '6.2_Nutzen_und_Risiken_von_Testautomatisierung.md', title: '6.2 Nutzen und Risiken von Testautomatisierung', page: 66 },
        ],
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

    // Breadcrumb link helpers
    const getBreadcrumbs = () => {
        const breadcrumbs = [
            {
                label: 'ISTQB Foundation Level',
                to: '/docs', // Ana dökümantasyon sayfası
                match: /^\/docs$/,
            },
        ];
        if (chapter) {
            breadcrumbs.push({
                label: getChapterTitle(decodeURIComponent(chapter)),
                to: `/documentation/${encodeURIComponent(chapter)}`,
                match: new RegExp(`^/documentation/${encodeURIComponent(chapter)}$`),
            });
        }
        if (chapter && section) {
            breadcrumbs.push({
                label: getSectionTitle(decodeURIComponent(section)),
                to: `/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(section)}`,
                match: new RegExp(`^/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(section)}$`),
            });
        }
        return breadcrumbs;
    };

    useEffect(() => {
        if (!section) return;
        const decodedChapter = decodeURIComponent(chapter || '');
        const decodedSection = decodeURIComponent(section);
        const markdownPath = `/src/istqb-foundation-level/${decodedChapter}/${decodedSection}.md`;
        fetch(markdownPath)
            .then(response => response.ok ? response.text() : Promise.reject())
            .then(markdownContent => setContent(markdownContent))
            .catch(() => setContent(`# ${getSectionTitle(decodedSection)}\n\nİçerik henüz mevcut değil.`));
    }, [chapter, section]);

    // Sadece chapter varsa ve section yoksa, alt başlıkları listele
    if (chapter && !section) {
        const sections = allSectionIndex[chapter] || [];
        console.log('🔍 Chapter without section detected:', {
            chapter,
            decodedChapter: decodeURIComponent(chapter),
            sections: sections.length,
            allIndexKeys: Object.keys(allSectionIndex)
        });

        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-8 max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen className="w-12 h-12 text-amber-600 mr-4" />
                            <h1 className="text-4xl font-bold">{getChapterTitle(decodeURIComponent(chapter))}</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Standardglossar der Begriffe des Softwaretestens - Vollständiger Lehrplan
                        </p>
                    </div>

                    {/* Breadcrumb */}
                    <nav className="flex justify-center text-sm text-muted-foreground mb-8 items-center gap-1">
                        {getBreadcrumbs().map((bc, idx, arr) => {
                            const isLast = idx === arr.length - 1;
                            const isActive = bc.match.test(location.pathname);
                            return (
                                <React.Fragment key={bc.to}>
                                    <Link
                                        to={bc.to}
                                        data-active={isActive}
                                        className={`px-2 py-1 rounded transition-colors ${isActive
                                            ? 'bg-amber-100 text-amber-700 font-semibold shadow-sm'
                                            : 'hover:bg-accent text-muted-foreground'
                                            } ${isLast ? 'text-foreground font-medium' : ''}`}
                                        style={{ pointerEvents: isLast ? 'none' : 'auto' }}
                                    >
                                        {bc.label}
                                    </Link>
                                    {!isLast && <span className="mx-1">›</span>}
                                </React.Fragment>
                            );
                        })}
                    </nav>

                    {/* Chapter Content */}
                    <div className="space-y-8">
                        <div className="bg-card rounded-lg border p-6">
                            <div className="space-y-2">
                                {sections.map(({ file, title, page }) => {
                                    const sectionSlug = file.replace('.md', '');
                                    return (
                                        <div
                                            key={file}
                                            className="flex items-center justify-between p-3 hover:bg-accent/30 rounded cursor-pointer transition-colors group"
                                            onClick={() => navigate(`/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(sectionSlug)}`)}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-primary mr-3 min-w-[3rem]">
                                                    {title.split(' ')[0]}
                                                </span>
                                                <span className="text-foreground group-hover:text-primary transition-colors">
                                                    {title.substring(title.indexOf(' ') + 1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    {page}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Klicken Sie auf einen Abschnitt, um zur entsprechenden Dokumentation zu gelangen.
                        </p>
                    </div>
                </div>
            </div>
        );
    } if (!section) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-8 max-w-4xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4">Bölüm seçiniz</h1>
                        <p className="text-muted-foreground">Lütfen bir bölüm ve alt başlık seçin.</p>
                    </div>
                </div>
            </div>
        );
    }

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

    // Sadece chapter varsa ve section yoksa, alt başlıkları listele
    if (chapter && !section) {
        const sections = allSectionIndex[chapter] || [];
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
                    <nav className="flex text-sm text-muted-foreground mb-6 items-center gap-1">
                        {getBreadcrumbs().map((bc, idx, arr) => {
                            const isLast = idx === arr.length - 1;
                            const isActive = bc.match.test(location.pathname);
                            return (
                                <React.Fragment key={bc.to}>
                                    <Link
                                        to={bc.to}
                                        data-active={isActive}
                                        className={`px-2 py-1 rounded transition-colors ${isActive
                                            ? 'bg-amber-100 text-amber-700 font-semibold shadow-sm'
                                            : 'hover:bg-accent text-muted-foreground'
                                            } ${isLast ? 'text-foreground font-medium' : ''}`}
                                        style={{ pointerEvents: isLast ? 'none' : 'auto' }}
                                    >
                                        {bc.label}
                                    </Link>
                                    {!isLast && <span className="mx-1">›</span>}
                                </React.Fragment>
                            );
                        })}
                    </nav>

                    <h1 className="text-2xl font-bold mb-6">{getChapterTitle(decodeURIComponent(chapter))}</h1>
                    <div className="bg-card rounded-lg border p-6">
                        <ul className="divide-y divide-border">
                            {sections.map(({ file, title, page }) => {
                                const sectionSlug = file.replace('.md', '');
                                return (
                                    <li key={file} className="py-4 flex items-center justify-between">
                                        <Link
                                            to={`/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(sectionSlug)}`}
                                            className="text-amber-700 hover:text-amber-800 hover:underline font-medium transition-colors"
                                        >
                                            {title}
                                        </Link>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{page}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (!section) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="container mx-auto p-8 max-w-4xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4">Bölüm seçiniz</h1>
                        <p className="text-muted-foreground">Lütfen bir bölüm ve alt başlık seçin.</p>
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
                <nav className="flex text-sm text-muted-foreground mb-6 items-center gap-1">
                    {getBreadcrumbs().map((bc, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        const isActive = bc.match.test(location.pathname);
                        return (
                            <React.Fragment key={bc.to}>
                                <Link
                                    to={bc.to}
                                    data-active={isActive}
                                    className={`px-2 py-1 rounded transition-colors ${isActive
                                        ? 'bg-amber-100 text-amber-700 font-semibold shadow-sm'
                                        : 'hover:bg-accent text-muted-foreground'
                                        } ${isLast ? 'text-foreground font-medium' : ''}`}
                                    style={{ pointerEvents: isLast ? 'none' : 'auto' }}
                                >
                                    {bc.label}
                                </Link>
                                {!isLast && <span className="mx-1">›</span>}
                            </React.Fragment>
                        );
                    })}
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
