const fs = require("fs");

const files = [
  "artist-americas.json",
  "artist-europe.json",
  "artist-asia.json",
  "artist-mea.json"
];

let merged = [];

for (const file of files) {

  if (fs.existsSync(file)) {

    try {

      const data = JSON.parse(
        fs.readFileSync(file, "utf8")
      );

      if (Array.isArray(data)) {
        merged.push(...data);
      }

    }

    catch (err) {

      console.log(
        `Failed ${file} 😭`
      );

    }

  }

}

merged.sort((a, b) => {

  if (a.country < b.country) return -1;
  if (a.country > b.country) return 1;
  return 0;

});

fs.writeFileSync(
  "artist.json",
  JSON.stringify(merged, null, 2)
);

console.log(
  "artist.json updated 😍"
);
