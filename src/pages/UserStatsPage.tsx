import React, { useEffect, useState } from 'react';
import { DataService, type Question } from '@/services/dataService';
import { udemyChapters } from '@/constants/udemyChapters';
import { fragenChapters } from '@/constants/fragenChapters';
import { istqbChapters } from '@/constants/istqbChapters';

interface UserStats {
    totalStats: {
        chapters_attempted: number;
        sub_chapters_attempted: number;
        total_questions_answered: number;
        total_correct: number;
        total_wrong: number;
        overall_success_rate: number;
    };
    chapterStats: Array<{
        chapter_id: string;
        chapter_title: string;
        sub_chapter_id: string;
        sub_chapter_title: string;
        total_questions: number;
        correct_answers: number;
        wrong_answers: number;
        success_rate: number;
        last_attempt: string;
    }>;
}

const UserStatsPage: React.FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
    const [loadingWrongAnswers, setLoadingWrongAnswers] = useState(false);

    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const getChapterTitle = (chapterId: string, backendTitle?: string) => {
        // Eğer backend'den gelen title varsa onu kullan
        if (backendTitle) {
            return backendTitle;
        }

        // Değilse frontend constants'lardan al
        if (chapterId?.startsWith('udemy_')) {
            return udemyChapters[chapterId as keyof typeof udemyChapters]?.title || chapterId;
        } else if (chapterId?.startsWith('fragen_')) {
            return fragenChapters[chapterId as keyof typeof fragenChapters]?.title || chapterId;
        } else {
            return istqbChapters[chapterId as keyof typeof istqbChapters]?.title || chapterId;
        }
    };

    useEffect(() => {
        const loadStats = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userStats = await DataService.getUserStats(currentUser.id);
                setStats(userStats);
            } catch (error) {
                console.error('Stats loading failed:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const loadWrongAnswers = async (chapterId: string, subChapterId?: string) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        setLoadingWrongAnswers(true);
        setSelectedChapter(chapterId);

        try {
            const wrongQuestions = await DataService.getUserWrongAnswers(
                currentUser.id,
                chapterId,
                subChapterId
            );
            setWrongAnswers(wrongQuestions);
        } catch (error) {
            console.error('Wrong answers loading failed:', error);
            setWrongAnswers([]);
        } finally {
            setLoadingWrongAnswers(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 max-w-6xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">İstatistikler Yükleniyor...</h1>
                    <div className="animate-pulse">📊</div>
                </div>
            </div>
        );
    }

    if (!getCurrentUser()) {
        return (
            <div className="container mx-auto p-8 max-w-6xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">İstatistikler</h1>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <p className="text-lg">İstatistikleri görmek için giriş yapmanız gerekir.</p>
                        <a href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Giriş Yap
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="container mx-auto p-8 max-w-6xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">İstatistikler</h1>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <p className="text-lg">Henüz hiç quiz çözmediniz.</p>
                        <p className="mt-2 text-gray-600">
                            Menüden bir bölüm seçip quiz çözmeye başlayın!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">📊 İstatistiklerim</h1>

            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="text-2xl font-bold text-blue-800">{stats.totalStats.total_questions_answered}</div>
                    <div className="text-blue-600">Toplam Soru</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-800">{stats.totalStats.total_correct}</div>
                    <div className="text-green-600">Doğru Cevap</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-2xl font-bold text-red-800">{stats.totalStats.total_wrong}</div>
                    <div className="text-red-600">Yanlış Cevap</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="text-2xl font-bold text-purple-800">%{stats.totalStats.overall_success_rate}</div>
                    <div className="text-purple-600">Başarı Oranı</div>
                </div>
            </div>

            {/* Bölüm Bazında İstatistikler */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Bölüm Bazında Performans</h2>

                {stats.chapterStats.length === 0 ? (
                    <p className="text-gray-500">Henüz hiç bölüm çözmediniz.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left">Bölüm</th>
                                    <th className="px-4 py-2 text-left">Alt Bölüm</th>
                                    <th className="px-4 py-2 text-center">Toplam</th>
                                    <th className="px-4 py-2 text-center">Doğru</th>
                                    <th className="px-4 py-2 text-center">Yanlış</th>
                                    <th className="px-4 py-2 text-center">Başarı</th>
                                    <th className="px-4 py-2 text-center">Yanlış Sorular</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.chapterStats.map((chapter, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{getChapterTitle(chapter.chapter_id, chapter.chapter_title)}</div>
                                            <div className="text-sm text-gray-500">{chapter.chapter_id}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">{chapter.sub_chapter_title || 'Tüm alt bölümler'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{chapter.total_questions}</td>
                                        <td className="px-4 py-3 text-center text-green-600 font-medium">
                                            {chapter.correct_answers}
                                        </td>
                                        <td className="px-4 py-3 text-center text-red-600 font-medium">
                                            {chapter.wrong_answers}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${chapter.success_rate >= 80 ? 'text-green-600' :
                                                chapter.success_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                %{chapter.success_rate}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {chapter.wrong_answers > 0 && (
                                                <button
                                                    onClick={() => loadWrongAnswers(chapter.chapter_id, chapter.sub_chapter_id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                                                >
                                                    {chapter.wrong_answers} Yanlış Görüntüle
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Yanlış Cevaplar */}
            {selectedChapter && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        🔍 Yanlış Cevaplar - {getChapterTitle(selectedChapter)}
                    </h2>

                    {loadingWrongAnswers ? (
                        <div className="text-center py-8">
                            <div className="animate-pulse">Yükleniyor...</div>
                        </div>
                    ) : wrongAnswers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Bu bölümde yanlış cevap bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {wrongAnswers.map((question, index) => (
                                <div key={question.id} className="border rounded-lg p-4 bg-red-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-lg">Soru {index + 1}</h3>
                                        <div className="text-sm text-gray-500">
                                            {question.subChapter && <span>Alt Bölüm: {question.subChapter}</span>}
                                        </div>
                                    </div>

                                    <p className="mb-4">{question.question}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {question.options.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`p-3 rounded border ${option === question.correctAnswer
                                                    ? 'bg-green-100 border-green-500 text-green-800'
                                                    : option === (question as any).userAnswer
                                                        ? 'bg-red-100 border-red-500 text-red-800'
                                                        : 'bg-white border-gray-300'
                                                    }`}
                                            >
                                                <span className="font-medium mr-2">
                                                    {String.fromCharCode(65 + optIndex)}:
                                                </span>
                                                {option}
                                                {option === question.correctAnswer && (
                                                    <span className="ml-2 text-green-600">✓ Doğru</span>
                                                )}
                                                {option === (question as any).userAnswer && option !== question.correctAnswer && (
                                                    <span className="ml-2 text-red-600">✗ Seçtiğiniz</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {question.explanation && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                            <strong>Açıklama:</strong> {question.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="text-center mt-6">
                                <button
                                    onClick={() => {
                                        setSelectedChapter(null);
                                        setWrongAnswers([]);
                                    }}
                                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    Listeyi Kapat
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserStatsPage;
