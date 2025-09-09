const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "istqb_quiz_app",
  port: 3306,
});

// Veritabanına bağlan
db.connect((err) => {
  if (err) {
    console.error("❌ Veritabanı bağlantı hatası:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL'e bağlandı!");

  checkSubChapters();
});

function checkSubChapters() {
  console.log("\n📋 Sub_chapters tablosu kontrol ediliyor...");

  // Sub_chapters yapısını kontrol et
  db.query("DESCRIBE sub_chapters", (err, result) => {
    if (err) {
      console.error("❌ Tablo yapısı hatası:", err.message);
      return;
    }

    console.log("\n🏗️ Sub_chapters tablo yapısı:");
    result.forEach((column) => {
      console.log(
        `   ${column.Field}: ${column.Type} ${
          column.Null === "YES" ? "NULL" : "NOT NULL"
        } ${column.Key ? "(" + column.Key + ")" : ""}`
      );
    });
  });

  // Mevcut sub_chapters'ları listele
  db.query(
    "SELECT * FROM sub_chapters ORDER BY chapter_id, id",
    (err, result) => {
      if (err) {
        console.error("❌ Sub_chapters okuma hatası:", err.message);
        return;
      }

      console.log("\n📊 Mevcut sub_chapters:");
      if (result.length === 0) {
        console.log("   ⚠️ Hiç sub_chapter kaydı bulunamadı!");
      } else {
        result.forEach((row) => {
          console.log(
            `   Chapter ${row.chapter_id}, ID: ${row.id}: ${
              row.title || "No title"
            }`
          );
        });
      }

      // Chapters tablosunu da kontrol et
      db.query("SELECT * FROM chapters ORDER BY id", (err, chaptersResult) => {
        if (err) {
          console.error("❌ Chapters okuma hatası:", err.message);
          return;
        }

        console.log("\n📊 Mevcut chapters:");
        if (chaptersResult.length === 0) {
          console.log("   ⚠️ Hiç chapter kaydı bulunamadı!");
        } else {
          chaptersResult.forEach((row) => {
            console.log(`   Chapter ${row.id}: ${row.title || "No title"}`);
          });
        }

        // Questions tablosunun yapısını da kontrol et
        db.query("DESCRIBE questions", (err, questionsStructure) => {
          if (err) {
            console.error("❌ Questions tablo yapısı hatası:", err.message);
            return;
          }

          console.log("\n🏗️ Questions tablo yapısı:");
          questionsStructure.forEach((column) => {
            console.log(
              `   ${column.Field}: ${column.Type} ${
                column.Null === "YES" ? "NULL" : "NOT NULL"
              } ${column.Key ? "(" + column.Key + ")" : ""}`
            );
          });

          // Şimdi eksik sub_chapters'ları tespit et
          checkMissingSubChapters();
        });
      });
    }
  );
}

function checkMissingSubChapters() {
  // JSON dosyalarından hangi sub_chapters'ların gerekli olduğunu tespit et
  const fs = require("fs");
  const path = require("path");

  const jsonDir = path.join(__dirname, "../json/istqb/Bölüm_1");

  console.log(
    "\n🔍 JSON dosyalarından gerekli sub_chapters tespit ediliyor..."
  );

  if (!fs.existsSync(jsonDir)) {
    console.log("❌ JSON dizini bulunamadı:", jsonDir);
    db.end();
    return;
  }

  const files = fs.readdirSync(jsonDir);
  const requiredSubChapters = new Set();

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const match = file.match(/questions_(\d+)_(\d+)(?:_(\d+))?/);
      if (match) {
        const chapter = parseInt(match[1]);
        const subChapter = match[3] ? `${match[2]}-${match[3]}` : match[2];
        requiredSubChapters.add(`${chapter}.${subChapter}`);
        console.log(
          `   📄 ${file} → Chapter ${chapter}, SubChapter ${subChapter}`
        );
      }
    }
  });

  console.log("\n📋 Gerekli sub_chapters:");
  requiredSubChapters.forEach((sc) => {
    console.log(`   ${sc}`);
  });

  // Mevcut sub_chapters'ları kontrol et ve eksikleri tespit et
  db.query(
    "SELECT CONCAT(chapter_id, '.', sub_chapter_id) as full_id FROM sub_chapters",
    (err, existingResult) => {
      if (err) {
        console.error("❌ Mevcut sub_chapters kontrol hatası:", err.message);
        db.end();
        return;
      }

      const existingSubChapters = new Set(
        existingResult.map((row) => row.full_id)
      );
      const missingSubChapters = [];

      requiredSubChapters.forEach((sc) => {
        if (!existingSubChapters.has(sc)) {
          missingSubChapters.push(sc);
        }
      });

      console.log("\n❌ Eksik sub_chapters:");
      if (missingSubChapters.length === 0) {
        console.log("   ✅ Tüm gerekli sub_chapters mevcut!");
      } else {
        missingSubChapters.forEach((sc) => {
          console.log(`   ${sc}`);
        });

        console.log(
          "\n🛠️ Eksik sub_chapters'ları eklemek için fix_sub_chapters.cjs çalıştırın."
        );
      }

      db.end();
      console.log("\n✅ Kontrol tamamlandı!");
    }
  );
}
