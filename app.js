require("dotenv").config();
import "./style.css";
import "./node_modules/bulma-pageloader/dist/css/bulma-pageloader.min.css";
import Covid from "./Covid";

const pageload = document.querySelector("#progress");
const title = document.querySelector("#aktuell");
const selectBL = document.querySelector("#selectBL");

const blHsh = {
  "Schleswig-Holstein": 1,
  Hamburg: 2,
  Niedersachsen: 3,
  Bremen: 4,
  "Nordrhein-Westfalen": 5,
  Hessen: 6,
  "Rheinland-Pfalz": 7,
  "Baden-Württemberg": 8,
  Bayern: 9,
  Saarland: 10,
  Brandenburg: 12,
  "Mecklenburg-Vorpommern": 13,
  Sachsen: 14,
  "Sachsen-Anhalt": 15,
  Thüringen: 16,
  Berlin: 11,
};

let cov = new Covid(process.env.URL);

var ctx = document.getElementById("myChart").getContext("2d");
let _labels = [];
let _data = [];
let _color = [];
let _last_update = "";
let chartMap = new Map();
let chartSet = new Set();
let chartSetBlNames = new Set();
let chartSetBlId = new Set();
let arrBlIds = [];

init();

selectBL.addEventListener("change", (e) => {
  let val = e.target.value;
  console.log(val);
  // if (val !== "null") covid19Chart(val);
  // return;
});

function init() {
  cov.getData().then((i) => {
    i.features.forEach((item) => {
      // console.log(item);
      let bl = item.attributes.BL;
      let bl_id = item.attributes.BL_ID;
      chartSet.add(item);
      chartSetBlNames.add(bl);
    });
    chartSetBlNames.forEach((bl) => {
      let op = document.createElement("option");
      // console.log(bl);
      op.innerText = bl;
      op.value = blHsh[bl];
      selectBL.appendChild(op);
    });
  });
}

function covid19Chart(id) {
  pageload.classList.add("is-active");
  cov.getData().then((i) => {
    _last_update = " Aktualisierung: " + i.features[0].attributes.last_update;
    i.features.forEach((item) => {
      console.log(i);
      if (item.attributes.BL_ID !== id) return;
      if (item.attributes.cases7_per_100k > 100) {
        _color.push("rgb(255, 99, 132)");
      } else {
        _color.push("rgb(60, 179, 113)");
      }
      _data.push(item.attributes.cases7_per_100k.toFixed(1));
      _labels.push(item.attributes.GEN);
    });
    pageload.classList.remove("is-active");

    console.log([title]);
    title.innerText = _last_update;

    var chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: _labels,
        datasets: [
          {
            // label: ["Fälle letzte 7 Tage/100.000 EW - NRW ", _last_update],
            label: "",
            backgroundColor: _color,
            borderColor: "rgb(255, 99, 132)",
            data: _data,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            enabled: true,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";
                return label;
              },
            },
          },
        },
      },
    });
  });
}
