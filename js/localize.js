const ENUMS = {
    MESSAGE: {
        INFO: "info",
        WARN: "warn",
        ERROR: "error"
    }
}


const tools = new Vue({
    el: "#tools",
    data: {
        delimiter: ";",
        filter: {current: "total", all: ["total", "missing", "duplicate"]},
        files: [],
        localizes: {
            total: {
                json: {},
                csv: ""
            },
            missing: {
                json: {},
                csv: ""
            },
            duplicate: {
                json: {},
                csv: ""
            }
        },
        messages: []
    },
    methods: {

        reset: function () {
            const tags = document.getElementsByTagName("a");
            for (const tag of tags) tag.hidden = true;
            this.files = [];
            this.messages = [];
            this.localizes = {
                total: {
                    json: {},
                    csv: ""
                },
                missing: {
                    json: {},
                    csv: ""
                },
                duplicate: {
                    json: {},
                    csv: ""
                }
            };
        },

        openFiles: function (event) {
            const files = event.target.files;

            if(files.length) this.reset();

            for (const file of files) {
                const reader = new FileReader();

                reader.addEventListener("load", (event) => {
                    const name = file.name;
                    const content = event.currentTarget.result;

                    tools.files.push({name, content});
                    if (tools.files.length === files.length) tools.onAllFileLoaded();

                }, false);

                reader.readAsText(file);
            }
        },

        onAllFileLoaded: function () {
            this.files.forEach(file => {
                try {
                    this.notify(ENUMS.MESSAGE.INFO, `--START-- open file ${file.name}`);
                    this.parseXML(file);
                    this.notify(ENUMS.MESSAGE.INFO, `--DONE-- open file ${file.name}`);
                } catch (e) {
                    this.notify(ENUMS.MESSAGE.ERROR, `--ERROR-- open file ${file.name}: ${e.message}`);
                }
            });
            this.prepareDownload();
        },

        parseXML: function (file) {
            const name = file.name;
            const names = this.files.map(f => f.name);
            const content = file.content;

            const tags = new DOMParser().parseFromString(content, "text/xml").getElementsByTagName("string");

            for (const tag of tags) {
                const key = tag.attributes.name.value;
                const value = tag.innerHTML.trim();

                if (!this.localizes.total.json[key]) {
                    this.localizes.total.json[key] = {}
                    for (const n of names) this.localizes.total.json[key][n] = "";
                }

                if (!this.localizes.total.json[key][name]) this.localizes.total.json[key][name] = value;
                else this.notify(ENUMS.MESSAGE.WARN, `--DUPLICATE-- ${key} is duplicate in ${name}`);
            }
        },

        prepareDownload: function () {
            const totalJson = JSON.parse(JSON.stringify(this.localizes.total.json));

            for (const key in totalJson) {
                const localizes = Object.values(totalJson[key]);

                if (localizes.includes("")) {
                    this.localizes.missing.json[key] = totalJson[key];
                } else if (new Set(localizes).size !== localizes.length) {
                    this.localizes.duplicate.json[key] = totalJson[key];
                }
            }

            const fileNames = this.files.map(f => f.name);
            this.localizes.total.csv = JsonToCSV(this.localizes.total.json, fileNames, this.delimiter);
            this.localizes.missing.csv = JsonToCSV(this.localizes.missing.json, fileNames, this.delimiter);
            this.localizes.duplicate.csv = JsonToCSV(this.localizes.duplicate.json, fileNames, this.delimiter);

            this.onFilterChange();
        },

        onFilterChange: function () {
            const fileName = `localize_${this.filter.current}`;
            const json = this.localizes[this.filter.current].json;
            const csv = this.localizes[this.filter.current].csv;

            if(!json || !csv) return;

            saveAsJsonFile(json, fileName)
            saveAsCSVFile(csv, fileName)

            data.notifyDataChange(this.files.map(f => f.name), json)
        },

        notify: function (type, content) {
            this.messages.push({
                type: type,
                content: content
            });
        }
    }
});

const data = new Vue({
    el: "#data",
    data: {
        columns: [],
        rows: {}
    },
    methods: {
        reset: function () {
            this.columns = [];
            this.rows = {}
        },
        notifyDataChange(columns, rows) {
            this.columns = columns;
            this.rows = rows;
        }
    }
});

const JsonToCSV = function (json, headers, delimiter) {
    let csv = `key${delimiter}${headers.join(delimiter)}`;

    for (const key in json) {
        csv += [`\r\n${key}`, ...headers.map(header => json[key][header])].join(delimiter)
    }
    return csv;
};

const saveAsJsonFile = function (json, filename) {
    const jsonA = document.getElementById("download_json");
    jsonA.href = window.URL.createObjectURL(new Blob([JSON.stringify(json)], {type: 'application/json'}));
    jsonA.download = `${filename}.json`;
    jsonA.innerHTML = `${filename}.json`;
    jsonA.hidden = false;

};

const saveAsCSVFile = function (csv, filename) {
    const csvA = document.getElementById("download_csv");
    csvA.href = window.URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    csvA.download = `${filename}.csv`;
    csvA.innerHTML = `${filename}.csv`;
    csvA.hidden = false;
};