const delimeter = ";";
const localizesByKeys = {};
const fileNames = [];
let localziesCSV = '';

function openFiles() {
    const atags = document.getElementsByTagName('a');
    for (const a of atags) a.hidden = true;

    const files = document.querySelector('input[type=file]').files;

    for (const file of files) fileNames.push(file.name);

    let countFiles = 0;
    for (const file of files) {
        const reader = new FileReader();
        reader.addEventListener("load", (content) => {
            parseXMLs(file.name, content.currentTarget.result, fileNames)
            console.log(`-- DONE -- READ FILE: ${file.name}`);

            if (++countFiles == files.length) onLoadDone()
        }, false);

        console.log(`-- START -- READ FILE: ${file.name}`);
        reader.readAsText(file);
    }
}

function parseXMLs(curCountry, content, countries) {
    try {
        const tags = new DOMParser().parseFromString(content, "text/xml").getElementsByTagName("string");
        for (const tag of tags) {
            const key = tag.attributes.name.value;
            const value = tag.innerHTML.trim();

            if (!localizesByKeys[key]) {
                localizesByKeys[key] = {}
                for (const country of countries) localizesByKeys[key][country] = "";
            }

            if (!localizesByKeys[key][curCountry]) localizesByKeys[key][curCountry] = value;
            else console.warn(`--WARNING-- ${key} is already exist!`);
        }
    } catch (error) {
        alert(error.)
    }

}

function onLoadDone() {
    convertToCSV(fileNames);
    saveAsJsonFile(localizesByKeys, 'localizesByKeys');
    saveAsCSVFile(localziesCSV, 'localizesCSV')
}

function convertToCSV(countries) {
    localziesCSV = `key${delimeter}`;
    for (const country of countries) localziesCSV += `${country}${delimeter}`

    for (const tag in localizesByKeys) {
        localziesCSV += `\r\n${tag}${delimeter}`
        for (const country of countries) {
            const value = localizesByKeys[tag][country];
            localziesCSV += `${value}${delimeter}`
        }
    }

}

function saveAsJsonFile(json, filename) {
    const jsonA = document.getElementById("download_json");
    jsonA.href = window.URL.createObjectURL(new Blob([JSON.stringify(json)], { type: 'application/json' }));
    jsonA.download = `${filename}.json`;
    jsonA.hidden = false;
}

function saveAsCSVFile(csv, filename) {
    const jsonA = document.getElementById("download_csv");
    jsonA.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    jsonA.download = `${filename}.csv`;
    jsonA.hidden = false;
}