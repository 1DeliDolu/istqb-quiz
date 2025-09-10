const fs = require("fs");
const path = require("path");

// Base directory for ISTQB Bölüm_3 JSON files
const jsonDir = path.join(__dirname, "..", "json", "istqb", "Bölüm_3");

// Mapping from current filename to new subChapter format
const fileMapping = {
  "questions_3_1_1_clean.json": "istqb_3_3-1-1",
  "questions_3_1_2_clean.json": "istqb_3_3-1-2",
  "questions_3_1_3_clean.json": "istqb_3_3-1-3",
  "questions_3_1_clean.json": "istqb_3_3-1",
  "questions_3_2_1_clean.json": "istqb_3_3-2-1",
  "questions_3_2_2_clean.json": "istqb_3_3-2-2",
  "questions_3_2_3_clean.json": "istqb_3_3-2-3",
  "questions_3_2_4_clean.json": "istqb_3_3-2-4",
  "questions_3_2_5_clean.json": "istqb_3_3-2-5",
};

async function updateBolum3JsonFiles() {
  console.log("Starting Bölüm_3 JSON files update...");

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

        // Update chapter to "istqb_3" to match the mapping
        jsonData.chapter = "istqb_3";

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
updateBolum3JsonFiles();
