const fs = require("fs");
const path = require("path");

// Base directory for ISTQB Bölüm_6 JSON files
const jsonDir = path.join(__dirname, "..", "json", "istqb", "Bölüm_6");

// Mapping from current filename to new subChapter format
const fileMapping = {
  "questions_6_1_clean.json": "istqb_6_6-1",
  "questions_6_2_clean.json": "istqb_6_6-2",
};

async function updateBolum6JsonFiles() {
  console.log("Starting Bölüm_6 JSON files update...");

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

        // Update chapter to "istqb_6" to match the mapping
        jsonData.chapter = "istqb_6";

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
updateBolum6JsonFiles();
