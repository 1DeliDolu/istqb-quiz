export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subChapter?: string;
}

const API_BASE_URL = "http://localhost:3002/api";

export class DataService {
  // LocalStorage anahtarları (yedek olarak)
  private static getStorageKey(chapter: string): string {
    return `istqb_chapter_${chapter}`;
  }

  // Backend API'nin çalışıp çalışmadığını kontrol et
  static async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Backend durumunu kontrol et
  static async getBackendStatus(): Promise<{
    available: boolean;
    message: string;
  }> {
    try {
      const isAvailable = await this.isBackendAvailable();
      return {
        available: isAvailable,
        message: isAvailable
          ? "🟢 Backend server çalışıyor - Sorular kalıcı olarak kaydedilecek"
          : "🟡 Backend server mevcut değil - Geçici localStorage kullanılıyor",
      };
    } catch (error) {
      return {
        available: false,
        message:
          "🔴 Backend bağlantı hatası - Geçici localStorage kullanılıyor",
      };
    }
  }

  // Bir bölümün sorularını getir (önce backend'den, sonra localStorage'dan)
  static async getQuestions(
    chapter: string,
    subChapter?: string
  ): Promise<Question[]> {
    try {
      // İlk önce backend API'den dene
      if (await this.isBackendAvailable()) {
        let apiUrl = `${API_BASE_URL}/questions/${chapter}`;
        if (subChapter) {
          apiUrl += `?subChapter=${encodeURIComponent(subChapter)}`;
        }

        const response = await fetch(apiUrl);
        if (response.ok) {
          const questions = await response.json();
          console.log(
            `📚 ${chapter} bölümü${subChapter ? ` (${subChapter})` : ""} için ${
              questions.length
            } soru sunucudan yüklendi`
          );
          return questions;
        }
      }

      // Backend yoksa localStorage'dan al
      console.log("⚠️ Backend mevcut değil, localStorage kullanılıyor");
      const stored = localStorage.getItem(this.getStorageKey(chapter));
      let questions = stored ? JSON.parse(stored) : [];

      // SubChapter filtresi uygula
      if (subChapter && questions.length > 0) {
        questions = questions.filter(
          (q: Question) => q.subChapter === subChapter
        );
      }

      return questions;
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      // Son çare olarak localStorage'dan dene
      const stored = localStorage.getItem(this.getStorageKey(chapter));
      let questions = stored ? JSON.parse(stored) : [];

      // SubChapter filtresi uygula
      if (subChapter && questions.length > 0) {
        questions = questions.filter(
          (q: Question) => q.subChapter === subChapter
        );
      }

      return questions;
    }
  }

  // Yeni soru ekle (hem backend'e hem localStorage'a)
  static async addQuestion(
    chapter: string,
    question: Question
  ): Promise<boolean> {
    let backendSuccess = false;
    let localSuccess = false;

    try {
      // İlk önce backend API'ye kaydet
      if (await this.isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/questions/${chapter}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(question),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(
            `✅ ${chapter} bölümü için soru sunucuya kaydedildi. Toplam soru: ${result.questionCount}`
          );
          backendSuccess = true;
        }
      }
    } catch (error) {
      console.error("Backend kayıt hatası:", error);
    }

    try {
      // Yedek olarak localStorage'a da kaydet
      const existingQuestions = await this.getQuestionsFromLocalStorage(
        chapter
      );
      existingQuestions.push(question);
      localStorage.setItem(
        this.getStorageKey(chapter),
        JSON.stringify(existingQuestions)
      );
      localSuccess = true;
      console.log(
        `💾 ${chapter} bölümü için soru localStorage'a da kaydedildi`
      );
    } catch (error) {
      console.error("localStorage kayıt hatası:", error);
    }

    return backendSuccess || localSuccess;
  }

  // Sadece localStorage'dan veri al (yardımcı fonksiyon)
  private static getQuestionsFromLocalStorage(chapter: string): Question[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(chapter));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("localStorage okuma hatası:", error);
      return [];
    }
  }

  // Bir bölümün tüm sorularını temizle
  static async clearChapter(chapter: string): Promise<boolean> {
    let backendSuccess = false;
    let localSuccess = false;

    try {
      // Backend'den sil
      if (await this.isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/questions/${chapter}`, {
          method: "DELETE",
        });
        backendSuccess = response.ok;
        if (backendSuccess) {
          console.log(`🗑️ ${chapter} bölümü sunucudan temizlendi`);
        }
      }
    } catch (error) {
      console.error("Backend temizleme hatası:", error);
    }

    try {
      // localStorage'dan sil
      localStorage.removeItem(this.getStorageKey(chapter));
      localSuccess = true;
      console.log(`🗑️ ${chapter} bölümü localStorage'dan temizlendi`);
    } catch (error) {
      console.error("localStorage temizleme hatası:", error);
    }

    return backendSuccess || localSuccess;
  }

  // Bir soruyu güncelle
  static async updateQuestion(question: Question): Promise<boolean> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch(
          `${API_BASE_URL}/questions/${question.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(question),
          }
        );

        if (response.ok) {
          console.log(`✏️ Soru güncellendi: ${question.id}`);
          return true;
        } else {
          console.error("Backend güncelleme hatası:", await response.text());
        }
      }
    } catch (error) {
      console.error("Soru güncelleme hatası:", error);
    }

    // Şimdilik false döndür - backend API'si eklenmeli
    console.warn("Soru güncelleme özelliği henüz backend'de mevcut değil");
    return false;
  }

  // Veriyi JSON formatında dışa aktar
  static async exportChapterData(
    chapter: string,
    subChapter?: string
  ): Promise<string> {
    const questions = await this.getQuestions(chapter, subChapter);
    return JSON.stringify(questions, null, 2);
  }

  // Tüm chapter'ları listele
  static async getAllStoredChapters(): Promise<
    { id: string; questionCount: number; source: string }[]
  > {
    const chapters: { id: string; questionCount: number; source: string }[] =
      [];

    try {
      // İlk önce backend'den al
      if (await this.isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/chapters`);
        if (response.ok) {
          const backendChapters = await response.json();
          return backendChapters.map((ch: any) => ({
            ...ch,
            source: "Sunucu",
          }));
        }
      }
    } catch (error) {
      console.error("Backend chapter listesi hatası:", error);
    }

    // Backend yoksa localStorage'dan al
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("istqb_chapter_")) {
        const chapter = key.replace("istqb_chapter_", "");
        const questions = this.getQuestionsFromLocalStorage(chapter);
        if (questions.length > 0) {
          chapters.push({
            id: chapter,
            questionCount: questions.length,
            source: "Tarayıcı",
          });
        }
      }
    }

    return chapters.sort((a, b) => a.id.localeCompare(b.id));
  }

  // Mevcut JSON dosyalarındaki verileri yükle
  static async importJsonData(chapter: string): Promise<void> {
    try {
      // Backend varsa ve zaten veri varsa, import etmeye gerek yok
      if (await this.isBackendAvailable()) {
        const serverQuestions = await fetch(
          `${API_BASE_URL}/questions/${chapter}`
        );
        if (serverQuestions.ok) {
          const questions = await serverQuestions.json();
          if (questions.length > 0) {
            console.log(
              `${chapter} bölümünde zaten ${questions.length} soru var (sunucu)`
            );
            return;
          }
        }
      }

      // localStorage kontrolü
      const existingQuestions = this.getQuestionsFromLocalStorage(chapter);
      if (existingQuestions.length > 0) {
        console.log(
          `${chapter} bölümünde zaten ${existingQuestions.length} soru var (localStorage)`
        );
        return;
      }

      // JSON dosyasından veri yükle
      const data = await import(`../data/istqb/${chapter}.json`);
      if (data.default && data.default.length > 0) {
        localStorage.setItem(
          this.getStorageKey(chapter),
          JSON.stringify(data.default)
        );
        console.log(
          `${chapter} bölümü için ${data.default.length} soru localStorage'a aktarıldı`
        );
      }
    } catch (error) {
      console.log(`${chapter} bölümü için mevcut veri bulunamadı`);
    }
  }

  // ========== USER STATISTICS METHODS ==========

  // Kullanıcının verdiği cevabı kaydet
  static async recordUserAnswer(
    userId: number,
    questionId: number,
    chapterId: string,
    subChapterId: string | null,
    selectedAnswer: string,
    isCorrect: boolean
  ): Promise<boolean> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/user-stats/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            questionId,
            chapterId,
            subChapterId,
            selectedAnswer,
            isCorrect,
          }),
        });

        if (response.ok) {
          console.log(
            `📊 User ${userId} cevabı kaydedildi: ${
              isCorrect ? "Doğru" : "Yanlış"
            }`
          );
          return true;
        }
      }

      // Backend yoksa localStorage'a kaydet (basit bir yedek sistem)
      const storageKey = `user_stats_${userId}`;
      let userStats = JSON.parse(localStorage.getItem(storageKey) || "[]");

      userStats.push({
        questionId,
        chapterId,
        subChapterId,
        selectedAnswer,
        isCorrect,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(storageKey, JSON.stringify(userStats));
      console.log(`💾 User ${userId} cevabı localStorage'a kaydedildi`);
      return true;
    } catch (error) {
      console.error("User answer recording error:", error);
      return false;
    }
  }

  // Kullanıcının istatistiklerini getir
  static async getUserStats(userId: number): Promise<any> {
    try {
      if (await this.isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/user-stats/${userId}`);
        if (response.ok) {
          const result = await response.json();
          console.log(`📊 User ${userId} istatistikleri sunucudan yüklendi`);
          return result.data;
        }
      }

      // Backend yoksa localStorage'dan al
      const storageKey = `user_stats_${userId}`;
      const userStats = JSON.parse(localStorage.getItem(storageKey) || "[]");

      // Basit istatistikler hesapla
      const totalAnswers = userStats.length;
      const correctAnswers = userStats.filter(
        (stat: any) => stat.isCorrect
      ).length;
      const wrongAnswers = totalAnswers - correctAnswers;

      return {
        totalStats: {
          total_questions_answered: totalAnswers,
          total_correct: correctAnswers,
          total_wrong: wrongAnswers,
          overall_success_rate:
            totalAnswers > 0
              ? Math.round((correctAnswers / totalAnswers) * 100)
              : 0,
        },
        chapterStats: [], // localStorage için basitleştirilmiş
      };
    } catch (error) {
      console.error("User stats fetch error:", error);
      return null;
    }
  }

  // Kullanıcının yanlış cevapladığı soruları getir
  static async getUserWrongAnswers(
    userId: number,
    chapterId: string,
    subChapterId?: string
  ): Promise<Question[]> {
    try {
      if (await this.isBackendAvailable()) {
        let apiUrl = `${API_BASE_URL}/user-stats/${userId}/wrong-answers/${chapterId}`;
        if (subChapterId) {
          apiUrl += `?subChapterId=${encodeURIComponent(subChapterId)}`;
        }

        const response = await fetch(apiUrl);
        if (response.ok) {
          const result = await response.json();
          console.log(
            `🔍 User ${userId} yanlış cevapları sunucudan yüklendi: ${result.data.length} soru`
          );
          return result.data;
        }
      }

      // Backend yoksa localStorage'dan basit bir filtreleme yap
      console.log(
        "⚠️ Backend mevcut değil, yanlış cevaplar için localStorage kullanılıyor"
      );
      return []; // localStorage için daha karmaşık implementasyon gerekir
    } catch (error) {
      console.error("Wrong answers fetch error:", error);
      return [];
    }
  }
}
