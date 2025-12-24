const fs = require("fs");
const { parse } = require("csv-parse/sync");

const dropletRanges = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];

const loadJson = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"));
const saveJson = (data, filename) => fs.writeFileSync(filename, JSON.stringify(data, null, 4), "utf8");

const loadCsv = (filename) => {
    const content = fs.readFileSync(filename, "utf8");
    return parse(content, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
};

const buildDropletSizes = (row) => {
    const sizes = [];
    for (let i = 0; i < dropletRanges.length - 1; i++) {
        const from = dropletRanges[i];
        const to = dropletRanges[i + 1];
        const label = row[from.toString()];
        if (label && label.trim() !== "-") {
            sizes.push({ from, to, label: label.trim() });
        }
    }
    return sizes;
};

const updateJson = (jsonData, csvRows) => {
    for (const row of csvRows) {
        const level0 = parseInt(row["level_0"]);
        const level1 = parseInt(row["level_1"]);

        const target = jsonData?.[level0]?.childs?.[level1];
        if (!target) {
            console.warn(`Skipping row: can't find path json[${level0}].childs[${level1}]`);
            continue;
        }

        if (!target.childs) target.childs = [];

        const id = row["id"];
        let match = target.childs.find((item) => item.id === id);

        if (!match) {
            match = {
                id,
                name: row["name"],
                long_name: `${target.long_name} ${row["long_name"]}`,
                img: row["img"],
                b: 0,
                c: target.c,
            };
            target.childs.push(match);
        }

        match.droplet_sizes = buildDropletSizes(row);
    }
    return jsonData;
};

// === Entry point with CLI support ===
const args = process.argv.slice(2);
if (args.length < 3) {
    console.error("Usage: node nozzle_merge.js input.json input.csv output.json");
    process.exit(1);
}

const [inputJson, inputCsv, outputJson] = args;
const jsonData = loadJson(inputJson);
const csvRows = loadCsv(inputCsv);
const updatedJson = updateJson(jsonData, csvRows);
saveJson(updatedJson, outputJson);

console.log(`✅ Updated JSON written to ${outputJson}`);
