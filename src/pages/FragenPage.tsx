import React, { useState } from 'react';
import { DataService } from '@/services/dataService';

const FragenPage: React.FC = () => {
    const [chapter, setChapter] = useState('');
    const [subChapter, setSubChapter] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [explanation, setExplanation] = useState('');

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chapter.trim() || !subChapter.trim()) {
            alert('Lütfen hem ana bölüm hem de alt bölüm girin');
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

        const newQuestion = {
            id: Date.now(),
            question: question.trim(),
            options: options.map(opt => opt.trim()),
            correctAnswer: correctAnswer.trim(),
            explanation: explanation.trim(),
            subChapter: subChapter.trim(),
        };

        try {
            // Fragen soruları için özel bir chapter prefix kullan
            const success = await DataService.addQuestion(`fragen_${chapter.replace(/\s+/g, '_')}`, newQuestion);

            if (success) {
                console.log('✅ Fragen sorusu başarıyla kaydedildi:', newQuestion);
                alert(`Soru başarıyla kaydedildi!\n\nBölüm: ${chapter}\nAlt Bölüm: ${subChapter}`);

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
            console.error('Fragen form submission error:', error);
            alert('Soru kaydedilirken bir hata oluştu!');
        }
    }; return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Yeni Fragen Sorusu Ekle</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                            Ana Bölüm
                        </label>
                        <input
                            type="text"
                            id="chapter"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ana bölüm adını girin..."
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="subChapter" className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Bölüm
                        </label>
                        <input
                            type="text"
                            id="subChapter"
                            value={subChapter}
                            onChange={(e) => setSubChapter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Alt bölüm adını girin..."
                            required
                        />
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
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                    >
                        Soruyu Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};
export default FragenPage;