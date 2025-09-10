const fs = require("fs");
const path = require("path");

// Base directory for ISTQB Bölüm_1 JSON files
const jsonDir = path.join(__dirname, "..", "json", "istqb", "Bölüm_1");

// Mapping from current filename to new subChapter format
const fileMapping = {
  "questions_1_1_1_clean.json": "istqb_1_1-1-1",
  "questions_1_1_2_clean.json": "istqb_1_1-1-2",
  "questions_1_1_clean.json": "istqb_1_1-1",
  "questions_1_2_1_clean.json": "istqb_1_1-2-1",
  "questions_1_2_2_clean.json": "istqb_1_1-2-2",
  "questions_1_2_3_clean.json": "istqb_1_1-2-3",
  "questions_1_2_clean.json": "istqb_1_1-2",
  "questions_1_3_clean.json": "istqb_1_1-3",
  "questions_1_4_1_clean.json": "istqb_1_1-4-1",
  "questions_1_4_2_clean.json": "istqb_1_1-4-2",
  "questions_1_4_3_clean.json": "istqb_1_1-4-3",
  "questions_1_4_4_clean.json": "istqb_1_1-4-4",
  "questions_1_4_5_clean.json": "istqb_1_1-4-5",
  "questions_1_4_clean.json": "istqb_1_1-4",
  "questions_1_5_1_clean.json": "istqb_1_1-5-1",
  "questions_1_5_2_clean.json": "istqb_1_1-5-2",
  "questions_1_5_3_clean.json": "istqb_1_1-5-3",
  "questions_1_5_clean.json": "istqb_1_1-5",
};

async function updateBolum1JsonFiles() {
  console.log("Starting Bölüm_1 JSON files update...");

  try {
    // Get all JSON files in the directory
    const files = fs
      .readdirSync(jsonDir)
      .filter((file) => file.endsWith(".json"));
    console.log(`Found ${files.length} JSON files to process`);

    let updatedCount = 0;

    for (const filename of files) {
      const filePath = path.join(jsonDir, filename);

      if (!fileMapping[filename]) {
        console.log(`Warning: No mapping found for ${filename}, skipping...`);
        continue;
      }

      try {
        // Read the JSON file
        const content = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(content);

        // Update the subChapter field
        const newSubChapter = fileMapping[filename];
        const oldSubChapter = jsonData.subChapter;

        jsonData.subChapter = newSubChapter;

        // Update chapter to "istqb_1" to match the mapping
        jsonData.chapter = "istqb_1";

        // Write the updated JSON back to file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));

        console.log(
          `✓ Updated ${filename}: ${oldSubChapter} → ${newSubChapter}`
        );
        updatedCount++;
      } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
      }
    }

    console.log(`\nUpdate completed! Updated ${updatedCount} files.`);
  } catch (error) {
    console.error("Error during update process:", error);
  }
}

// Run the update
updateBolum1JsonFiles();
