import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';
import { udemyChapters } from '@/constants/udemyChapters';

const UdemyPage: React.FC = () => {
    const [chapter, setChapter] = useState('');
    const [subChapter, setSubChapter] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [explanation, setExplanation] = useState('');

    // Reset sub-chapter when main chapter changes
    useEffect(() => {
        setSubChapter('');
    }, [chapter]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chapter || !subChapter) {
            alert('Lütfen hem ana bölüm hem de alt bölüm seçin');
            return;
        }

        if (!question.trim() || !correctAnswer.trim() || !explanation.trim()) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        if (options.some(opt => !opt.trim())) {
            alert('Lütfen tüm seçenekleri doldurun');
            return;
        }

        const selectedChapterInfo = udemyChapters[chapter as keyof typeof udemyChapters];

        const newQuestion = {
            id: Date.now(),
            question: question.trim(),
            options: options.map(opt => opt.trim()),
            correctAnswer: correctAnswer.trim(),
            explanation: explanation.trim(),
            subChapter: subChapter,
        };

        try {
            // Udemy soruları için chapter ID'sini direkt kullan
            const success = await DataService.addQuestion(chapter, newQuestion);

            if (success) {
                console.log('✅ Udemy sorusu başarıyla kaydedildi:', newQuestion);
                alert(`Soru başarıyla kaydedildi!\n\nBölüm: ${selectedChapterInfo?.title}\nAlt Bölüm: ${subChapter}`);

                // Formu temizle
                setChapter('');
                setSubChapter('');
                setQuestion('');
                setOptions(['', '', '', '']);
                setCorrectAnswer('');
                setExplanation('');
            } else {
                alert('Soru kaydedilirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Udemy form submission error:', error);
            alert('Soru kaydedilirken bir hata oluştu!');
        }
    };

    const availableSubChapters = chapter ? udemyChapters[chapter as keyof typeof udemyChapters]?.subChapters || [] : [];

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Yeni Udemy Sorusu Ekle</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                            Ana Bölüm
                        </label>
                        <select
                            id="chapter"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Ana bölüm seçin...</option>
                            {Object.entries(udemyChapters).map(([key, chapterData]) => (
                                <option key={key} value={key}>
                                    {chapterData.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="subChapter" className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Bölüm
                        </label>
                        <select
                            id="subChapter"
                            value={subChapter}
                            onChange={(e) => setSubChapter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={!chapter || availableSubChapters.length === 0}
                            required
                        >
                            <option value="">Alt bölüm seçin...</option>
                            {availableSubChapters.map((subChap) => (
                                <option key={subChap} value={subChap}>
                                    {subChap}
                                </option>
                            ))}
                        </select>
                        {chapter && availableSubChapters.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">Bu bölüm için alt bölüm bulunmamaktadır.</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                        Soru
                    </label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Sorunuzu buraya yazın..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seçenekler</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((option, index) => (
                            <div key={index}>
                                <label className="block text-xs text-gray-500 mb-1">Seçenek {String.fromCharCode(65 + index)}</label>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={`Seçenek ${String.fromCharCode(65 + index)}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                        Doğru Cevap
                    </label>
                    <select
                        id="correctAnswer"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    >
                        <option value="">Doğru cevabı seçin...</option>
                        {options.filter(opt => opt.trim()).map((opt, index) => (
                            <option key={opt} value={opt}>
                                {String.fromCharCode(65 + index)}: {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
                        Açıklama
                    </label>
                    <textarea
                        id="explanation"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Doğru cevabın açıklamasını yazın..."
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        Soruyu Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UdemyPage;
