let image = {}, label = {}, percentage = {}, dogConf = {};

const HISTORY_SIZE = 10,
    THRESHOLD = 0.8;

const ERRORS = {
    PROCESSING: "PROCESSING",
    DOG: "DOG"
};

let dogClassifier, breedClassifier;

function preload() {
    dogClassifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/p5IBg2RjL/model.json", () => console.log("First model loaded!"));
    breedClassifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/VsSp5SiTK/model.json", () => console.log("Second model loaded!"));
}

function setup() {
    noCanvas();

    let table = document.getElementById("results");

    image.src = [];
    image.div = document.getElementById("img");

    label.data = [];
    label.divs = table.querySelectorAll(".label");

    percentage.data = [];
    percentage.divs = table.querySelectorAll(".percentage");

    dogConf.data = [];
    dogConf.div = document.querySelector(".dogConf");

    createFileInput(async (file) => {
        let tempLabel = [], tempPercentage = [], tempDogConfidence, error = false;
        image.src.unshift(file.data);
        image.div.src = file.data;

        await dogClassifier.classify(image.div, async (err, results) => {
            if (err) {
                error = ERRORS.PROCESSING;
                image.src = image.src.splice(1);
                if (image.src.length === 0) image.div.src = "";
            } else {
                tempDogConfidence = results.find(result => result.label === "Dog").confidence;
                if (tempDogConfidence < THRESHOLD) {
                    label.data.unshift("");
                    percentage.data.unshift("")
                    error = ERRORS.DOG;
                }
                dogConf.data.unshift(tempDogConfidence);
                console.log(error);
            }
        });
        console.log(error);
        if (!error) {
            await breedClassifier.classify(image.div, (err, results) => {
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
            });
        }

        if (error === ERRORS.PROCESSING) {
            alert("Error in processing file, please try again");
        } else {
            updateBreedResults(0);
            createHistoryRow(tempLabel, tempPercentage, tempDogConfidence, error);
        }
    });
}

const updateBreedResults = (index) => {
    if (index >= image.src.length || image.src.length === 0) return;
    dogConf.div.innerText = (dogConf.data[index] * 100).toFixed(2) + "%";
    if (label.data.length > 0 && label.data[index]) {
        for (let i = 0; i < 3 && i < label.data[index].length; i++) {
            label.divs[i].innerText = label.data[index][i];
            percentage.divs[i].innerText = (percentage.data[index][i] * 100).toFixed(2) + "%";
        }
    } else {
        for (let div of percentage.divs) {
            div.innerText = "";
        }
        for (let div of label.divs) {
            div.innerText = "";
        }
    }
    image.div.src = image.src[index];
};

const createHistoryRow = (labels, percentages, dogConf, error) => {
    let table = document.getElementById("history"),
        row = table.insertRow(2),
        number = row.insertCell(),
        dogConfidence = row.insertCell(),
        prediction = row.insertCell(),
        confidence = row.insertCell();

    row.className = "historyRow";
    row.onclick = handleHistoryClick;
    number.innerText = "1";
    dogConfidence.innerText = (dogConf * 100).toFixed(2) + "%";
    if (!error) {
        prediction.innerText = labels[0];
        confidence.innerText = (percentages[0] * 100).toFixed(2) + "%";
    }

    for (let i = 3; i < table.rows.length; i++) {
        table.rows[i].cells[0].innerText = parseInt(table.rows[i].cells[0].innerText) + 1;
    }

    if (table.rows.length > HISTORY_SIZE + 2) table.deleteRow(HISTORY_SIZE + 2);
};

const handleHistoryClick = (e) => {
    let row = e.target.parentElement;
    updateBreedResults(row.cells[0].innerText - 1);
};