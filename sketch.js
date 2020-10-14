let image = {}, label = {}, percentage = {};

const HISTORY_SIZE = 10;

let classifier;

function preload() {
    classifier = ml5.imageClassifier("path/to/model/model.json", () => console.log("Model Loaded!!!"))
}

function setup() {
    noCanvas();

    let table = document.getElementById("results");

    image.div = document.getElementById("img");
    image.src = [];

    label.data = [];
    label.divs = table.querySelectorAll(".label");

    percentage.data = [];
    percentage.divs = table.querySelectorAll(".percentage");

    createFileInput((file) => {
        let tempLabel = [], tempPercentage = [];
        image.src.unshift(file.data);
        image.div.src = file.data;

        classifier.classify(image.div, (err, results) => {
            if (err) {
                image.src = image.src.splice(1);
                if (image.src.length === 0) image.div.src = "";
                alert("Error in processing file, try again");
            } else {
                for (let i = 0; i < 3 && i < results.length; i++) {
                    tempLabel.push(results[i].label);
                    tempPercentage.push(results[i].confidence);
                }
                label.data.unshift(tempLabel);
                percentage.data.unshift(tempPercentage);
                console.log(results);

                if (label.data.length > HISTORY_SIZE) {
                    label.data.pop();
                    percentage.data.pop();
                    image.src.pop();
                }
                createRow(tempLabel, tempPercentage);
            }
            update(0);
        });

    });
}

const update = (index) => {
    if (index >= image.src.length || image.src.length === 0) return;
    for (let i = 0; i < 3; i++) {
        label.divs[i].innerText = label.data[index][i];
        percentage.divs[i].innerText = (percentage.data[index][i] * 100).toFixed(2) + "%";
    }
    image.div.src = image.src[index];
};

const createRow = (labels, percentages) => {
    let table = document.getElementById("history"),
        row = table.insertRow(2),
        index = row.insertCell(),
        label = row.insertCell(),
        percentage = row.insertCell();

    row.className = "historyRow";
    row.onclick = handleHistoryClick;
    index.innerText = "1";
    label.innerText = labels[0];
    percentage.innerText = (percentages[0] * 100).toFixed(2) + "%";

    for (let i = 3; i < table.rows.length; i++) {
        table.rows[i].cells[0].innerText = parseInt(table.rows[i].cells[0].innerText) + 1;
    }

    if (table.rows.length > HISTORY_SIZE + 2) table.deleteRow(HISTORY_SIZE + 2);
};

const handleHistoryClick = (e) => {
    let row = e.target.parentElement;
    update(row.cells[0].innerText - 1);
};