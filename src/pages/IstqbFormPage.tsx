import React, { useState, useEffect } from 'react';
import { istqbChapters } from '@/constants/istqbChapters';
import { DataService } from '@/services/dataService';

const IstqbFormPage: React.FC = () => {
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

        const newQuestion = {
            id: Date.now(),
            question,
            options: options.filter(opt => opt.trim() !== ''), // Boş seçenekleri temizle
            correctAnswer,
            explanation,
            subChapter: subChapter || undefined,
        };

        // Veriyi backend'e veya localStorage'a kaydet
        const success = await DataService.addQuestion(chapter, newQuestion);

        if (success) {
            console.log('✅ Soru başarıyla kaydedildi:', { chapter, subChapter, newQuestion });

            // Backend durumunu kontrol et ve kullanıcıya bilgi ver
            const backendStatus = await DataService.getBackendStatus();
            alert(`Soru başarıyla ${chapter}. bölüme eklendi!\n\nBölüm: ${istqbChapters[chapter as keyof typeof istqbChapters]?.title}\nAlt Bölüm: ${subChapter}\n\n${backendStatus.message}`);

            // Formu temizle
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectAnswer('');
            setExplanation('');

            // Debug: localStorage'daki tüm soruları göster
            console.log('📊 Bu bölümdeki tüm sorular:', DataService.getQuestions(chapter));
            console.log('📋 JSON formatında veri:', DataService.exportChapterData(chapter));
        } else {
            alert('Soru kaydedilirken bir hata oluştu!');
        }
    };

    const availableSubChapters = chapter ? istqbChapters[chapter as keyof typeof istqbChapters]?.subChapters || [] : [];

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Yeni ISTQB Sorusu Ekle</h1>
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
                            {Object.entries(istqbChapters).map(([key, chapterData]) => (
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
                            {availableSubChapters.map((subChap, index) => (
                                <option key={index} value={subChap}>
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
                        className="px-8 py-3 bg-purple-600 text-red rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                    >
                        Soruyu Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IstqbFormPage;
