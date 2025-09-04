import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
} from "@/components/ui/pagination";

const QuizPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const [searchParams] = useSearchParams();
    const subChapterIndex = searchParams.get('sub');

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

    // Kullanıcı bilgisini al
    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    // Chapter türüne göre doğru chapters objesini seç
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

            console.log(`🔍 QuizPage Debug - Chapter: ${chapterId}, SubIndex: ${subChapterIndex}, SubTitle: ${subChapterTitle}`);

            try {
                // İlk önce JSON dosyasındaki mevcut verileri import et (ISTQB için)
                if (!chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    await DataService.importJsonData(chapterId);
                }

                // DataService'den soruları al (backend'den veya localStorage'dan)
                // SubChapter filtresi ekle
                console.log(`🔍 DataService.getQuestions çağrısı: chapter="${chapterId}", subChapter="${subChapterTitle}"`);
                let allQuestions = await DataService.getQuestions(chapterId, subChapterTitle || undefined);
                console.log(`📊 DataService'den dönen soru sayısı: ${allQuestions.length}`);
                console.log(`📋 İlk 2 soru:`, allQuestions.slice(0, 2));
                // Backend'den gelen soruların yapısını kontrol et
                if (allQuestions.length > 0) {
                    console.log(`🔍 İlk sorunun yapısı:`, {
                        subChapter: allQuestions[0].subChapter,
                        keys: Object.keys(allQuestions[0])
                    });
                }

                // Eğer hiç soru yoksa ve ISTQB bölümüyse, JSON dosyasından yüklemeyi dene
                if (allQuestions.length === 0 && !chapterId.startsWith('udemy_') && !chapterId.startsWith('fragen_')) {
                    try {
                        const data = await import(`../data/istqb/${chapterId}.json`);
                        allQuestions = data.default || [];
                    } catch (error) {
                        console.log(`No JSON file found for chapter ${chapterId}`);
                    }
                }

                // Backend zaten doğru filtrelemeyi yapıyor, local filtrelemeyi atla
                // Sadece localStorage veya JSON dosyasından gelenleri filtrele
                const isFromBackend = allQuestions.length > 0 && allQuestions[0].id && typeof allQuestions[0].id === 'number';

                if (subChapterTitle && allQuestions.length > 0 && !isFromBackend) {
                    console.log(`🔍 Local filtreleme: ${allQuestions.length} soru içinden "${subChapterTitle}" alt bölümü aranıyor`);
                    console.log(`🔍 Filtreleme kriteri: subChapter === "${subChapterTitle}"`);
                    const beforeFilter = allQuestions.length;
                    allQuestions = allQuestions.filter((q: Question) => {
                        console.log(`🔍 Soru subChapter: "${q.subChapter}", aranan: "${subChapterTitle}", eşit mi: ${q.subChapter === subChapterTitle}`);
                        return q.subChapter === subChapterTitle;
                    });
                    console.log(`📊 Filtreleme sonrası: ${beforeFilter} → ${allQuestions.length} soru kaldı`);
                } else if (isFromBackend) {
                    console.log(`✅ Backend'den veri geldi, filtreleme atlanıyor`);
                }

                console.log(`📝 setQuestions çağrılıyor: ${allQuestions.length} soru`);
                setQuestions(allQuestions);
                console.log(`📚 Loaded ${allQuestions.length} questions for chapter ${chapterId}${subChapterTitle ? ` (${subChapterTitle})` : ''}`);
            } catch (error) {
                console.error("Quiz verisi yüklenemedi:", error);
                setQuestions([]);
            }
        }; fetchQuestions();
        // Her yeni bölüme geçildiğinde durumu sıfırla
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
        setAnsweredQuestions(new Set());
    }, [chapterId, subChapterIndex, subChapterTitle]);

    const handleAnswerSelect = async (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        // Mark this question as answered
        setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));

        const isCorrect = option === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Kullanıcının cevabını kaydet
        const currentUser = getCurrentUser();
        if (currentUser && chapterId) {
            try {
                // Sub-chapter ID'sini hesapla
                let subChapterId = null;
                if (subChapterTitle && chapterId.startsWith('udemy_')) {
                    // Udemy için sub-chapter ID formatı: udemy_2_1, udemy_2_2 vs
                    // subChapterTitle format: "2.1 Quiz 1 - Grundlagen"
                    const subChapterMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                    if (subChapterMatch) {
                        subChapterId = `udemy_${subChapterMatch[1]}_${subChapterMatch[2]}`;
                    }
                } else if (subChapterTitle && chapterId.startsWith('fragen_')) {
                    // Fragen için sub-chapter ID formatı hesapla
                    // subChapterTitle format: "Genel.1 Temel Kavramlar"
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
                    // ISTQB için sub-chapter ID formatı hesapla
                    // subChapterTitle format: "1.1 Test Nedir ve Neden Gereklidir?"
                    const istqbMatch = subChapterTitle.match(/^(\d+)\.(\d+)/);
                    if (istqbMatch) {
                        subChapterId = `${istqbMatch[1]}-${istqbMatch[2]}`;
                    }
                }

                await DataService.recordUserAnswer(
                    currentUser.id,
                    currentQuestion.id,
                    chapterId,
                    subChapterId,
                    option,
                    isCorrect
                );
            } catch (error) {
                console.error('Answer recording failed:', error);
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setIsAnswered(false);
            setSelectedAnswer(null);
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleQuestionNavigation = (questionIndex: number) => {
        if (questionIndex < 0 || questionIndex >= questions.length) {
            return;
        }

        setCurrentQuestionIndex(questionIndex);

        // Eğer bu soru daha önce cevaplandıysa, cevaplandığını göster
        if (answeredQuestions.has(questionIndex)) {
            setIsAnswered(true);
            // Bu soru için kaydedilmiş cevabı bulamazsak varsayılan olarak işaretleme
            setSelectedAnswer(null); // Gerçek uygulamada bu cevap veritabanından gelebilir
        } else {
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
        setAnsweredQuestions(new Set());
    };

    if (questions.length === 0) {
        return (
            <div className="container mx-auto p-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {chapterInfo?.title || `Bölüm ${chapterId}`}
                    </h1>
                    {subChapterTitle && (
                        <h2 className="text-xl text-gray-600 mb-6">{subChapterTitle}</h2>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <p className="text-lg">Bu bölüm için henüz soru eklenmemiş.</p>
                        <p className="mt-2 text-gray-600">
                            CSM menüsünden yeni sorular ekleyebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="container mx-auto p-8 max-w-3xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Quiz Tamamlandı!</h1>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Sonucunuz</h2>
                        <p className="text-lg">
                            {score} / {questions.length} ({percentage}%)
                        </p>
                        <div className="mt-4">
                            {percentage >= 80 && (
                                <p className="text-green-600 font-semibold">Mükemmel! 🎉</p>
                            )}
                            {percentage >= 60 && percentage < 80 && (
                                <p className="text-yellow-600 font-semibold">İyi iş! 👍</p>
                            )}
                            {percentage < 60 && (
                                <p className="text-red-600 font-semibold">Daha fazla çalışmalısınız 📚</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

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

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    {chapterInfo?.title || `Bölüm ${chapterId}`}
                </h1>
                {subChapterTitle && (
                    <h2 className="text-lg text-gray-600 mb-2">{subChapterTitle}</h2>
                )}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Soru {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="text-sm text-gray-500">
                        Doğru: {score} | Yanlış: {currentQuestionIndex + 1 - score - (isAnswered ? 0 : 1)}
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={option}
                            onClick={() => handleAnswerSelect(option)}
                            className={`p-4 border rounded-lg transition-all ${getOptionClass(option)}`}
                        >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}:</span>
                            {option}
                        </div>
                    ))}
                </div>
            </div>

            {/* Explanation */}
            {isAnswered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-blue-800 mb-2">
                        {selectedAnswer === currentQuestion.correctAnswer ? '✅ Doğru!' : '❌ Yanlış!'}
                    </h4>
                    <p className="text-blue-700"><strong>Açıklama:</strong> {currentQuestion.explanation}</p>
                </div>
            )}

            {/* Navigation with Pagination */}
            <div className="flex flex-col items-center space-y-4">
                {/* Pagination Navigation */}
                <Pagination className="justify-center">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                                className={`cursor-pointer ${currentQuestionIndex === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="hidden sm:block">Önceki</span>
                            </PaginationPrevious>
                        </PaginationItem>

                        {/* Question Number Links */}
                        {questions.map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    onClick={() => handleQuestionNavigation(index)}
                                    isActive={index === currentQuestionIndex}
                                    className={`cursor-pointer ${answeredQuestions.has(index)
                                        ? 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'
                                        : ''
                                        }`}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                                className={`cursor-pointer ${currentQuestionIndex === questions.length - 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="hidden sm:block">Sonraki</span>
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>

                {/* Submit Button */}
                {isAnswered && (
                    <div className="text-center">
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors text-lg font-medium"
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
