const fs = require("fs");
const path = require("path");

// Base directory for ISTQB Bölüm_5 JSON files
const jsonDir = path.join(__dirname, "..", "json", "istqb", "Bölüm_5");

// Mapping from current filename to new subChapter format
const fileMapping = {
  "questions_5_1_1_clean.json": "istqb_5_5-1-1",
  "questions_5_1_2_clean.json": "istqb_5_5-1-2",
  "questions_5_1_3_clean.json": "istqb_5_5-1-3",
  "questions_5_1_4_clean.json": "istqb_5_5-1-4",
  "questions_5_1_5_clean.json": "istqb_5_5-1-5",
  "questions_5_1_6_clean.json": "istqb_5_5-1-6",
  "questions_5_1_7_clean.json": "istqb_5_5-1-7",
  "questions_5_2_1_clean.json": "istqb_5_5-2-1",
  "questions_5_2_2_clean.json": "istqb_5_5-2-2",
  "questions_5_2_3_clean.json": "istqb_5_5-2-3",
  "questions_5_2_4_clean.json": "istqb_5_5-2-4",
  "questions_5_2_clean.json": "istqb_5_5-2",
  "questions_5_3_1_clean.json": "istqb_5_5-3-1",
  "questions_5_3_2_clean.json": "istqb_5_5-3-2",
  "questions_5_3_3_clean.json": "istqb_5_5-3-3",
  "questions_5_3_clean.json": "istqb_5_5-3",
  "questions_5_4_clean.json": "istqb_5_5-4",
  "questions_5_5_clean.json": "istqb_5_5-5",
};

async function updateBolum5JsonFiles() {
  console.log("Starting Bölüm_5 JSON files update...");

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

        // Update chapter to "istqb_5" to match the mapping
        jsonData.chapter = "istqb_5";

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
updateBolum5JsonFiles();
