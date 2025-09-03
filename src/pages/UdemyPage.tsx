import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';

// Kurs yapısını tanımlıyorum
interface CourseItem {
    id: string;
    title: string;
    duration?: string;
    questions?: string;
}

interface CourseChapter {
    title: string;
    items: CourseItem[];
}

const courseStructure = {
    "1": {
        title: "Einführung",
        items: [
            { id: "1.1", title: "Über den Ausbilder", duration: "01:21" },
            { id: "1.2", title: "ISTQB-Prüfung - Einführung und Ablauf", duration: "02:25" }
        ]
    },
    "2": {
        title: "Testgrundlagen",
        items: [
            { id: "2.1", title: "Quiz 1", questions: "23 soru" },
            { id: "2.2", title: "Quiz 2", questions: "20 soru" },
            { id: "2.3", title: "Quiz 3", questions: "20 soru" }
        ]
    },
    "3": {
        title: "Testen während des SDLC",
        items: [
            { id: "3.1", title: "Quiz 4", questions: "20 soru" },
            { id: "3.2", title: "Quiz 5", questions: "20 soru" },
            { id: "3.3", title: "Quiz 6", questions: "20 soru" }
        ]
    },
    "4": {
        title: "Statisches Testen",
        items: [
            { id: "4.1", title: "Quiz 7", questions: "20 soru" },
            { id: "4.2", title: "Quiz 8", questions: "20 soru" },
            { id: "4.3", title: "Quiz 9", questions: "10 soru" }
        ]
    },
    "5": {
        title: "Testanalyse und Testentwurf",
        items: [
            { id: "5.1", title: "Quiz 10", questions: "20 soru" },
            { id: "5.2", title: "Quiz 11", questions: "20 soru" },
            { id: "5.3", title: "Quiz 12", questions: "20 soru" },
            { id: "5.4", title: "Quiz 13", questions: "10 soru" }
        ]
    },
    "6": {
        title: "Verwaltung der Testaktivitäten",
        items: [
            { id: "6.1", title: "Quiz 14", questions: "20 soru" },
            { id: "6.2", title: "Quiz 15", questions: "20 soru" },
            { id: "6.3", title: "Quiz 16", questions: "20 soru" },
            { id: "6.4", title: "Quiz 17", questions: "10 soru" }
        ]
    },
    "7": {
        title: "Testwerkzeuge",
        items: [
            { id: "7.1", title: "Quiz 18", questions: "20 soru" },
            { id: "7.2", title: "Quiz 19", questions: "20 soru" }
        ]
    },
    "8": {
        title: "Komplette Probeklausuren",
        items: [
            { id: "8.1", title: "Beispielprüfung 1", questions: "40 soru" },
            { id: "8.2", title: "Beispielprüfung 2", questions: "40 soru" },
            { id: "8.3", title: "Beispielprüfung 3", questions: "60 soru" }
        ]
    }
};

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

        const selectedChapterInfo = courseStructure[chapter as keyof typeof courseStructure];
        const selectedSubChapterInfo = selectedChapterInfo?.items.find(item => item.id === subChapter);

        const newQuestion = {
            id: Date.now(),
            question: question.trim(),
            options: options.map(opt => opt.trim()),
            correctAnswer: correctAnswer.trim(),
            explanation: explanation.trim(),
            subChapter: selectedSubChapterInfo?.title,
        };

        try {
            // Udemy soruları için özel bir chapter prefix kullan
            const success = await DataService.addQuestion(`udemy_${chapter}`, newQuestion);

            if (success) {
                console.log('✅ Udemy sorusu başarıyla kaydedildi:', newQuestion);
                alert(`Soru başarıyla Udemy ${chapter}. bölüme eklendi!\n\nBölüm: ${selectedChapterInfo?.title}\nAlt Bölüm: ${selectedSubChapterInfo?.title}`);

                // Formu temizle
                setQuestion('');
                setOptions(['', '', '', '']);
                setCorrectAnswer('');
                setExplanation('');
                setChapter('');
                setSubChapter('');
            } else {
                alert('Soru kaydedilirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Udemy form submission error:', error);
            alert('Soru kaydedilirken bir hata oluştu!');
        }
    };

    const availableSubChapters = chapter ? courseStructure[chapter as keyof typeof courseStructure]?.items || [] : [];

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
                            {Object.entries(courseStructure).map(([key, chapterData]) => (
                                <option key={key} value={key}>
                                    {key}. {chapterData.title}
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
                            {availableSubChapters.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.title}
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
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                    >
                        Soruyu Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UdemyPage;
