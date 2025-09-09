import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface DocumentationPageProps { }

const DocumentationPage: React.FC<DocumentationPageProps> = () => {
    const { chapter, section } = useParams<{ chapter: string; section: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');

    // Bölüm alt başlıkları (gerçek dosya sistemine göre)
    const allSectionIndex: { [chapter: string]: { file: string; title: string }[] } = {
        '0_Einführung': [
            { file: '0.1_Zweck_dieses_Dokuments.md', title: '0.1 Zweck dieses Dokuments' },
            { file: '0.2_Certified_Tester_Foundation_Level_im_Softwaretest.md', title: '0.2 Certified Tester Foundation Level im Softwaretest' },
            { file: '0.3_Karriereweg_für_Tester.md', title: '0.3 Karriereweg für Tester' },
            { file: '0.4_Geschäftlicher_Nutzen.md', title: '0.4 Geschäftlicher Nutzen' },
            { file: '0.5_Prüfbare_Lernziele_und_kognitive_Stufen_des_Wissens.md', title: '0.5 Prüfbare Lernziele und kognitive Stufen des Wissens' },
            { file: '0.6_Die_Foundation-Level-Zertifizierungsprüfung.md', title: '0.6 Die Foundation-Level-Zertifizierungsprüfung' },
            { file: '0.7_Akkreditierung.md', title: '0.7 Akkreditierung' },
            { file: '0.8_Umgang_mit_Standards.md', title: '0.8 Umgang mit Standards' },
            { file: '0.9_Auf_dem_Laufenden_bleiben.md', title: '0.9 Auf dem Laufenden bleiben' },
            { file: '0.10_Detaillierungsgrad.md', title: '0.10 Detaillierungsgrad' },
            { file: '0.11_Aufbau_des_Lehrplans.md', title: '0.11 Aufbau des Lehrplans' },
        ],
        '1_Grundlagen_des_Testens': [
            { file: '1.1_Was_ist_Testen.md', title: '1.1 Was ist Testen?' },
            { file: '1.1.1_Testziele.md', title: '1.1.1 Testziele' },
            { file: '1.1.2_Testen_und_Debugging.md', title: '1.1.2 Testen und Debugging' },
            { file: '1.2_Warum_ist_Testen_notwendig.md', title: '1.2 Warum ist Testen notwendig?' },
            { file: '1.2.1_Der_Beitrag_des_Testens_zum_Erfolg.md', title: '1.2.1 Der Beitrag des Testens zum Erfolg' },
            { file: '1.2.2_Testen_und_Qualitätssicherung.md', title: '1.2.2 Testen und Qualitätssicherung' },
            { file: '1.2.3_Fehlhandlungen_Fehlerzustände_Fehlerwirkungen_und_Grundursachen.md', title: '1.2.3 Fehlhandlungen, Fehlerzustände, Fehlerwirkungen und Grundursachen' },
            { file: '1.3_Grundsätze_des_Testens.md', title: '1.3 Grundsätze des Testens' },
            { file: '1.4_Testaktivitäten_Testmittel_und_Rollen_des_Testens.md', title: '1.4 Testaktivitäten, Testmittel und Rollen des Testens' },
            { file: '1.4.1_Testaktivitäten_und_-aufgaben.md', title: '1.4.1 Testaktivitäten und -aufgaben' },
            { file: '1.4.2_Testprozess_im_Kontext.md', title: '1.4.2 Testprozess im Kontext' },
            { file: '1.4.3_Testmittel.md', title: '1.4.3 Testmittel' },
            { file: '1.4.4_Verfolgbarkeit_zwischen_der_Testbasis_und_den_Testmitteln.md', title: '1.4.4 Verfolgbarkeit zwischen der Testbasis und den Testmitteln' },
            { file: '1.4.5_Rollen_des_Testens.md', title: '1.4.5 Rollen des Testens' },
            { file: '1.5_Wesentliche_Kompetenzen_und_bewährte_Praktiken_beim_Testen.md', title: '1.5 Wesentliche Kompetenzen und bewährte Praktiken beim Testen' },
            { file: '1.5.1_Allgemeine_Kompetenzen_die_für_das_Testen_erforderlich_sind.md', title: '1.5.1 Allgemeine Kompetenzen, die für das Testen erforderlich sind' },
            { file: '1.5.2_Whole-Team-Ansatz.md', title: '1.5.2 Whole-Team-Ansatz' },
            { file: '1.5.3_Unabhängigkeit_des_Testens.md', title: '1.5.3 Unabhängigkeit des Testens' },
        ],
        '2_Testen_während_des_Softwareentwicklungslebenszyklus': [
            { file: '2.1_Testen_im_Kontext_eines_SDLC.md', title: '2.1 Testen im Kontext eines SDLC' },
            { file: '2.1.1_Auswirkungen_des_SDLC_auf_das_Testen.md', title: '2.1.1 Auswirkungen des SDLC auf das Testen' },
            { file: '2.1.2_SDLC_und_gute_Praktiken_für_das_Testen.md', title: '2.1.2 SDLC und gute Praktiken für das Testen' },
            { file: '2.1.3_Testen_als_Treiber_für_die_Softwareentwicklung.md', title: '2.1.3 Testen als Treiber für die Softwareentwicklung' },
            { file: '2.1.4_DevOps_und_Testen.md', title: '2.1.4 DevOps und Testen' },
            { file: '2.1.5_Shift-Left.md', title: '2.1.5 Shift-Left' },
            { file: '2.1.6_Retrospektiven_und_Prozessverbesserung.md', title: '2.1.6 Retrospektiven und Prozessverbesserung' },
            { file: '2.2_Teststufen_und_Testarten.md', title: '2.2 Teststufen und Testarten' },
            { file: '2.2.1_Teststufen.md', title: '2.2.1 Teststufen' },
            { file: '2.2.2_Testarten.md', title: '2.2.2 Testarten' },
            { file: '2.2.3_Fehlernachtest_und_Regressionstest.md', title: '2.2.3 Fehlernachtest und Regressionstest' },
            { file: '2.3_Wartungstest.md', title: '2.3 Wartungstest' },
        ],
        '3_Statischer_Test': [
            { file: '3.1_Grundlagen_des_statischen_Tests.md', title: '3.1 Grundlagen des statischen Tests' },
            { file: '3.1.1_Arbeitsergebnisse_für_statische_Tests.md', title: '3.1.1 Arbeitsergebnisse für statische Tests' },
            { file: '3.1.2_Wert_des_statischen_Tests.md', title: '3.1.2 Wert des statischen Tests' },
            { file: '3.1.3_Unterschiede_zwischen_statischem_und_dynamischem_Test.md', title: '3.1.3 Unterschiede zwischen statischem und dynamischem Test' },
            { file: '3.2_Feedback-_und_Reviewprozess.md', title: '3.2 Feedback- und Reviewprozess' },
            { file: '3.2.1_Vorteile_frühzeitigen_Stakeholder-Feedbacks.md', title: '3.2.1 Vorteile frühzeitigen Stakeholder-Feedbacks' },
            { file: '3.2.2_Aktivitäten_des_Reviewprozesses.md', title: '3.2.2 Aktivitäten des Reviewprozesses' },
            { file: '3.2.3_Rollen_und_Verantwortlichkeiten_bei_Reviews.md', title: '3.2.3 Rollen und Verantwortlichkeiten bei Reviews' },
            { file: '3.2.4_Arten_von_Reviews.md', title: '3.2.4 Arten von Reviews' },
            { file: '3.2.5_Erfolgsfaktoren_für_Reviews.md', title: '3.2.5 Erfolgsfaktoren für Reviews' },
        ],
        '4_Testanalyse_und_-entwurf': [
            { file: '4.1_Testverfahren_im_Überblick.md', title: '4.1 Testverfahren im Überblick' },
            { file: '4.2.1_Äquivalenzklassenbildung.md', title: '4.2.1 Äquivalenzklassenbildung' },
            { file: '4.2.2_Grenzwertanalyse.md', title: '4.2.2 Grenzwertanalyse' },
            { file: '4.2.3_Entscheidungstabellentest.md', title: '4.2.3 Entscheidungstabellentest' },
            { file: '4.2.4_Zustandsübergangstest.md', title: '4.2.4 Zustandsübergangstest' },
            { file: '4.2_Black-Box-Testverfahren.md', title: '4.2 Black-Box-Testverfahren' },
            { file: '4.3.1_Anweisungstest_und_Anweisungsüberdeckung.md', title: '4.3.1 Anweisungstest und Anweisungsüberdeckung' },
            { file: '4.3.2_Zweigtest_und_Zweigüberdeckung.md', title: '4.3.2 Zweigtest und Zweigüberdeckung' },
            { file: '4.3.3_Der_Wert_des_White-Box-Tests.md', title: '4.3.3 Der Wert des White-Box-Tests' },
            { file: '4.3_White-Box-Testverfahren.md', title: '4.3 White-Box-Testverfahren' },
            { file: '4.4.1_Intuitive_Testfallermittlung.md', title: '4.4.1 Intuitive Testfallermittlung' },
            { file: '4.4.2_Explorativer_Test.md', title: '4.4.2 Explorativer Test' },
            { file: '4.4.3_Checklistenbasierter_Test.md', title: '4.4.3 Checklistenbasierter Test' },
            { file: '4.4_Erfahrungsbasierter_Test.md', title: '4.4 Erfahrungsbasierter Test' },
            { file: '4.5.1_Gemeinsames_Schreiben_von_User-Storys.md', title: '4.5.1 Gemeinsames Schreiben von User-Storys' },
            { file: '4.5.2_Akzeptanzkriterien.md', title: '4.5.2 Akzeptanzkriterien' },
            { file: '4.5.3_Abnahmetestgetriebene_Entwicklung_ATDD.md', title: '4.5.3 Abnahmetestgetriebene Entwicklung ATDD' },
            { file: '4.5_Auf_Zusammenarbeit_basierende_Testansätze.md', title: '4.5 Auf Zusammenarbeit basierende Testansätze' },
        ],
        '5_Management_der_Testaktivitäten': [
            { file: '5.1.1_Zweck_und_Inhalt_eines_Testkonzepts.md', title: '5.1.1 Zweck und Inhalt eines Testkonzepts' },
            { file: '5.1.2_Beitrag_des_Testers_zur_Iterations-_und_Releaseplanung.md', title: '5.1.2 Beitrag des Testers zur Iterations- und Releaseplanung' },
            { file: '5.1.3_Eingangskriterien_und_Endekriterien.md', title: '5.1.3 Eingangskriterien und Endekriterien' },
            { file: '5.1.4_Schätzverfahren.md', title: '5.1.4 Schätzverfahren' },
            { file: '5.1.5_Priorisierung_von_Testfällen.md', title: '5.1.5 Priorisierung von Testfällen' },
            { file: '5.1.6_Testpyramide.md', title: '5.1.6 Testpyramide' },
            { file: '5.1.7_Testquadranten.md', title: '5.1.7 Testquadranten' },
            { file: '5.1_Testplanung.md', title: '5.1 Testplanung' },
            { file: '5.2.1_Risikodefinition_und_Risikoattribute.md', title: '5.2.1 Risikodefinition und Risikoattribute' },
            { file: '5.2.2_Projektrisiken_und_Produktrisiken.md', title: '5.2.2 Projektrisiken und Produktrisiken' },
            { file: '5.2.3_Produktrisikoanalyse.md', title: '5.2.3 Produktrisikoanalyse' },
            { file: '5.2.4_Produktrisikosteuerung.md', title: '5.2.4 Produktrisikosteuerung' },
            { file: '5.2_Risikomanagement.md', title: '5.2 Risikomanagement' },
            { file: '5.3.1_Beim_Testen_verwendete_Metriken.md', title: '5.3.1 Beim Testen verwendete Metriken' },
            { file: '5.3.2_Zweck_Inhalt_und_Zielgruppen_für_Testberichte.md', title: '5.3.2 Zweck, Inhalt und Zielgruppen für Testberichte' },
            { file: '5.3.3_Kommunikation_des_Teststatus.md', title: '5.3.3 Kommunikation des Teststatus' },
            { file: '5.3_Testüberwachung_Teststeuerung_und_Testabschluss.md', title: '5.3 Testüberwachung, Teststeuerung und Testabschluss' },
            { file: '5.4_Konfigurationsmanagement.md', title: '5.4 Konfigurationsmanagement' },
            { file: '5.5_Fehlermanagement.md', title: '5.5 Fehlermanagement' },
        ],
        '6_Testwerkzeuge': [
            { file: '6.1_Werkzeugunterstützung_für_das_Testen.md', title: '6.1 Werkzeugunterstützung für das Testen' },
            { file: '6.2_Nutzen_und_Risiken_von_Testautomatisierung.md', title: '6.2 Nutzen und Risiken von Testautomatisierung' },
        ],
        '7_Literaturhinweise': [
            { file: '7.1_Normen_und_Standards.md', title: '7.1 Normen und Standards' },
            { file: '7.2_Fachliteratur.md', title: '7.2 Fachliteratur' },
            { file: '7.3_Artikel_und_Internetquellen.md', title: '7.3 Artikel und Internetquellen' },
            { file: '7.4_Deutschsprachige_Bücher_und_Artikel.md', title: '7.4 Deutschsprachige Bücher und Artikel' },
            { file: '7_Literaturhinweise.md', title: '7 Literaturhinweise' },
        ],
        '8_Anhang_A': [
            { file: '8_Anhang_A_Lernziele_kognitive_Stufen_des_Wissens.md', title: '8 Anhang A Lernziele/kognitive Stufen des Wissens' },
        ],
        '9_Anhang_B': [
            { file: '9_Anhang_B_Verfolgbarkeitsmatrix_Business_Outcomes.md', title: '9 Anhang B Verfolgbarkeitsmatrix Business Outcomes' },
        ],
        '10_Anhang_C': [
            { file: '10_Anhang_C_Release_Notes.md', title: '10 Anhang C Release Notes' },
        ],
        '11_Index': [
            { file: '11_Index.md', title: '11 Index' },
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

    // Theme map per chapter (unique background accents per unit)
    const chapterThemes: Record<string, { bg: string; gradient: string; border: string; accent: string }> = {
        '0_Einführung': { bg: '#F0F9FF', gradient: 'linear-gradient(135deg,#ECFEFF 0%,#DBEAFE 100%)', border: '#60A5FA', accent: '#2563EB' },
        '1_Grundlagen_des_Testens': { bg: '#FFF7ED', gradient: 'linear-gradient(135deg,#FFFBEB 0%,#FED7AA 100%)', border: '#FB923C', accent: '#EA580C' },
        '2_Testen_während_des_Softwareentwicklungslebenszyklus': { bg: '#F0FDF4', gradient: 'linear-gradient(135deg,#ECFCCB 0%,#BBF7D0 100%)', border: '#4ADE80', accent: '#16A34A' },
        '3_Statischer_Test': { bg: '#FAF5FF', gradient: 'linear-gradient(135deg,#FAE8FF 0%,#E9D5FF 100%)', border: '#C084FC', accent: '#7C3AED' },
        '4_Testanalyse_und_-entwurf': { bg: '#FFF1F2', gradient: 'linear-gradient(135deg,#FFE4E6 0%,#FECDD3 100%)', border: '#FB7185', accent: '#E11D48' },
        '5_Management_der_Testaktivitäten': { bg: '#F5F3FF', gradient: 'linear-gradient(135deg,#EDE9FE 0%,#DDD6FE 100%)', border: '#A78BFA', accent: '#6D28D9' },
        '6_Testwerkzeuge': { bg: '#ECFEFF', gradient: 'linear-gradient(135deg,#CFFAFE 0%,#BAE6FD 100%)', border: '#38BDF8', accent: '#0284C7' },
        '7_Literaturhinweise': { bg: '#FDF2F8', gradient: 'linear-gradient(135deg,#FCE7F3 0%,#FBCFE8 100%)', border: '#F472B6', accent: '#BE185D' },
        '8_Anhang_A': { bg: '#F1F5F9', gradient: 'linear-gradient(135deg,#F8FAFC 0%,#E2E8F0 100%)', border: '#94A3B8', accent: '#334155' },
        '9_Anhang_B': { bg: '#FEFCE8', gradient: 'linear-gradient(135deg,#FEF9C3 0%,#FDE68A 100%)', border: '#FACC15', accent: '#CA8A04' },
        '10_Anhang_C': { bg: '#ECFDF5', gradient: 'linear-gradient(135deg,#D1FAE5 0%,#A7F3D0 100%)', border: '#34D399', accent: '#059669' },
        '11_Index': { bg: '#EFF6FF', gradient: 'linear-gradient(135deg,#DBEAFE 0%,#BFDBFE 100%)', border: '#60A5FA', accent: '#1D4ED8' },
    };
    const currentChapter = chapter ? decodeURIComponent(chapter) : '';
    const theme = chapterThemes[currentChapter] || { bg: '#F8FAFC', gradient: 'linear-gradient(135deg,#F8FAFC 0%,#E5E7EB 100%)', border: '#CBD5E1', accent: '#0F172A' };

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
            <div className="min-h-screen text-foreground" style={{ background: theme.gradient }}>
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
                        <div className="bg-white/80 backdrop-blur rounded-lg border p-6 shadow-sm" style={{ borderColor: theme.border }}>
                            <div className="space-y-2">
                                {sections.map(({ file, title }) => {
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
            <div className="min-h-screen text-foreground" style={{ background: theme.gradient }}>
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
            // Blockquotes
            .replace(/^>\s?(.*)$/gim, `<blockquote class="border-l-4 pl-4 italic my-4 text-gray-700" style="border-color:${theme.border}">$1</blockquote>`)
            // Checkboxes
            .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center mb-2 ml-4 justify-start"><input type="checkbox" class="mr-2 text-amber-500" disabled> <span class="text-left">$1</span></div>')
            .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center mb-2 ml-4 justify-start"><input type="checkbox" class="mr-2 text-amber-500" checked disabled> <span class="line-through text-gray-500 text-left">$1</span></div>')
            // Lists
            .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-2 ml-4 text-left"><span class="font-medium text-amber-600">$1.</span> $2</li>')
            .replace(/^- (.*$)/gim, '<li class="mb-2 ml-4 list-disc text-left">$1</li>')
            // Bold / italic
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-800">$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700">$1</em>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-[0.9em] font-mono">$1</code>')
            // Fenced code blocks
            .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
            // Horizontal rule
            .replace(/^---$/gim, '<hr class="my-6 border-t" />')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-amber-600 hover:underline">$1</a>')
            // Paragraphs
            .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed text-left">')
            .replace(/\n/gim, '<br>');
    };

    // Sadece chapter varsa ve section yoksa, alt başlıkları listele
    if (chapter && !section) {
        const sections = allSectionIndex[chapter] || [];
        return (
            <div className="min-h-screen text-foreground" style={{ background: theme.gradient }}>
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
                            {sections.map(({ file, title }) => {
                                const sectionSlug = file.replace('.md', '');
                                return (
                                    <li key={file} className="py-4 flex items-center justify-between">
                                        <Link
                                            to={`/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(sectionSlug)}`}
                                            className="text-amber-700 hover:text-amber-800 hover:underline font-medium transition-colors"
                                        >
                                            {title}
                                        </Link>

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
                            <div className="flex items-center gap-3">
                                {/* Check for saved quiz state */}
                                {(() => {
                                    const savedState = localStorage.getItem('quizState');
                                    if (savedState) {
                                        try {
                                            const state = JSON.parse(savedState);
                                            const chapterInfo = state.chapterId ? (
                                                state.chapterId.startsWith('udemy_') ? 'Udemy' :
                                                    state.chapterId.startsWith('fragen_') ? 'Fragen' : 'ISTQB'
                                            ) : 'Quiz';

                                            return (
                                                <button
                                                    onClick={() => {
                                                        // Navigate back to the exact quiz URL with state restoration
                                                        const url = state.subChapterIndex ?
                                                            `/quiz/${state.chapterId}?sub=${state.subChapterIndex}` :
                                                            `/quiz/${state.chapterId}`;
                                                        navigate(url);
                                                    }}
                                                    className="flex items-center text-green-600 hover:text-green-700 transition-colors font-medium"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                                    Zum {chapterInfo} Quiz zurückkehren
                                                </button>
                                            );
                                        } catch (error) {
                                            // Invalid saved state, clean it up
                                            localStorage.removeItem('quizState');
                                            return null;
                                        }
                                    }
                                    return null;
                                })()}

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
        </div>
    );
};

export default DocumentationPage;
