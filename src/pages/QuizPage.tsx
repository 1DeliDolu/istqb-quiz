import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { istqbChapters } from '@/constants/istqbChapters';
import { udemyChapters } from '@/constants/udemyChapters';
import { fragenChapters } from '@/constants/fragenChapters';
import { DataService, type Question } from '@/services/dataService';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";


const QuizPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const [searchParams] = useSearchParams();
    const subChapterIndex = searchParams.get('sub');
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});

    // Function to restore quiz state from database
    const restoreQuizState = async (): Promise<boolean> => {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser || !chapterId) return false;

            console.log('🔄 Attempting to restore quiz state from database...');

            // Calculate subChapter ID for database lookup
            let subChapterIdForDb = null;
            if (subChapterTitle && chapterId.startsWith('udemy_')) {
                const subChapterMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                if (subChapterMatch) {
                    subChapterIdForDb = `udemy_${subChapterMatch[1]}_quiz_${subChapterMatch[2]}`;
                }
            } else if (subChapterTitle && chapterId.startsWith('fragen_')) {
                if (subChapterTitle.startsWith('Genel.')) {
                    const match = subChapterTitle.match(/^Genel\.(\d+)/);
                    if (match) subChapterIdForDb = `fragen_genel_${match[1]}`;
                } else if (subChapterTitle.startsWith('Deutsch.')) {
                    const match = subChapterTitle.match(/^Deutsch\.(\d+)/);
                    if (match) subChapterIdForDb = `fragen_deutsch_${match[1]}`;
                } else if (subChapterTitle.startsWith('Praxis.')) {
                    const match = subChapterTitle.match(/^Praxis\.(\d+)/);
                    if (match) subChapterIdForDb = `fragen_praxis_${match[1]}`;
                } else if (subChapterTitle.startsWith('Mixed.')) {
                    const match = subChapterTitle.match(/^Mixed\.(\d+)/);
                    if (match) subChapterIdForDb = `fragen_mixed_${match[1]}`;
                }
            } else if (subChapterTitle && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                const istqbMatch = subChapterTitle.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
                if (istqbMatch) {
                    subChapterIdForDb = `${istqbMatch[1]}-${istqbMatch[2]}${istqbMatch[3] ? `-${istqbMatch[3]}` : ''}`;
                }
            }

            // Determine quiz type
            let quizType = 'istqb';
            if (chapterId.startsWith('udemy_')) {
                quizType = 'udemy';
            } else if (chapterId.startsWith('fragen_')) {
                quizType = 'fragen';
            }

            const savedProgress = await DataService.loadQuizProgress(
                currentUser.id,
                quizType,
                chapterId,
                subChapterIdForDb
            );

            if (savedProgress) {
                // Check if quiz is completed
                if (savedProgress.completedAt || savedProgress.currentQuestionIndex >= savedProgress.totalQuestions - 1) {
                    console.log('🏁 Quiz already completed, starting fresh');
                    return false;
                }

                console.log('📂 Restoring quiz progress from database:', savedProgress);

                // Restore all state
                setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
                setScore(savedProgress.score);
                setAnsweredQuestions(new Set(Object.keys(savedProgress.answers).map(Number)));
                setUserAnswers(savedProgress.answers);

                // Since questions are now loaded, check if the current question is answered
                if (questions.length > savedProgress.currentQuestionIndex) {
                    const currentQuestion = questions[savedProgress.currentQuestionIndex];
                    if (currentQuestion && savedProgress.answers && savedProgress.answers[currentQuestion.id]) {
                        setSelectedAnswer(savedProgress.answers[currentQuestion.id]);
                        setIsAnswered(true);
                    } else {
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                    }
                }

                console.log('✅ Quiz state restored from database successfully');
                return true;
            }
        } catch (error) {
            console.error('❌ Error restoring quiz state from database:', error);
        }
        return false;
    };

    // Debug logging to track state changes and potential issues
    useEffect(() => {
        console.log('QuizPage Debug:', {
            questionsLength: questions.length,
            currentQuestionIndex,
            isCurrentQuestionValid: !!questions[currentQuestionIndex],
            chapterId,
            subChapterIndex
        });
    }, [questions, currentQuestionIndex, chapterId, subChapterIndex]);

    // Benutzerinformationen abrufen
    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    // Wähle das richtige Kapitelobjekt je nach Kapiteltyp aus
    const getChapterInfo = (chapterId: string) => {
        if (chapterId?.startsWith('udemy_')) {
            return udemyChapters[chapterId as keyof typeof udemyChapters];
        } else if (chapterId?.startsWith('fragen_')) {
            return fragenChapters[chapterId as keyof typeof fragenChapters];
        } else {
            return istqbChapters[chapterId as keyof typeof istqbChapters];
        }
    };

    const chapterInfo = chapterId ? getChapterInfo(chapterId) : null;
    const subChapterTitle = chapterInfo && subChapterIndex ?
        chapterInfo.subChapters[parseInt(subChapterIndex)] : null;

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!chapterId) return;

            console.log(`🔍 QuizPage Debug - Kapitel: ${chapterId}, SubIndex: ${subChapterIndex}, SubTitle: ${subChapterTitle}`);

            try {
                // Importiere zuerst die vorhandenen Daten aus der JSON-Datei (für ISTQB)
                if (!chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    await DataService.importJsonData(chapterId);
                }

                // Fragen vom DataService abrufen (vom Backend oder localStorage)
                // SubKapitel-Filter hinzufügen
                console.log(`🔍 DataService.getQuestions Aufruf: kapitel="${chapterId}", subKapitel="${subChapterTitle}"`);
                let allQuestions = await DataService.getQuestions(chapterId, subChapterTitle || undefined);
                console.log(`📊 Anzahl der Fragen vom DataService: ${allQuestions.length}`);
                console.log(`📋 Erste 2 Fragen:`, allQuestions.slice(0, 2));
                // Struktur der Fragen vom Backend prüfen
                if (allQuestions.length > 0) {
                    console.log(`🔍 Struktur der ersten Frage:`, {
                        subChapter: allQuestions[0].subChapter,
                        keys: Object.keys(allQuestions[0])
                    });
                }

                // Wenn keine Fragen vorhanden sind und es sich um ein ISTQB-Kapitel handelt, versuche, aus der JSON-Datei zu laden
                if (allQuestions.length === 0 && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    try {
                        const data = await import(`../data/istqb/${chapterId}.json`);
                        allQuestions = data.default || [];
                    } catch (error) {
                        console.log(`Keine JSON-Datei für Kapitel ${chapterId} gefunden`);
                    }
                }

                // Das Backend filtert bereits korrekt, lokale Filterung überspringen
                // Nur für localStorage oder JSON-Dateien filtern
                const isFromBackend = allQuestions.length > 0 && allQuestions[0].id && typeof allQuestions[0].id === 'number';

                if (subChapterTitle && allQuestions.length > 0 && !isFromBackend) {
                    console.log(`🔍 Lokale Filterung: Suche nach SubKapitel "${subChapterTitle}" in ${allQuestions.length} Fragen`);
                    console.log(`🔍 Filterkriterium: subChapter === "${subChapterTitle}"`);
                    const beforeFilter = allQuestions.length;
                    allQuestions = allQuestions.filter((q: Question) => {
                        console.log(`🔍 Frage subChapter: "${q.subChapter}", gesucht: "${subChapterTitle}", gleich: ${q.subChapter === subChapterTitle}`);
                        return q.subChapter === subChapterTitle;
                    });
                    console.log(`📊 Nach Filterung: ${beforeFilter} → ${allQuestions.length} Fragen übrig`);
                } else if (isFromBackend) {
                    console.log(`✅ Daten vom Backend, Filterung übersprungen`);
                }

                console.log(`📝 setQuestions wird aufgerufen: ${allQuestions.length} Fragen`);
                setQuestions(allQuestions);
                console.log(`📚 ${allQuestions.length} Fragen für Kapitel ${chapterId}${subChapterTitle ? ` (${subChapterTitle})` : ''} geladen`);
            } catch (error) {
                console.error("Quizdaten konnten nicht geladen werden:", error);
                setQuestions([]);
            }
        };

        fetchQuestions();

        // Quiz state'i reset et (veritabanı restore edeceği için)
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
        setAnsweredQuestions(new Set());
        setUserAnswers({});
    }, [chapterId, subChapterIndex, subChapterTitle]);

    // Questions yüklendikten sonra quiz progress'i restore et
    useEffect(() => {
        const restoreProgressAfterQuestionsLoad = async () => {
            if (questions.length > 0 && chapterId) {
                console.log('🔄 Questions loaded, attempting to restore quiz progress...');
                const isRestored = await restoreQuizState();
                if (isRestored) {
                    console.log('✅ Quiz progress restored successfully');
                } else {
                    console.log('🆕 No saved progress found, starting new quiz');
                }
            }
        };

        restoreProgressAfterQuestionsLoad();
    }, [questions, chapterId]);

    const handleAnswerSelect = async (option: string) => {
        if (isAnswered) return;

        // Safety check: ensure currentQuestion exists
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) {
            console.error('Current question is undefined', { currentQuestionIndex, questionsLength: questions.length });
            return;
        }

        setSelectedAnswer(option);
        setIsAnswered(true);

        // Update userAnswers state
        const newUserAnswers = { ...userAnswers, [currentQuestion.id]: option };
        setUserAnswers(newUserAnswers);

        // Markiere diese Frage als beantwortet
        setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));

        const isCorrect = option === currentQuestion.correctAnswer;
        const newScore = isCorrect ? score + 1 : score;
        if (isCorrect) {
            setScore(newScore);
        }

        // Antwort des Benutzers speichern
        const currentUser = getCurrentUser();
        if (currentUser && chapterId) {
            try {
                // SubKapitel-ID berechnen
                let subChapterId = null;
                if (subChapterTitle && chapterId.startsWith('udemy_')) {
                    // Für Udemy: sub-chapter ID Format: udemy_2_1, udemy_2_2 usw.
                    // subChapterTitle Format: "2.1 Quiz 1 - Grundlagen"
                    const subChapterMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                    if (subChapterMatch) {
                        subChapterId = `udemy_${subChapterMatch[1]}_quiz_${subChapterMatch[2]}`;
                    }
                } else if (subChapterTitle && chapterId.startsWith('fragen_')) {
                    // Für Fragen: sub-chapter ID berechnen
                    // subChapterTitle Format: "Genel.1 Temel Kavramlar"
                    if (subChapterTitle.startsWith('Genel.')) {
                        const match = subChapterTitle.match(/^Genel\.(\d+)/);
                        if (match) subChapterId = `fragen_genel_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Deutsch.')) {
                        const match = subChapterTitle.match(/^Deutsch\.(\d+)/);
                        if (match) subChapterId = `fragen_deutsch_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Praxis.')) {
                        const match = subChapterTitle.match(/^Praxis\.(\d+)/);
                        if (match) subChapterId = `fragen_praxis_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Mixed.')) {
                        const match = subChapterTitle.match(/^Mixed\.(\d+)/);
                        if (match) subChapterId = `fragen_mixed_${match[1]}`;
                    }
                } else if (subChapterTitle && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    // Für ISTQB: sub-chapter ID berechnen (3-level destek)
                    const istqbMatch = subChapterTitle.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
                    if (istqbMatch) {
                        subChapterId = `${istqbMatch[1]}-${istqbMatch[2]}${istqbMatch[3] ? `-${istqbMatch[3]}` : ''}`;
                    }
                }

                // Record user answer
                await DataService.recordUserAnswer(
                    currentUser.id,
                    currentQuestion.id,
                    chapterId,
                    subChapterId,
                    option,
                    isCorrect
                );

                // Save quiz progress to database
                const quizType = chapterId.startsWith('udemy_') ? 'udemy'
                    : chapterId.startsWith('fragen_') ? 'fragen'
                        : 'istqb';

                await DataService.saveQuizProgress(
                    currentUser.id,
                    quizType,
                    chapterId,
                    subChapterId,
                    currentQuestionIndex,
                    questions.length,
                    newScore,
                    newUserAnswers
                );

                console.log(`💾 Quiz progress saved: Question ${currentQuestionIndex + 1}/${questions.length}, Score: ${newScore}`);
            } catch (error) {
                console.error('Error saving answer or progress:', error);
            }
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setIsAnswered(false);
            setSelectedAnswer(null);
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizCompleted(true);

            // Mark quiz as completed in database
            const currentUser = getCurrentUser();
            if (currentUser && chapterId) {
                try {
                    // Calculate subChapter ID for database
                    let subChapterId = null;
                    if (subChapterTitle && chapterId.startsWith('udemy_')) {
                        const subChapterMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                        if (subChapterMatch) {
                            subChapterId = `udemy_${subChapterMatch[1]}_quiz_${subChapterMatch[2]}`;
                        }
                    } else if (subChapterTitle && chapterId.startsWith('fragen_')) {
                        if (subChapterTitle.startsWith('Genel.')) {
                            const match = subChapterTitle.match(/^Genel\.(\d+)/);
                            if (match) subChapterId = `fragen_genel_${match[1]}`;
                        } else if (subChapterTitle.startsWith('Deutsch.')) {
                            const match = subChapterTitle.match(/^Deutsch\.(\d+)/);
                            if (match) subChapterId = `fragen_deutsch_${match[1]}`;
                        } else if (subChapterTitle.startsWith('Praxis.')) {
                            const match = subChapterTitle.match(/^Praxis\.(\d+)/);
                            if (match) subChapterId = `fragen_praxis_${match[1]}`;
                        } else if (subChapterTitle.startsWith('Mixed.')) {
                            const match = subChapterTitle.match(/^Mixed\.(\d+)/);
                            if (match) subChapterId = `fragen_mixed_${match[1]}`;
                        }
                    } else if (subChapterTitle && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                        const istqbMatch = subChapterTitle.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
                        if (istqbMatch) {
                            subChapterId = `${istqbMatch[1]}-${istqbMatch[2]}${istqbMatch[3] ? `-${istqbMatch[3]}` : ''}`;
                        }
                    }

                    const quizType = chapterId.startsWith('udemy_') ? 'udemy'
                        : chapterId.startsWith('fragen_') ? 'fragen'
                            : 'istqb';

                    await DataService.markQuizCompleted(
                        currentUser.id,
                        quizType,
                        chapterId,
                        subChapterId,
                        score
                    );

                    console.log(`✅ Quiz completed and marked in database: ${score}/${questions.length}`);
                } catch (error) {
                    console.error('Error marking quiz as completed:', error);
                }
            }
        }
    };

    const handleQuestionNavigation = (questionIndex: number) => {
        if (questionIndex < 0 || questionIndex >= questions.length) {
            return;
        }

        setCurrentQuestionIndex(questionIndex);

        // Wenn diese Frage bereits beantwortet wurde, zeige die gespeicherte Antwort an
        if (answeredQuestions.has(questionIndex)) {
            setIsAnswered(true);
            // Find saved answer for this question from userAnswers state
            const currentQuestion = questions[questionIndex];
            if (currentQuestion && userAnswers[currentQuestion.id]) {
                setSelectedAnswer(userAnswers[currentQuestion.id]);
            } else {
                setSelectedAnswer(null);
            }
        } else {
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    const resetQuiz = async () => {
        // Clear progress from database
        const currentUser = getCurrentUser();
        if (currentUser && chapterId) {
            try {
                // Calculate subChapter ID for database
                let subChapterId = null;
                if (subChapterTitle && chapterId.startsWith('udemy_')) {
                    const subChapterMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                    if (subChapterMatch) {
                        subChapterId = `udemy_${subChapterMatch[1]}_quiz_${subChapterMatch[2]}`;
                    }
                } else if (subChapterTitle && chapterId.startsWith('fragen_')) {
                    if (subChapterTitle.startsWith('Genel.')) {
                        const match = subChapterTitle.match(/^Genel\.(\d+)/);
                        if (match) subChapterId = `fragen_genel_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Deutsch.')) {
                        const match = subChapterTitle.match(/^Deutsch\.(\d+)/);
                        if (match) subChapterId = `fragen_deutsch_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Praxis.')) {
                        const match = subChapterTitle.match(/^Praxis\.(\d+)/);
                        if (match) subChapterId = `fragen_praxis_${match[1]}`;
                    } else if (subChapterTitle.startsWith('Mixed.')) {
                        const match = subChapterTitle.match(/^Mixed\.(\d+)/);
                        if (match) subChapterId = `fragen_mixed_${match[1]}`;
                    }
                } else if (subChapterTitle && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    const istqbMatch = subChapterTitle.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
                    if (istqbMatch) {
                        subChapterId = `${istqbMatch[1]}-${istqbMatch[2]}${istqbMatch[3] ? `-${istqbMatch[3]}` : ''}`;
                    }
                }

                const quizType = chapterId.startsWith('udemy_') ? 'udemy'
                    : chapterId.startsWith('fragen_') ? 'fragen'
                        : 'istqb';

                await DataService.clearQuizProgress(
                    currentUser.id,
                    quizType,
                    chapterId,
                    subChapterId
                );

                console.log('🗑️ Quiz progress cleared from database');
            } catch (error) {
                console.error('Error clearing quiz progress:', error);
            }
        }

        // Reset local state
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
        setAnsweredQuestions(new Set());
        setUserAnswers({});
    };

    // Function to extract markdown filename or section and open documentation in same tab
    const handleDocumentationClick = (explanation: string) => {
        console.log(`🔍 Full explanation received:`, explanation);

        // Note: Quiz progress is automatically saved to database with each answer
        // No need to save to localStorage since we have persistent database storage

        // 1) Prefer extracting the real markdown filename in parentheses, e.g. (2.1.3_Testen_als_Treiber_für_die_Softwareentwicklung.md)
        const fileNameMatch = explanation.match(/\(([^)]+\.md)\)/);
        if (fileNameMatch) {
            const fileName = fileNameMatch[1];
            console.log(`📄 Extracted markdown file name: ${fileName}`);

            // Derive chapter folder from the leading number in filename (e.g., 2 from 2.1.3_... or 2_Testen_...)
            const chapterNumberMatch = fileName.match(/^(\d+)/);
            if (chapterNumberMatch) {
                const chapterNumber = chapterNumberMatch[1]; // e.g., '2'
                const chapterMap: { [key: string]: string } = {
                    '0.': '0_Einführung',
                    '1.': '1_Grundlagen_des_Testens',
                    '2.': '2_Testen_während_des_Softwareentwicklungslebenszyklus',
                    '3.': '3_Statischer_Test',
                    '4.': '4_Testanalyse_und_-entwurf',
                    '5.': '5_Management_der_Testaktivitäten',
                    '6.': '6_Testwerkzeuge',
                    '7.': '7_Literaturhinweise',
                    '8.': '8_Anhang_A',
                    '9.': '9_Anhang_B',
                    '10.': '10_Anhang_C',
                    '11.': '11_Index'
                };

                const chapterKey = `${chapterNumber}.`;
                const chapterFolder = chapterMap[chapterKey];

                if (chapterFolder) {
                    const sectionSlug = fileName.replace('.md', '');

                    // Save quiz state so DocumentationPage can show "Back to quiz" when coming from quiz
                    if (chapterId) {
                        localStorage.setItem('quizState', JSON.stringify({
                            chapterId,
                            subChapterIndex: subChapterIndex ?? null,
                        }));
                    }

                    // Navigate in the same tab
                    navigate(`/documentation/${encodeURIComponent(chapterFolder)}/${encodeURIComponent(sectionSlug)}`, {
                        state: { fromQuiz: true }
                    });
                    return;
                }
            }
            // If we could not derive chapter folder, fall through to section-based logic below
        }

        // 2) Fallback: Extract ISTQB section reference (e.g., 2.2.3) and map to known files
        // Try multiple regex patterns to find the section number
        let sectionMatch = null;

        // Pattern 1: Look for section after comma and space (most common)
        sectionMatch = explanation.match(/,\s+(\d+\.\d+(?:\.\d+)?)\s/);

        // Pattern 2: Look for section in the format "X.X.X Something"
        if (!sectionMatch) {
            sectionMatch = explanation.match(/(\d+\.\d+\.\d+)\s+[A-ZÄÖÜ]/);
        }

        // Pattern 3: Look for any standalone section number pattern
        if (!sectionMatch) {
            sectionMatch = explanation.match(/(\d+\.\d+(?:\.\d+)?)/);
        }

        console.log(`🔍 Section match result:`, sectionMatch);

        if (sectionMatch) {
            const sectionNumber = sectionMatch[1]; // e.g., "2.2.3"
            console.log(`🔍 Extracted section number: ${sectionNumber}`);

            // Map section number to chapter folder
            const chapterMap: { [key: string]: string } = {
                '0.': '0_Einführung',
                '1.': '1_Grundlagen_des_Testens',
                '2.': '2_Testen_während_des_Softwareentwicklungslebenszyklus',
                '3.': '3_Statischer_Test',
                '4.': '4_Testanalyse_und_-entwurf',
                '5.': '5_Management_der_Testaktivitäten',
                '6.': '6_Testwerkzeuge',
                '7.': '7_Literaturhinweise',
                '8.': '8_Anhang_A',
                '9.': '9_Anhang_B',
                '10.': '10_Anhang_C',
                '11.': '11_Index'
            };

            // Map specific section numbers to their actual markdown file names
            const sectionFileMap: { [key: string]: string } = {
                // Chapter 1 - Grundlagen des Testens
                '1.1': '1.1_Was_ist_Testen',
                '1.1.1': '1.1.1_Testziele',
                '1.1.2': '1.1.2_Testen_und_Debugging',
                '1.2': '1.2_Warum_ist_Testen_notwendig',
                '1.2.1': '1.2.1_Der_Beitrag_des_Testens_zum_Erfolg',
                '1.2.2': '1.2.2_Testen_und_Qualitätssicherung',
                '1.2.3': '1.2.3_Fehlhandlungen_Fehlerzustände_Fehlerwirkungen_und_Grundursachen',
                '1.3': '1.3_Grundsätze_des_Testens',
                '1.4': '1.4_Testaktivitäten_Testmittel_und_Rollen_des_Testens',
                '1.4.1': '1.4.1_Testaktivitäten_und_-aufgaben',
                '1.4.2': '1.4.2_Testprozess_im_Kontext',
                '1.4.3': '1.4.3_Testmittel',
                '1.4.4': '1.4.4_Verfolgbarkeit_zwischen_der_Testbasis_und_den_Testmitteln',
                '1.4.5': '1.4.5_Rollen_des_Testens',
                '1.5': '1.5_Wesentliche_Kompetenzen_und_bewährte_Praktiken_beim_Testen',
                '1.5.2': '1.5.2_Whole-Team-Ansatz',
                '1.5.3': '1.5.3_Unabhängigkeit_des_Testens',

                // Chapter 2 - Testen während des Softwareentwicklungslebenszyklus
                '2.1': '2.1_Testen_im_Kontext_eines_SDLC',
                '2.1.1': '2.1.1_Auswirkungen_des_SDLC_auf_das_Testen',
                '2.1.2': '2.1.2_SDLC_und_gute_Praktiken_für_das_Testen',
                '2.1.3': '2.1.3_Testen_als_Treiber_für_die_Softwareentwicklung',
                '2.1.4': '2.1.4_DevOps_und_Testen',
                '2.1.5': '2.1.5_Shift-Left',
                '2.1.6': '2.1.6_Retrospektiven_und_Prozessverbesserung',
                '2.2': '2.2_Teststufen_und_Testarten',
                '2.2.1': '2.2.1_Teststufen',
                '2.2.2': '2.2.2_Testarten',
                '2.2.3': '2.2.3_Fehlernachtest_und_Regressionstest',
                '2.3': '2.3_Wartungstest',

                // Add more sections as needed when other chapters are created
            };

            const chapterPrefix = sectionNumber.substring(0, 2);
            const chapter = chapterMap[chapterPrefix];
            const sectionFile = sectionFileMap[sectionNumber];

            console.log(`📖 Debug info:`);
            console.log(`📖 Section number: ${sectionNumber}`);
            console.log(`📖 Chapter prefix: ${chapterPrefix}`);
            console.log(`📖 Chapter: ${chapter}`);
            console.log(`📖 Section file: ${sectionFile}`);

            if (chapter && sectionFile) {
                // Save quiz state for back navigation
                if (chapterId) {
                    localStorage.setItem('quizState', JSON.stringify({
                        chapterId,
                        subChapterIndex: subChapterIndex ?? null,
                    }));
                }

                // Open documentation in the same tab
                navigate(`/documentation/${encodeURIComponent(chapter)}/${encodeURIComponent(sectionFile)}`, {
                    state: { fromQuiz: true }
                });
            } else {
                console.warn('Could not map section to documentation file:', {
                    sectionNumber,
                    chapterPrefix,
                    chapter,
                    sectionFile,
                    availableChapters: Object.keys(chapterMap),
                    availableSections: Object.keys(sectionFileMap)
                });
                // Fallback: Go to documentation index in the same tab
                navigate('/docs');
            }
        } else {
            console.warn('Could not extract section reference from explanation:', explanation);
            // Fallback: Go to documentation index in the same tab
            navigate('/docs');
        }
    }; if (questions.length === 0) {
        return (
            <div className="container mx-auto p-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {chapterInfo?.title || `Kapitel ${chapterId}`}
                    </h1>
                    {subChapterTitle && (
                        <h2 className="text-xl text-gray-600 mb-6">{subChapterTitle}</h2>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <p className="text-lg">Für dieses Kapitel wurden noch keine Fragen hinzugefügt.</p>
                        <p className="mt-2 text-gray-600">
                            Sie können neue Fragen über das cms-Menü hinzufügen.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);

        const getNextQuizSuggestion = () => {
            if (!chapterId) return null;

            const currentChapter = getChapterInfo(chapterId);
            // First prefer next sub-chapter in the same chapter
            if (currentChapter && subChapterIndex !== null) {
                const currentIndex = parseInt(subChapterIndex);
                if (currentChapter.subChapters && currentIndex + 1 < currentChapter.subChapters.length) {
                    return {
                        url: `/quiz/${chapterId}?sub=${currentIndex + 1}`,
                        label: currentChapter.subChapters[currentIndex + 1],
                        context: currentChapter.title
                    };
                }
            }

            // Otherwise, suggest the first sub-chapter of the next chapter (if any)
            const chaptersMap = chapterId.startsWith('udemy_') ? udemyChapters
                : chapterId.startsWith('fragen_') ? fragenChapters
                    : istqbChapters;
            const keys = Object.keys(chaptersMap);
            const idx = keys.indexOf(chapterId);
            if (idx !== -1 && idx + 1 < keys.length) {
                const nextKey = keys[idx + 1] as keyof typeof chaptersMap;
                const nextChapter: any = (chaptersMap as any)[nextKey];
                if (nextChapter?.subChapters?.length) {
                    return {
                        url: `/quiz/${nextKey}?sub=0`,
                        label: nextChapter.subChapters[0],
                        context: nextChapter.title
                    };
                }
                return {
                    url: `/quiz/${nextKey}`,
                    label: nextChapter?.title || 'Nächstes Kapitel',
                    context: nextChapter?.title || ''
                };
            }
            return null;
        };

        const nextSuggestion = getNextQuizSuggestion();

        return (
            <div className="container mx-auto p-8 max-w-3xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Quiz abgeschlossen!</h1>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Ihr Ergebnis</h2>
                        <p className="text-lg">
                            {score} / {questions.length} ({percentage}%)
                        </p>
                        <div className="mt-4">
                            {percentage >= 80 && (
                                <p className="text-green-600 font-semibold">Ausgezeichnet! 🎉</p>
                            )}
                            {percentage >= 60 && percentage < 80 && (
                                <p className="text-yellow-600 font-semibold">Gut gemacht! 👍</p>
                            )}
                            {percentage < 60 && (
                                <p className="text-red-600 font-semibold">Sie sollten mehr üben 📚</p>
                            )}
                        </div>
                    </div>

                    {/* Primary action: retry */}
                    <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors mb-6"
                    >
                        Erneut versuchen
                    </button>

                    {/* Secondary: suggest next quiz */}
                    {nextSuggestion && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center mx-auto max-w-xl">
                            <div className="text-black font-semibold mb-1">Empfohlen: Nächstes Quiz</div>
                            {nextSuggestion.context && (
                                <div className="text-sm text-black">{nextSuggestion.context}</div>
                            )}
                            <div className="text-sm text-black font-medium mt-1 mb-3">{nextSuggestion.label}</div>
                            <button
                                onClick={() => navigate(nextSuggestion.url)}
                                className="px-5 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                Nächstes Quiz starten
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Add safety check for currentQuestion
    if (!currentQuestion) {
        return (
            <div className="container mx-auto p-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Fehler</h1>
                    <p className="text-gray-600 mb-4">Frage konnte nicht geladen werden.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors"
                    >
                        Seite neu laden
                    </button>
                </div>
            </div>
        );
    }

    const getOptionClass = (option: string) => {
        if (!isAnswered) {
            return "border-gray-300 hover:border-amber-500 hover:bg-amber-50 cursor-pointer";
        }
        if (option === currentQuestion.correctAnswer) {
            return "border-green-500 bg-green-100 text-green-800";
        }
        if (option === selectedAnswer) {
            return "border-red-500 bg-red-100 text-red-800";
        }
        return "border-gray-300 opacity-60";
    };

    // Moderne Paginierungslogik mit Auslassungspunkten
    const getPaginationItems = () => {
        const totalPages = questions.length;
        const currentPage = currentQuestionIndex + 1;
        const delta = 2; // Anzahl der Seiten links und rechts von der aktuellen Seite

        const items = [];

        // Immer die erste Seite anzeigen
        if (totalPages > 0) {
            items.push(1);
        }

        // Start und Ende des sichtbaren Bereichs berechnen
        let start = Math.max(2, currentPage - delta);
        let end = Math.min(totalPages - 1, currentPage + delta);

        // Auslassungspunkte nach der ersten Seite, falls nötig
        if (start > 2) {
            items.push('ellipsis-start');
        }

        // Seiten im sichtbaren Bereich hinzufügen
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) {
                items.push(i);
            }
        }

        // Auslassungspunkte vor der letzten Seite, falls nötig
        if (end < totalPages - 1) {
            items.push('ellipsis-end');
        }

        // Immer die letzte Seite anzeigen (falls unterschiedlich von der ersten)
        if (totalPages > 1) {
            items.push(totalPages);
        }

        return items;
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            {/* Kopfzeile */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    {chapterInfo?.title || `Kapitel ${chapterId}`}
                </h1>
                {subChapterTitle && (
                    <h2 className="text-lg text-gray-600 mb-2">{subChapterTitle}</h2>
                )}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Frage {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="text-sm text-gray-500">
                        Richtig: {score} | Falsch: {currentQuestionIndex + 1 - score - (isAnswered ? 0 : 1)}
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Frage */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-6 text-left">{currentQuestion.question}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={`${currentQuestion.id}-${index}`}
                            onClick={() => handleAnswerSelect(option)}
                            className={`p-4 border rounded-lg transition-all text-left ${getOptionClass(option)}`}
                        >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}:</span>
                            {option}
                        </div>
                    ))}
                </div>
            </div>

            {/* Erklärung */}
            {isAnswered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                    <h4 className="font-bold text-blue-800 mb-2 text-left">
                        {selectedAnswer === currentQuestion.correctAnswer ? '✅ Richtig!' : '❌ Falsch!'}
                    </h4>
                    <p className="text-blue-700 text-left"><strong>Erklärung:</strong> {currentQuestion.explanation}</p>
                    {/* Documentation Link */}
                    {currentQuestion.explanation && (
                        <div className="mt-4 pt-3 border-t border-blue-200">
                            <button
                                onClick={() => handleDocumentationClick(currentQuestion.explanation)}
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                📖 Mehr in der ISTQB Dokumentation lesen
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation mit Paginierung */}
            <div className="flex flex-col items-center space-y-4">
                {/* Paginierungsnavigation */}
                <Pagination className="justify-center">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                                className={`cursor-pointer ${currentQuestionIndex === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="hidden sm:block">Zurück</span>
                            </PaginationPrevious>
                        </PaginationItem>

                        {/* Intelligente Fragenummern mit Auslassungspunkten */}
                        {getPaginationItems().map((item, index) => (
                            <PaginationItem key={index}>
                                {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        onClick={() => handleQuestionNavigation((item as number) - 1)}
                                        isActive={(item as number) === currentQuestionIndex + 1}
                                        className={`cursor-pointer ${answeredQuestions.has((item as number) - 1)
                                            ? 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'
                                            : ''
                                            }`}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                                className={`cursor-pointer ${currentQuestionIndex === questions.length - 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="hidden sm:block">Weiter</span>
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>

                {/* Weiter-Button */}
                {isAnswered && (
                    <div className="text-center">
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors text-lg font-medium"
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Ergebnisse anzeigen'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
