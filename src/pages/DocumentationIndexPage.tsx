import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const DocumentationIndexPage: React.FC = () => {
    const navigate = useNavigate();

    // Dynamically generated curriculum structure based on real file order (sorted numerically)
    const curriculumStructure = [
        {
            chapter: "0_Einführung",
            title: "Einführung",
            sections: [
                { id: "0.1", file: "0.1_Zweck_dieses_Dokuments.md", title: "Zweck dieses Dokuments" },
                { id: "0.2", file: "0.2_Certified_Tester_Foundation_Level_im_Softwaretest.md", title: "Certified Tester Foundation Level im Softwaretest" },
                { id: "0.3", file: "0.3_Karriereweg_für_Tester.md", title: "Karriereweg für Tester" },
                { id: "0.4", file: "0.4_Geschäftlicher_Nutzen.md", title: "Geschäftlicher Nutzen" },
                { id: "0.5", file: "0.5_Prüfbare_Lernziele_und_kognitive_Stufen_des_Wissens.md", title: "Prüfbare Lernziele und kognitive Stufen des Wissens" },
                { id: "0.6", file: "0.6_Die_Foundation-Level-Zertifizierungsprüfung.md", title: "Die Foundation-Level-Zertifizierungsprüfung" },
                { id: "0.7", file: "0.7_Akkreditierung.md", title: "Akkreditierung" },
                { id: "0.8", file: "0.8_Umgang_mit_Standards.md", title: "Umgang mit Standards" },
                { id: "0.9", file: "0.9_Auf_dem_Laufenden_bleiben.md", title: "Auf dem Laufenden bleiben" },
                { id: "0.10", file: "0.10_Detaillierungsgrad.md", title: "Detaillierungsgrad" },
                { id: "0.11", file: "0.11_Aufbau_des_Lehrplans.md", title: "Aufbau des Lehrplans" },
            ]
        },
        {
            chapter: "1_Grundlagen_des_Testens",
            title: "1. Grundlagen des Testens",
            sections: [
                { id: "1.", file: "1_Grundlagen_des_Testens.md", title: "Grundlagen des Testens" },
                { id: "1.1", file: "1.1_Was_ist_Testen.md", title: "Was ist Testen?" },
                { id: "1.1.1", file: "1.1.1_Testziele.md", title: "Testziele" },
                { id: "1.1.2", file: "1.1.2_Testen_und_Debugging.md", title: "Testen und Debugging" },
                { id: "1.2", file: "1.2_Warum_ist_Testen_notwendig.md", title: "Warum ist Testen notwendig?" },
                { id: "1.2.1", file: "1.2.1_Der_Beitrag_des_Testens_zum_Erfolg.md", title: "Der Beitrag des Testens zum Erfolg" },
                { id: "1.2.2", file: "1.2.2_Testen_und_Qualitätssicherung.md", title: "Testen und Qualitätssicherung" },
                { id: "1.2.3", file: "1.2.3_Fehlhandlungen_Fehlerzustände_Fehlerwirkungen_und_Grundursachen.md", title: "Fehlhandlungen, Fehlerzustände, Fehlerwirkungen und Grundursachen" },
                { id: "1.3", file: "1.3_Grundsätze_des_Testens.md", title: "Grundsätze des Testens" },
                { id: "1.4", file: "1.4_Testaktivitäten_Testmittel_und_Rollen_des_Testens.md", title: "Testaktivitäten, Testmittel und Rollen des Testens" },
                { id: "1.4.1", file: "1.4.1_Testaktivitäten_und_-aufgaben.md", title: "Testaktivitäten und -aufgaben" },
                { id: "1.4.2", file: "1.4.2_Testprozess_im_Kontext.md", title: "Testprozess im Kontext" },
                { id: "1.4.3", file: "1.4.3_Testmittel.md", title: "Testmittel" },
                { id: "1.4.4", file: "1.4.4_Verfolgbarkeit_zwischen_der_Testbasis_und_den_Testmitteln.md", title: "Verfolgbarkeit zwischen der Testbasis und den Testmitteln" },
                { id: "1.4.5", file: "1.4.5_Rollen_des_Testens.md", title: "Rollen des Testens" },
                { id: "1.5", file: "1.5_Wesentliche_Kompetenzen_und_bewährte_Praktiken_beim_Testen.md", title: "Wesentliche Kompetenzen und bewährte Praktiken beim Testen" },
                { id: "1.5.1", file: "1.5.1_Allgemeine_Kompetenzen_die_für_das_Testen_erforderlich_sind.md", title: "Allgemeine Kompetenzen, die für das Testen erforderlich sind" },
                { id: "1.5.2", file: "1.5.2_Whole-Team-Ansatz.md", title: "Whole-Team-Ansatz" },
                { id: "1.5.3", file: "1.5.3_Unabhängigkeit_des_Testens.md", title: "Unabhängigkeit des Testens" },
            ]
        },
        {
            chapter: "2_Testen_während_des_Softwareentwicklungslebenszyklus",
            title: "2. Testen während des Softwareentwicklungslebenszyklus",
            sections: [
                { id: "2.", file: "2_Testen_während_des_Softwareentwicklungslebenszyklus.md", title: "Testen während des Softwareentwicklungslebenszyklus" },
                { id: "2.1", file: "2.1_Testen_im_Kontext_eines_SDLC.md", title: "Testen im Kontext eines SDLC" },
                { id: "2.1.1", file: "2.1.1_Auswirkungen_des_SDLC_auf_das_Testen.md", title: "Auswirkungen des SDLC auf das Testen" },
                { id: "2.1.2", file: "2.1.2_SDLC_und_gute_Praktiken_für_das_Testen.md", title: "SDLC und gute Praktiken für das Testen" },
                { id: "2.1.3", file: "2.1.3_Testen_als_Treiber_für_die_Softwareentwicklung.md", title: "Testen als Treiber für die Softwareentwicklung" },
                { id: "2.1.4", file: "2.1.4_DevOps_und_Testen.md", title: "DevOps und Testen" },
                { id: "2.1.5", file: "2.1.5_Shift-Left.md", title: "Shift-Left" },
                { id: "2.1.6", file: "2.1.6_Retrospektiven_und_Prozessverbesserung.md", title: "Retrospektiven und Prozessverbesserung" },
                { id: "2.2", file: "2.2_Teststufen_und_Testarten.md", title: "Teststufen und Testarten" },
                { id: "2.2.1", file: "2.2.1_Teststufen.md", title: "Teststufen" },
                { id: "2.2.2", file: "2.2.2_Testarten.md", title: "Testarten" },
                { id: "2.2.3", file: "2.2.3_Fehlernachtest_und_Regressionstest.md", title: "Fehlernachtest und Regressionstest" },
                { id: "2.3", file: "2.3_Wartungstest.md", title: "Wartungstest" },
            ]
        },
        {
            chapter: "3_Statischer_Test",
            title: "3. Statischer Test",
            sections: [
                { id: "3.", file: "3_Statischer_Test.md", title: "Statischer Test" },
                { id: "3.1", file: "3.1_Grundlagen_des_statischen_Tests.md", title: "Grundlagen des statischen Tests" },
                { id: "3.1.1", file: "3.1.1_Arbeitsergebnisse_für_statische_Tests.md", title: "Arbeitsergebnisse für statische Tests" },
                { id: "3.1.2", file: "3.1.2_Wert_des_statischen_Tests.md", title: "Wert des statischen Tests" },
                { id: "3.1.3", file: "3.1.3_Unterschiede_zwischen_statischem_und_dynamischem_Test.md", title: "Unterschiede zwischen statischem und dynamischem Test" },
                { id: "3.2", file: "3.2_Feedback-_und_Reviewprozess.md", title: "Feedback- und Reviewprozess" },
                { id: "3.2.1", file: "3.2.1_Vorteile_frühzeitigen_Stakeholder-Feedbacks.md", title: "Vorteile frühzeitigen Stakeholder-Feedbacks" },
                { id: "3.2.2", file: "3.2.2_Aktivitäten_des_Reviewprozesses.md", title: "Aktivitäten des Reviewprozesses" },
                { id: "3.2.3", file: "3.2.3_Rollen_und_Verantwortlichkeiten_bei_Reviews.md", title: "Rollen und Verantwortlichkeiten bei Reviews" },
                { id: "3.2.4", file: "3.2.4_Arten_von_Reviews.md", title: "Arten von Reviews" },
                { id: "3.2.5", file: "3.2.5_Erfolgsfaktoren_für_Reviews.md", title: "Erfolgsfaktoren für Reviews" },
            ]
        },
        {
            chapter: "4_Testanalyse_und_-entwurf",
            title: "4. Testanalyse und -entwurf",
            sections: [
                { id: "4.", file: "4_Testanalyse_und_entwurf.md", title: "Testanalyse und -entwurf" },
                { id: "4.1", file: "4.1_Testverfahren_im_Überblick.md", title: "Testverfahren im Überblick" },
                { id: "4.2", file: "4.2_Black-Box-Testverfahren.md", title: "Black-Box-Testverfahren" },
                { id: "4.2.1", file: "4.2.1_Äquivalenzklassenbildung.md", title: "Äquivalenzklassenbildung" },
                { id: "4.2.2", file: "4.2.2_Grenzwertanalyse.md", title: "Grenzwertanalyse" },
                { id: "4.2.3", file: "4.2.3_Entscheidungstabellentest.md", title: "Entscheidungstabellentest" },
                { id: "4.2.4", file: "4.2.4_Zustandsübergangstest.md", title: "Zustandsübergangstest" },
                { id: "4.3", file: "4.3_White-Box-Testverfahren.md", title: "White-Box-Testverfahren" },
                { id: "4.3.1", file: "4.3.1_Anweisungstest_und_Anweisungsüberdeckung.md", title: "Anweisungstest und Anweisungsüberdeckung" },
                { id: "4.3.2", file: "4.3.2_Zweigtest_und_Zweigüberdeckung.md", title: "Zweigtest und Zweigüberdeckung" },
                { id: "4.3.3", file: "4.3.3_Der_Wert_des_White-Box-Tests.md", title: "Der Wert des White-Box-Tests" },
                { id: "4.4", file: "4.4_Erfahrungsbasierter_Test.md", title: "Erfahrungsbasierter Test" },
                { id: "4.4.1", file: "4.4.1_Intuitive_Testfallermittlung.md", title: "Intuitive Testfallermittlung" },
                { id: "4.4.2", file: "4.4.2_Explorativer_Test.md", title: "Explorativer Test" },
                { id: "4.4.3", file: "4.4.3_Checklistenbasierter_Test.md", title: "Checklistenbasierter Test" },
                { id: "4.5", file: "4.5_Auf_Zusammenarbeit_basierende_Testansätze.md", title: "Auf Zusammenarbeit basierende Testansätze" },
                { id: "4.5.1", file: "4.5.1_Gemeinsames_Schreiben_von_User-Storys.md", title: "Gemeinsames Schreiben von User-Storys" },
                { id: "4.5.2", file: "4.5.2_Akzeptanzkriterien.md", title: "Akzeptanzkriterien" },
                { id: "4.5.3", file: "4.5.3_Abnahmetestgetriebene_Entwicklung_ATDD.md", title: "Abnahmetestgetriebene Entwicklung ATDD" },
            ]
        },
        {
            chapter: "5_Management_der_Testaktivitäten",
            title: "5. Management der Testaktivitäten",
            sections: [
                { id: "5.", file: "5. Management_der_Testaktivitäten.md", title: "5. Management der Testaktivitäten" },
                { id: "5.1", file: "5.1_Testplanung.md", title: "Testplanung" },
                { id: "5.1.1", file: "5.1.1_Zweck_und_Inhalt_eines_Testkonzepts.md", title: "Zweck und Inhalt eines Testkonzepts" },
                { id: "5.1.2", file: "5.1.2_Beitrag_des_Testers_zur_Iterations-_und_Releaseplanung.md", title: "Beitrag des Testers zur Iterations- und Releaseplanung" },
                { id: "5.1.3", file: "5.1.3_Eingangskriterien_und_Endekriterien.md", title: "Eingangskriterien und Endekriterien" },
                { id: "5.1.4", file: "5.1.4_Schätzverfahren.md", title: "Schätzverfahren" },
                { id: "5.1.5", file: "5.1.5_Priorisierung_von_Testfällen.md", title: "Priorisierung von Testfällen" },
                { id: "5.1.6", file: "5.1.6_Testpyramide.md", title: "Testpyramide" },
                { id: "5.1.7", file: "5.1.7_Testquadranten.md", title: "Testquadranten" },
                { id: "5.2", file: "5.2_Risikomanagement.md", title: "Risikomanagement" },
                { id: "5.2.1", file: "5.2.1_Risikodefinition_und_Risikoattribute.md", title: "Risikodefinition und Risikoattribute" },
                { id: "5.2.2", file: "5.2.2_Projektrisiken_und_Produktrisiken.md", title: "Projektrisiken und Produktrisiken" },
                { id: "5.2.3", file: "5.2.3_Produktrisikoanalyse.md", title: "Produktrisikoanalyse" },
                { id: "5.2.4", file: "5.2.4_Produktrisikosteuerung.md", title: "Produktrisikosteuerung" },
                { id: "5.3", file: "5.3_Testüberwachung_Teststeuerung_und_Testabschluss.md", title: "Testüberwachung, Teststeuerung und Testabschluss" },
                { id: "5.3.1", file: "5.3.1_Beim_Testen_verwendete_Metriken.md", title: "Beim Testen verwendete Metriken" },
                { id: "5.3.2", file: "5.3.2_Zweck_Inhalt_und_Zielgruppen_für_Testberichte.md", title: "Zweck, Inhalt und Zielgruppen für Testberichte" },
                { id: "5.3.3", file: "5.3.3_Kommunikation_des_Teststatus.md", title: "Kommunikation des Teststatus" },
                { id: "5.4", file: "5.4_Konfigurationsmanagement.md", title: "Konfigurationsmanagement" },
                { id: "5.5", file: "5.5_Fehlermanagement.md", title: "Fehlermanagement" },
            ]
        },
        {
            chapter: "6_Testwerkzeuge",
            title: "6. Testwerkzeuge",
            sections: [
                { id: "6.", file: "6_Testwerkzeuge.md", title: "Testwerkzeuge" },
                { id: "6.1", file: "6.1_Werkzeugunterstützung_für_das_Testen.md", title: "Werkzeugunterstützung für das Testen" },
                { id: "6.2", file: "6.2_Nutzen_und_Risiken_von_Testautomatisierung.md", title: "Nutzen und Risiken von Testautomatisierung" },
            ]
        },
        {
            chapter: "7_Literaturhinweise",
            title: "7. Literaturhinweise",
            sections: [
                { id: "7.", file: "7_Literaturhinweise.md", title: "Literaturhinweise" },
                { id: "7.1", file: "7.1_Normen_und_Standards.md", title: "Normen und Standards" },
                { id: "7.2", file: "7.2_Fachliteratur.md", title: "Fachliteratur" },
                { id: "7.3", file: "7.3_Artikel_und_Internetquellen.md", title: "Artikel und Internetquellen" },
                { id: "7.4", file: "7.4_Deutschsprachige_Bücher_und_Artikel.md", title: "Deutschsprachige Bücher und Artikel" },
            ]
        },
        {
            chapter: "8_Anhang_A",
            title: "8. Anhang A",
            sections: [
                { id: "8.", file: "8_Anhang_A_Lernziele_kognitive_Stufen_des_Wissens.md", title: "Anhang A Lernziele/kognitive Stufen des Wissens" },
            ]
        },
        {
            chapter: "9_Anhang_B",
            title: "9. Anhang B",
            sections: [
                { id: "9.", file: "9_Anhang_B_Verfolgbarkeitsmatrix_Business_Outcomes.md", title: "Anhang B Verfolgbarkeitsmatrix Business Outcomes" },
            ]
        },
        {
            chapter: "10_Anhang_C",
            title: "10. Anhang C",
            sections: [
                { id: "10.", file: "10_Anhang_C_Release_Notes.md", title: "Anhang C Release Notes" },
            ]
        },
        {
            chapter: "11_Index",
            title: "11. Index",
            sections: [
                { id: "11.", file: "11_Index.md", title: "Index" },
            ]
        }
        // ...existing code for other chapters, using the same pattern and sorted file order...
    ];

    const handleSectionClick = (chapter: string, fileName: string) => {
        // Navigate using the actual file name without .md extension
        const sectionName = fileName.replace('.md', '');
        navigate(`/documentation/${chapter}/${sectionName}`);
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
                                onClick={() => navigate(`/documentation/${chapter.chapter}`)}
                            >
                                <h2 className="text-xl font-semibold text-card-foreground">
                                    {chapter.title}
                                </h2>

                            </div>

                            {chapter.sections && (
                                <div className="space-y-2 ml-4">
                                    {chapter.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between p-3 hover:bg-accent/30 rounded cursor-pointer transition-colors group"
                                            onClick={() => handleSectionClick(chapter.chapter, section.file)}
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

