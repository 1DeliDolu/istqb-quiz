import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';
import { istqbChapters } from '@/constants/istqbChapters';

const DataManagementPage: React.FC = () => {
    const [storedChapters, setStoredChapters] = useState<{ id: string; questionCount: number; source: string }[]>([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [backendStatus, setBackendStatus] = useState<{ available: boolean; message: string }>({ available: false, message: 'Checking...' });

    useEffect(() => {
        refreshStoredChapters();
        checkBackendStatus();
    }, []);

    const refreshStoredChapters = async () => {
        const chapters = await DataService.getAllStoredChapters();
        setStoredChapters(chapters);
    };

    const checkBackendStatus = async () => {
        const status = await DataService.getBackendStatus();
        setBackendStatus(status);
    };

    const handleExportChapter = async (chapter: string) => {
        const jsonData = await DataService.exportChapterData(chapter);
        setJsonOutput(jsonData);
        setSelectedChapter(chapter);
    };

    const handleClearChapter = async (chapter: string) => {
        if (confirm(`${chapter}. bölümdeki tüm soruları silmek istediğinize emin misiniz?`)) {
            await DataService.clearChapter(chapter);
            await refreshStoredChapters();
            if (selectedChapter === chapter) {
                setJsonOutput('');
                setSelectedChapter('');
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonOutput);
            alert('JSON verisi panoya kopyalandı!');
        } catch (err) {
            console.error('Kopyalama hatası:', err);
            // Fallback: text area seçimi
            const textArea = document.createElement('textarea');
            textArea.value = jsonOutput;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('JSON verisi panoya kopyalandı!');
        }
    };

    const getChapterTitle = (chapterKey: string) => {
        const chapterInfo = istqbChapters[chapterKey as keyof typeof istqbChapters];
        return chapterInfo ? chapterInfo.title : `Bölüm ${chapterKey}`;
    };

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Veri Yönetimi</h1>
            <p className="text-gray-600 mb-4">
                Eklenen soruları görüntüleyin, JSON formatında dışa aktarın ve JSON dosyalarına manuel olarak ekleyin.
            </p>

            {/* Backend Status */}
            <div className={`mb-6 p-4 rounded-lg ${backendStatus.available ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Sunucu Durumu</h3>
                        <p className={`text-sm ${backendStatus.available ? 'text-green-600' : 'text-yellow-600'}`}>
                            {backendStatus.message}
                        </p>
                    </div>
                    <button
                        onClick={checkBackendStatus}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Yenile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol panel: Stored Chapters */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Kaydedilen Bölümler</h2>
                    {storedChapters.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800">Henüz hiç soru eklenmemiş.</p>
                            <p className="text-yellow-600 text-sm mt-1">
                                CSM menüsünden soru ekledikten sonra burada görünecekler.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {storedChapters.map((chapter) => (
                                <div
                                    key={chapter.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {getChapterTitle(chapter.id)}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {chapter.questionCount} soru • {chapter.source}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleExportChapter(chapter.id)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                JSON Göster
                                            </button>
                                            <button
                                                onClick={() => handleClearChapter(chapter.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                            >
                                                Temizle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>                {/* Sağ panel: JSON Output */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">JSON Verisi</h2>
                        {jsonOutput && (
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                📋 Kopyala
                            </button>
                        )}
                    </div>

                    {selectedChapter ? (
                        <div>
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <h3 className="font-semibold text-blue-800">
                                    {getChapterTitle(selectedChapter)}
                                </h3>
                                <p className="text-blue-600 text-sm">
                                    Bu veriyi <code>src/data/istqb/{selectedChapter}.json</code> dosyasına kopyalayın
                                </p>
                            </div>

                            <textarea
                                value={jsonOutput}
                                readOnly
                                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                                placeholder="JSON verisi burada görünecek..."
                            />

                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <h4 className="font-semibold text-yellow-800 mb-2">Nasıl kullanılır:</h4>
                                <ol className="text-sm text-yellow-700 space-y-1">
                                    <li>1. Yukarıdaki "📋 Kopyala" butonuna tıklayın</li>
                                    <li>2. <code>src/data/istqb/{selectedChapter}.json</code> dosyasını açın</li>
                                    <li>3. Mevcut içeriği silin ve kopyaladığınız veriyi yapıştırın</li>
                                    <li>4. Dosyayı kaydedin</li>
                                    <li>5. Artık sorular quiz sayfasında görünecek!</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <p className="text-gray-500">
                                JSON verisini görmek için bir bölüm seçin
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataManagementPage;
