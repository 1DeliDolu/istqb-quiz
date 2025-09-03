import { Routes, Route } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import QuizPage from './pages/QuizPage';
import IstqbFormPage from './pages/IstqbFormPage';
import UdemyPage from './pages/UdemyPage';
import FragenPage from './pages/FragenPage';
import DataManagementPage from './pages/DataManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IstqbQuizPage from './pages/IstqbQuizPage';
import UserStatsPage from './pages/UserStatsPage';
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user/stats" element={<UserStatsPage />} />
          <Route path="/quiz/:chapterId" element={<QuizPage />} />
          <Route path="/docs/istqb/:chapterId" element={<QuizPage />} />
          <Route path="/csm/istqb-form" element={<IstqbFormPage />} />
          <Route path="/csm/istqb-quiz" element={<IstqbQuizPage />} />
          <Route path="/csm/fragen-quiz" element={<IstqbQuizPage quizType="fragen" title="Fragen Soruları" />} />
          <Route path="/csm/udemy-quiz" element={<IstqbQuizPage quizType="udemy" title="Udemy Soruları" />} />
          <Route path="/docs/csm/udemy" element={<UdemyPage />} />
          <Route path="/docs/csm/fragen" element={<FragenPage />} />
          <Route path="/data-management" element={<DataManagementPage />} />
          {/* Diğer sayfalar için de Route ekleyebilirsin */}
        </Routes>
      </main>
    </>
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
          <li><strong>CSM:</strong> Yeni sorular ekleyin ve içerik yönetimi yapın</li>
          <li><strong>Documentation:</strong> Ek dokümantasyon ve kaynaklar</li>
        </ul>
      </div>
      <p className="mt-4 text-gray-600">Başlamak için yukarıdaki menüden bir seçenek seçin.</p>
    </div>
  </div>
);

export default App;