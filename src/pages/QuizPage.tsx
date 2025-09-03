import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { istqbChapters } from '@/constants/istqbChapters';
import { DataService, type Question } from '@/services/dataService';

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

    const chapterInfo = chapterId ? istqbChapters[chapterId as keyof typeof istqbChapters] : null;
    const subChapterTitle = chapterInfo && subChapterIndex ?
        chapterInfo.subChapters[parseInt(subChapterIndex)] : null;

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!chapterId) return;

            try {
                // İlk önce JSON dosyasındaki mevcut verileri import et
                await DataService.importJsonData(chapterId);

                // DataService'den soruları al (backend'den veya localStorage'dan)
                let allQuestions = await DataService.getQuestions(chapterId);

                // Eğer hiç soru yoksa, JSON dosyasından yüklemeyi dene
                if (allQuestions.length === 0) {
                    try {
                        const data = await import(`../data/istqb/${chapterId}.json`);
                        allQuestions = data.default || [];
                    } catch (error) {
                        console.log(`No JSON file found for chapter ${chapterId}`);
                    }
                }

                // Eğer belirli bir alt bölüm seçildiyse, o alt bölüme ait soruları filtrele
                if (subChapterIndex && subChapterTitle) {
                    allQuestions = allQuestions.filter((q: Question) =>
                        q.subChapter === subChapterTitle
                    );
                }

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
    }, [chapterId, subChapterIndex, subChapterTitle]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
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

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
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
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            return "border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer";
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
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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

            {/* Navigation */}
            {isAnswered && (
                <div className="text-center">
                    <button
                        onClick={handleNextQuestion}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-medium"
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
