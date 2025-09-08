import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import QuizPage from './pages/QuizPage';
import DocumentationPage from './pages/DocumentationPage';
import DocumentationIndexPage from './pages/DocumentationIndexPage';
import IstqbFormPage from './pages/IstqbFormPage';
import UdemyPage from './pages/UdemyPage';
import FragenPage from './pages/FragenPage';
import DataManagementPage from './pages/DataManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IstqbQuizPage from './pages/IstqbQuizPage';
import UserStatsPage from './pages/UserStatsPage';
import { istqbChapters } from '@/constants/istqbChapters';
import { udemyChapters } from '@/constants/udemyChapters';
import { fragenChapters } from '@/constants/fragenChapters';
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user/stats" element={<UserStatsPage />} />
          <Route path="/quiz" element={<QuizSelectionPage />} />
          <Route path="/quiz/:chapterId" element={<QuizPage />} />
          <Route path="/documentation/:chapter/:section" element={<DocumentationPage />} />
          <Route path="/documentation/:chapter" element={<DocumentationPage />} />
          <Route path="/docs" element={<DocumentationIndexPage />} />
          <Route path="/docs/istqb/:chapterId" element={<QuizPage />} />
          <Route path="/cms/istqb-form" element={<IstqbFormPage />} />
          <Route path="/cms/istqb-quiz" element={<IstqbQuizPage />} />
          <Route path="/cms/fragen-quiz" element={<IstqbQuizPage quizType="fragen" title="Fragen Soruları" />} />
          <Route path="/cms/udemy-quiz" element={<IstqbQuizPage quizType="udemy" title="Udemy Soruları" />} />
          <Route path="/docs/cms/udemy" element={<UdemyPage />} />
          <Route path="/docs/cms/fragen" element={<FragenPage />} />
          <Route path="/data-management" element={<DataManagementPage />} />
          {/* Diğer sayfalar için de Route ekleyebilirsin */}
        </Routes>
      </main>
    </ErrorBoundary>
  )
}

// Ana sayfa için basit bir bileşen
const HomePage = () => (
  <div className="container mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">ISTQB Quiz Uygulamasına Hoş Geldiniz!</h1>
    <div className="max-w-2xl mx-auto">
      <p className="text-lg mb-4">
        Bu uygulama ile ISTQB Foundation Level sertifikası için hazırlanabilirsiniz.
      </p>
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Nasıl Kullanılır:</h2>
        <ul className="text-left space-y-2">
          <li><strong>Home:</strong> Ana bölümler ve alt başlıkları görüntüleyin, quiz çözün</li>
          <li><strong>cms:</strong> Yeni sorular ekleyin ve içerik yönetimi yapın</li>
          <li><strong>Documentation:</strong> Ek dokümantasyon ve kaynaklar</li>
        </ul>
      </div>
      <p className="mt-4 text-gray-600">Başlamak için yukarıdaki menüden bir seçenek seçin.</p>
    </div>
  </div>
);

// Quiz Seçim Sayfası
const QuizSelectionPage = () => {
  const navigate = useNavigate();

  const quizTypes = [
    {
      key: 'istqb',
      title: 'ISTQB Foundation Level',
      description: 'Resmi ISTQB konularına göre organize edilmiş sorular',
      chapters: istqbChapters,
      color: 'blue',
      icon: '📚'
    },
    {
      key: 'udemy',
      title: 'Udemy Quiz',
      description: 'Udemy kurslarından derlenen pratik sorular',
      chapters: udemyChapters,
      color: 'purple',
      icon: '🎓'
    },
    {
      key: 'fragen',
      title: 'Fragen Quiz',
      description: 'Genel sınavlarda çıkan sorular ve örnekler',
      chapters: fragenChapters,
      color: 'green',
      icon: '❓'
    }
  ];

  const getFirstChapterId = (chapters: any) => {
    return Object.keys(chapters)[0];
  };

  const navigateToQuiz = (chapters: any) => {
    const firstChapter = getFirstChapterId(chapters);
    navigate(`/quiz/${firstChapter}`);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Quiz Seçin</h1>
        <p className="text-lg text-gray-600">Hangi quiz türünü çözmek istiyorsunuz?</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {quizTypes.map((quiz) => (
          <div
            key={quiz.key}
            className={`bg-white rounded-lg shadow-lg border-t-4 border-${quiz.color}-500 overflow-hidden`}
          >
            {/* Header Section */}
            <div className="p-6">
              <div className="text-center mb-4">
                <span className="text-4xl mb-2 block">{quiz.icon}</span>
                <h2 className={`text-2xl font-bold mb-3 text-${quiz.color}-600`}>
                  {quiz.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {quiz.description}
                </p>
                <p className="text-sm text-gray-500">
                  Toplam {Object.keys(quiz.chapters).length} bölüm mevcut
                </p>
              </div>

              <button
                className={`w-full py-3 px-4 bg-${quiz.color}-500 text-white rounded-lg hover:bg-${quiz.color}-600 transition-colors font-semibold mb-4`}
                onClick={() => navigateToQuiz(quiz.chapters)}
              >
                Quiz Başlat
              </button>
            </div>

            {/* Expandable Chapters Section */}
            <div className="border-t border-gray-200">
              <details className="group">
                <summary className={`cursor-pointer p-4 bg-${quiz.color}-50 hover:bg-${quiz.color}-100 transition-colors font-medium text-${quiz.color}-700 list-none`}>
                  <div className="flex items-center justify-between">
                    <span>Bölümleri Görüntüle</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>

                <div className="max-h-80 overflow-y-auto">
                  {Object.entries(quiz.chapters).map(([chapterKey, chapter]: [string, any]) => (
                    <details key={chapterKey} className="border-b border-gray-100">
                      <summary className="cursor-pointer p-3 hover:bg-gray-50 text-sm font-medium list-none">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{chapter.title}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({chapter.subChapters.length} alt bölüm)
                          </span>
                        </div>
                      </summary>

                      <div className="bg-gray-50 px-4 py-2">
                        <ul className="space-y-1">
                          {chapter.subChapters.map((subChapter: string, index: number) => (
                            <li key={index}>
                              <button
                                className={`w-full text-left p-2 text-xs rounded hover:bg-${quiz.color}-100 hover:text-${quiz.color}-700 transition-colors`}
                                onClick={() => navigate(`/quiz/${chapterKey}?sub=${index}`)}
                              >
                                {subChapter}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-2 text-amber-800">💡 İpucu</h3>
          <p className="text-amber-700">
            <strong>Quiz Başlat</strong> butonu ile tüm bölümleri çözebilir,
            <strong> Bölümleri Görüntüle</strong> ile spesifik bölüm ve alt konuları seçebilirsiniz.
            Her alt konuya tıklayarak o konuya özel quiz başlatabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;