import React, { useState, useEffect } from 'react';
import { istqbChapters } from '@/constants/istqbChapters';
import { udemyChapters } from '@/constants/udemyChapters';
import { fragenChapters } from '@/constants/fragenChapters';
import type { ChapterData } from '@/types/chapters';
import { DataService, type Question } from '@/services/dataService';

interface QuizPageProps {
    quizType?: 'istqb' | 'udemy' | 'fragen';
    title?: string;
}

const chapterSources: Record<'istqb' | 'udemy' | 'fragen', ChapterData> = {
    istqb: istqbChapters,
    udemy: udemyChapters,
    fragen: fragenChapters,
};


const IstqbQuizPage: React.FC<QuizPageProps> = ({ quizType = 'istqb', title = 'ISTQB Soruları' }) => {
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedSubChapter, setSelectedSubChapter] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editForm, setEditForm] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        explanation: ''
    });

    const chapters = chapterSources[quizType];

    // Seçili bölümün alt bölümlerini getir
    const availableSubChapters = selectedChapter && chapters[selectedChapter]
        ? chapters[selectedChapter].subChapters
        : [];

    // Soruları yükle
    const fetchQuestions = async () => {
        if (!selectedChapter) return;

        setLoading(true);
        try {
            const subChapterTitle = selectedSubChapter ? selectedSubChapter : undefined;
            const allQuestions = await DataService.getQuestions(selectedChapter, subChapterTitle);

            setQuestions(allQuestions);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setQuizCompleted(false);
            setScore(0);

            console.log(`📚 ${quizType.toUpperCase()} - ${allQuestions.length} soru yüklendi (Bölüm: ${selectedChapter}${selectedSubChapter ? `, Alt bölüm: ${selectedSubChapter}` : ''})`);
        } catch (error) {
            console.error('Sorular yüklenemedi:', error);
            setQuestions([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
    }, [selectedChapter, selectedSubChapter]);

    // Kullanıcı bilgisini al
    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    // Edit functions
    const handleEditQuestion = (question: Question) => {
        setIsEditMode(true);
        setEditingQuestion(question);
        setEditForm({
            question: question.question,
            option1: question.options[0] || '',
            option2: question.options[1] || '',
            option3: question.options[2] || '',
            option4: question.options[3] || '',
            correctAnswer: question.correctAnswer,
            explanation: question.explanation || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editingQuestion) return;

        try {
            setLoading(true);
            const updatedQuestion = {
                ...editingQuestion,
                question: editForm.question,
                options: [editForm.option1, editForm.option2, editForm.option3, editForm.option4],
                correctAnswer: editForm.correctAnswer,
                explanation: editForm.explanation
            };

            // Şimdilik backend'e güncellemeleri localStorage'a kaydedelim
            // TODO: Backend updateQuestion API'si eklenmeli
            console.log('Soru güncellendi:', updatedQuestion);

            const success = await DataService.updateQuestion(updatedQuestion);

            if (success) {
                // Soruları yeniden yükle
                await fetchQuestions();

                // Edit modunu kapat
                setIsEditMode(false);
                setEditingQuestion(null);

                alert('Soru başarıyla güncellendi!');
            } else {
                alert('Soru güncellenirken hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Soru güncellenirken hata:', error);
            alert('Soru güncellenirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingQuestion(null);
        setEditForm({
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctAnswer: '',
            explanation: ''
        });
    };

    const handleAnswerSelect = async (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Kullanıcının cevabını kaydet
        const currentUser = getCurrentUser();
        if (currentUser && selectedChapter) {
            try {
                // Sub-chapter ID'sini hesapla
                let subChapterId = null;
                if (selectedSubChapter) {
                    if (quizType === 'udemy') {
                        // Udemy için sub-chapter ID formatı: udemy_<chapter>_quiz_<n>
                        const subChapterMatch = selectedSubChapter.match(/^(\d+)\.(\d+)/);
                        if (subChapterMatch) {
                            subChapterId = `udemy_${subChapterMatch[1]}_quiz_${subChapterMatch[2]}`;
                        }
                    } else if (quizType === 'fragen') {
                        // Fragen için sub-chapter ID formatı hesapla
                        if (selectedSubChapter.startsWith('Genel.')) {
                            const match = selectedSubChapter.match(/^Genel\.(\d+)/);
                            if (match) subChapterId = `fragen_genel_${match[1]}`;
                        } else if (selectedSubChapter.startsWith('Deutsch.')) {
                            const match = selectedSubChapter.match(/^Deutsch\.(\d+)/);
                            if (match) subChapterId = `fragen_deutsch_${match[1]}`;
                        } else if (selectedSubChapter.startsWith('Praxis.')) {
                            const match = selectedSubChapter.match(/^Praxis\.(\d+)/);
                            if (match) subChapterId = `fragen_praxis_${match[1]}`;
                        } else if (selectedSubChapter.startsWith('Mixed.')) {
                            const match = selectedSubChapter.match(/^Mixed\.(\d+)/);
                            if (match) subChapterId = `fragen_mixed_${match[1]}`;
                        }
                    } else {
                        // ISTQB için sub-chapter ID formatı hesapla (3 seviye destek)
                        const istqbMatch = selectedSubChapter.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
                        if (istqbMatch) {
                            subChapterId = `${istqbMatch[1]}-${istqbMatch[2]}${istqbMatch[3] ? `-${istqbMatch[3]}` : ''}`;
                        }
                    }
                }

                await DataService.recordUserAnswer(
                    currentUser.id,
                    questions[currentQuestionIndex].id,
                    selectedChapter,
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
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
        setScore(0);
    };

    const getOptionClass = (option: string) => {
        if (!isAnswered) {
            return "border-gray-300 hover:border-amber-500 hover:bg-amber-50 cursor-pointer";
        }
        if (option === questions[currentQuestionIndex].correctAnswer) {
            return "border-green-500 bg-green-100 text-green-800";
        }
        if (option === selectedAnswer) {
            return "border-red-500 bg-red-100 text-red-800";
        }
        return "border-gray-300 opacity-60";
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4 text-purple-600">{title}</h1>
                <p className="text-gray-600">Bölüm ve alt bölüm seçerek soruları görüntüleyebilir ve düzenleyebilirsiniz.</p>
            </div>

            {/* Bölüm Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                        Ana Bölüm
                    </label>
                    <select
                        id="chapter"
                        value={selectedChapter}
                        onChange={(e) => {
                            setSelectedChapter(e.target.value);
                            setSelectedSubChapter('');
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">Ana bölüm seçin...</option>
                        {Object.entries(chapters).map(([key, chapterData]) => (
                            <option key={key} value={key}>
                                {chapterData.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="subChapter" className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Bölüm (İsteğe bağlı)
                    </label>
                    <select
                        id="subChapter"
                        value={selectedSubChapter}
                        onChange={(e) => setSelectedSubChapter(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        disabled={!selectedChapter}
                    >
                        <option value="">Tüm alt bölümler</option>
                        {availableSubChapters.map((subChapter, index) => (
                            <option key={index} value={subChapter}>
                                {subChapter}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Sorular yükleniyor...</p>
                </div>
            )}

            {!loading && selectedChapter && questions.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Bu bölüm için henüz soru eklenmemiş
                    </h3>
                    <p className="text-yellow-700 mb-4">
                        {selectedSubChapter
                            ? `"${selectedSubChapter}" alt bölümü için`
                            : `"${chapters[selectedChapter]?.title}" bölümü için`
                        } henüz soru bulunmamaktadır.
                    </p>
                    <a
                        href={`/cms/${quizType}-form`}
                        className="inline-block px-4 py-2 bg-amber-100 text-black rounded hover:bg-amber-200 border border-amber-300"
                    >
                        Yeni Soru Ekle
                    </a>
                </div>
            )}

            {!loading && questions.length > 0 && !quizCompleted && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Soru başlığı */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {chapters[selectedChapter]?.title}
                            </h2>
                            {selectedSubChapter && (
                                <p className="text-gray-600">{selectedSubChapter}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                Soru {currentQuestionIndex + 1} / {questions.length}
                            </div>
                            <button
                                onClick={() => handleEditQuestion(currentQuestion)}
                                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            >
                                ✏️ Düzenle
                            </button>
                        </div>
                    </div>

                    {/* Soru metni */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
                    </div>

                    {/* Seçenekler */}
                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`p-4 border rounded-lg transition-all ${getOptionClass(option)}`}
                            >
                                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}:</span>
                                {option}
                            </div>
                        ))}
                    </div>

                    {/* Açıklama */}
                    {isAnswered && currentQuestion.explanation && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Açıklama:</h4>
                            <p className="text-blue-700">{currentQuestion.explanation}</p>
                        </div>
                    )}

                    {/* Sonraki soru butonu */}
                    {isAnswered && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleNextQuestion}
                                className="px-6 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Göster'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {quizCompleted && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Quiz Tamamlandı!</h2>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                        {score} / {questions.length}
                    </div>
                    <p className="text-gray-600 mb-2">
                        {Math.round((score / questions.length) * 100)}% başarı oranı
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        {selectedSubChapter
                            ? selectedSubChapter
                            : chapters[selectedChapter]?.title
                        }
                    </p>
                    <button
                        onClick={restartQuiz}
                        className="px-6 py-3 bg-amber-100 text-black rounded-lg hover:bg-amber-200 border border-amber-300 transition-colors"
                    >
                        Tekrar Çöz
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {isEditMode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-purple-600">Soruyu Düzenle</h2>
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form className="space-y-4">
                                {/* Soru metni */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Soru Metni
                                    </label>
                                    <textarea
                                        value={editForm.question}
                                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Soru metnini giriniz..."
                                    />
                                </div>

                                {/* Seçenekler */}
                                {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                                    <div key={optionKey}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seçenek {String.fromCharCode(65 + index)}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm[optionKey as keyof typeof editForm] as string}
                                            onChange={(e) => setEditForm({ ...editForm, [optionKey]: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                            placeholder={`Seçenek ${String.fromCharCode(65 + index)}`}
                                        />
                                    </div>
                                ))}

                                {/* Doğru cevap */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Doğru Cevap
                                    </label>
                                    <select
                                        value={editForm.correctAnswer}
                                        onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">Doğru cevabı seçin...</option>
                                        <option value={editForm.option1}>A: {editForm.option1}</option>
                                        <option value={editForm.option2}>B: {editForm.option2}</option>
                                        <option value={editForm.option3}>C: {editForm.option3}</option>
                                        <option value={editForm.option4}>D: {editForm.option4}</option>
                                    </select>
                                </div>

                                {/* Açıklama */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Açıklama (Opsiyonel)
                                    </label>
                                    <textarea
                                        value={editForm.explanation}
                                        onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Cevabın açıklamasını giriniz..."
                                    />
                                </div>

                                {/* Butonlar */}
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                        className="px-4 py-2 bg-amber-100 text-black rounded-md hover:bg-amber-200 border border-amber-300 disabled:opacity-50"
                                    >
                                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IstqbQuizPage;
