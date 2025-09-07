import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const DocumentationIndexPage: React.FC = () => {
    const navigate = useNavigate();

    const curriculumStructure = [
        {
            chapter: "0",
            title: "Einführung",
            sections: [
                { id: "0.1", title: "Zweck dieses Dokuments", page: "10" },
                { id: "0.2", title: "Certified Tester Foundation Level im Softwaretest", page: "10" },
                { id: "0.3", title: "Karriereweg für Tester", page: "10" },
                { id: "0.4", title: "Geschäftlicher Nutzen", page: "11" },
                { id: "0.5", title: "Prüfbare Lernziele und kognitive Stufen des Wissens", page: "12" },
                { id: "0.6", title: "Die Foundation-Level-Zertifizierungsprüfung", page: "12" },
                { id: "0.7", title: "Akkreditierung", page: "12" },
                { id: "0.8", title: "Umgang mit Standards", page: "12" },
                { id: "0.9", title: "Auf dem Laufenden bleiben", page: "13" },
                { id: "0.10", title: "Detaillierungsgrad", page: "13" },
                { id: "0.11", title: "Aufbau des Lehrplans", page: "13" }
            ]
        },
        {
            chapter: "1",
            title: "Grundlagen des Testens – 180 Minuten",
            page: "15",
            sections: [
                { id: "1.1", title: "Was ist Testen?", page: "16" },
                { id: "1.1.1", title: "Testziele", page: "16" },
                { id: "1.1.2", title: "Testen und Debugging", page: "17" },
                { id: "1.2", title: "Warum ist Testen notwendig?", page: "18" },
                { id: "1.2.1", title: "Der Beitrag des Testens zum Erfolg", page: "18" },
                { id: "1.2.2", title: "Testen und Qualitätssicherung", page: "18" },
                { id: "1.2.3", title: "Fehlhandlungen, Fehlerzustände, Fehlerwirkungen und Grundursachen", page: "19" },
                { id: "1.3", title: "Grundsätze des Testens", page: "19" },
                { id: "1.4", title: "Testaktivitäten, Testmittel und Rollen des Testens", page: "20" },
                { id: "1.4.1", title: "Testaktivitäten und -aufgaben", page: "21" },
                { id: "1.4.2", title: "Testprozess im Kontext", page: "22" },
                { id: "1.4.3", title: "Testmittel", page: "22" },
                { id: "1.4.4", title: "Verfolgbarkeit zwischen der Testbasis und den Testmitteln", page: "23" },
                { id: "1.4.5", title: "Rollen des Testens", page: "24" },
                { id: "1.5", title: "Wesentliche Kompetenzen und bewährte Praktiken beim Testen", page: "24" },
                { id: "1.5.2", title: "Whole-Team-Ansatz (Whole Team Approach)", page: "25" },
                { id: "1.5.3", title: "Unabhängigkeit des Testens", page: "26" }
            ]
        },
        {
            chapter: "2",
            title: "Testen während des Softwareentwicklungslebenszyklus – 130 Minuten",
            page: "27",
            sections: [
                { id: "2.1", title: "Testen im Kontext eines Softwareentwicklungslebenszyklus (SDLC)", page: "28" },
                { id: "2.1.1", title: "Auswirkungen des Softwareentwicklungslebenszyklus auf das Testen", page: "28" },
                { id: "2.1.2", title: "Softwareentwicklungslebenszyklus und gute Praktiken für das Testen", page: "29" },
                { id: "2.1.3", title: "Testen als Treiber für die Softwareentwicklung", page: "29" },
                { id: "2.1.4", title: "DevOps und Testen", page: "30" },
                { id: "2.1.5", title: "Shift-Left", page: "31" },
                { id: "2.1.6", title: "Retrospektiven und Prozessverbesserung", page: "31" },
                { id: "2.2", title: "Teststufen und Testarten", page: "32" },
                { id: "2.2.1", title: "Teststufen", page: "32" },
                { id: "2.2.2", title: "Testarten", page: "33" },
                { id: "2.2.3", title: "Fehlernachtest und Regressionstest", page: "34" },
                { id: "2.3", title: "Wartungstest", page: "35" }
            ]
        },
        {
            chapter: "3",
            title: "Statischer Test – 80 Minuten",
            page: "37",
            sections: [
                { id: "3.1", title: "Grundlagen des statischen Tests", page: "38" },
                { id: "3.1.1", title: "Arbeitsergebnisse, die durch statische Tests untersucht werden können", page: "38" },
                { id: "3.1.2", title: "Wert des statischen Tests", page: "38" },
                { id: "3.1.3", title: "Unterschiede zwischen statischem Test und dynamischem Test", page: "39" },
                { id: "3.2", title: "Feedback- und Reviewprozess", page: "40" },
                { id: "3.2.1", title: "Vorteile eines frühzeitigen und häufigen Stakeholder-Feedbacks", page: "40" },
                { id: "3.2.2", title: "Aktivitäten des Reviewprozesses", page: "40" },
                { id: "3.2.3", title: "Rollen und Verantwortlichkeiten bei Reviews", page: "41" },
                { id: "3.2.4", title: "Arten von Reviews", page: "42" },
                { id: "3.2.5", title: "Erfolgsfaktoren für Reviews", page: "43" }
            ]
        },
        {
            chapter: "4",
            title: "Testanalyse und -entwurf – 390 Minuten",
            page: "44",
            sections: [
                { id: "4.1", title: "Testverfahren im Überblick", page: "45" },
                { id: "4.2", title: "Black-Box-Testverfahren", page: "45" },
                { id: "4.2.1", title: "Äquivalenzklassenbildung", page: "45" },
                { id: "4.2.2", title: "Grenzwertanalyse", page: "46" },
                { id: "4.2.3", title: "Entscheidungstabellentest", page: "47" },
                { id: "4.2.4", title: "Zustandsübergangstest", page: "48" },
                { id: "4.3", title: "White-Box-Testverfahren", page: "49" },
                { id: "4.3.1", title: "Anweisungstest und Anweisungsüberdeckung", page: "50" },
                { id: "4.3.2", title: "Zweigtest und Zweigüberdeckung", page: "50" },
                { id: "4.3.3", title: "Der Wert des White-Box-Tests", page: "51" },
                { id: "4.4", title: "Erfahrungsbasierter Test", page: "51" },
                { id: "4.4.1", title: "Intuitive Testfallermittlung", page: "51" },
                { id: "4.4.2", title: "Explorativer Test", page: "52" },
                { id: "4.4.3", title: "Checklistenbasierter Test", page: "52" },
                { id: "4.5", title: "Auf Zusammenarbeit basierende Testansätze", page: "53" },
                { id: "4.5.1", title: "Gemeinsames Schreiben von User-Storys", page: "53" },
                { id: "4.5.2", title: "Akzeptanzkriterien", page: "Fehler! Textmarke nicht definiert." },
                { id: "4.5.3", title: "Abnahmetestgetriebene Entwicklung (ATDD)", page: "54" }
            ]
        },
        {
            chapter: "5",
            title: "Management der Testaktivitäten – 335 Minuten",
            page: "56",
            sections: [
                { id: "5.1", title: "Testplanung", page: "57" },
                { id: "5.1.1", title: "Zweck und Inhalt eines Testkonzepts", page: "57" },
                { id: "5.1.2", title: "Der Beitrag des Testers zur Iterations- und Releaseplanung", page: "57" },
                { id: "5.1.3", title: "Eingangskriterien und Endekriterien", page: "58" },
                { id: "5.1.4", title: "Schätzverfahren", page: "59" },
                { id: "5.1.5", title: "Priorisierung von Testfällen", page: "60" },
                { id: "5.1.6", title: "Testpyramide", page: "60" },
                { id: "5.1.7", title: "Testquadranten", page: "61" },
                { id: "5.2", title: "Risikomanagement", page: "62" },
                { id: "5.2.1", title: "Risikodefinition und Risikoattribute", page: "62" },
                { id: "5.2.2", title: "Projektrisiken und Produktrisiken", page: "62" },
                { id: "5.2.3", title: "Produktrisikoanalyse", page: "63" },
                { id: "5.2.4", title: "Produktrisikosteuerung", page: "64" },
                { id: "5.3", title: "Testüberwachung, Teststeuerung und Testabschluss", page: "64" },
                { id: "5.3.1", title: "Beim Testen verwendete Metriken", page: "65" },
                { id: "5.3.2", title: "Zweck, Inhalt und Zielgruppen für Testberichte", page: "65" },
                { id: "5.3.3", title: "Kommunikation des Teststatus", page: "67" },
                { id: "5.4", title: "Konfigurationsmanagement", page: "67" },
                { id: "5.5", title: "Fehlermanagement", page: "68" }
            ]
        },
        {
            chapter: "6",
            title: "Testwerkzeuge – 20 Minuten",
            page: "70",
            sections: [
                { id: "6.1", title: "Werkzeugunterstützung für das Testen", page: "71" },
                { id: "6.2", title: "Nutzen und Risiken von Testautomatisierung", page: "71" }
            ]
        },
        {
            chapter: "7",
            title: "Literaturhinweise",
            page: "73",
            sections: [
                { id: "7.1", title: "Normen und Standards", page: "73" },
                { id: "7.2", title: "Fachliteratur", page: "73" },
                { id: "7.3", title: "Artikel und Internetquellen", page: "75" },
                { id: "7.4", title: "Deutschsprachige Bücher und Artikel (in diesem Lehrplan nicht direkt referenziert)", page: "76" }
            ]
        },
        {
            chapter: "8",
            title: "Anhang A – Lernziele/kognitive Stufen des Wissens",
            page: "77"
        },
        {
            chapter: "9",
            title: "Anhang B – Verfolgbarkeitsmatrix des geschäftlichen Nutzens (Business Outcomes) mit Lernzielen",
            page: "79"
        },
        {
            chapter: "10",
            title: "Anhang C – Release Notes",
            page: "85"
        },
        {
            chapter: "11",
            title: "Index",
            page: "91"
        }
    ];

    const handleSectionClick = (sectionId: string, title: string) => {
        // Convert section ID to navigation format
        const chapterNum = sectionId.split('.')[0];
        const chapterMap: Record<string, string> = {
            '0': '0_Einführung',
            '1': '1_Grundlagen_des_Testens',
            '2': '2_Testen_während_des_Softwareentwicklungslebenszyklus',
            '3': '3_Statischer_Test',
            '4': '4_Testanalyse_und_-entwurf',
            '5': '5_Management_der_Testaktivitäten',
            '6': '6_Testwerkzeuge',
            '7': '7_Literaturhinweise',
            '8': '8_Anhang_A_Lernziele',
            '9': '9_Anhang_B_Verfolgbarkeitsmatrix',
            '10': '10_Anhang_C_Release_Notes',
            '11': '11_Index'
        };

        const chapterPath = chapterMap[chapterNum];
        if (chapterPath) {
            // Create a safe section name for URL
            const sectionName = title.replace(/[^\w\säöüÄÖÜß-]/g, '').replace(/\s+/g, '_');
            navigate(`/documentation/${chapterPath}/${sectionId}_${sectionName}`);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto p-8 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <BookOpen className="w-12 h-12 text-amber-600 mr-4" />
                        <h1 className="text-4xl font-bold">ISTQB Foundation Level</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Standardglossar der Begriffe des Softwaretestens - Vollständiger Lehrplan
                    </p>
                </div>

                {/* Curriculum Content */}
                <div className="space-y-8">
                    {curriculumStructure.map((chapter) => (
                        <div key={chapter.chapter} className="bg-card rounded-lg border p-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                                onClick={() => chapter.sections ? null : handleSectionClick(chapter.chapter, chapter.title)}
                            >
                                <h2 className="text-xl font-semibold text-card-foreground">
                                    {chapter.title}
                                </h2>
                                {chapter.page && (
                                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        Seite {chapter.page}
                                    </span>
                                )}
                            </div>

                            {chapter.sections && (
                                <div className="space-y-2 ml-4">
                                    {chapter.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between p-3 hover:bg-accent/30 rounded cursor-pointer transition-colors group"
                                            onClick={() => handleSectionClick(section.id, section.title)}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-primary mr-3 min-w-[3rem]">
                                                    {section.id}
                                                </span>
                                                <span className="text-foreground group-hover:text-primary transition-colors">
                                                    {section.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    {section.page}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
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
};

export default DocumentationIndexPage;

