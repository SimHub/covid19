import Covid from "./Covid.js";

const pageload = document.querySelector("#progress");
const title = document.querySelector("#aktuell");
const selectBL = document.querySelector("#selectBL");
const URL =
  "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=GEN,last_update,OBJECTID,BL_ID,BL,cases7_per_100k&returnGeometry=false&outSR=4326&f=json";

const _decimation = {
  enabled: false,
  algorithm: "min-max",
};
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

let mychart;
let cov = new Covid(URL);

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
  let id = e.target.value;
  if (id !== "null") covid19Chart(id);
});

function init() {
  pageload.classList.add("is-active");
  cov.getData().then((i) => {
    chartSet.add(i);
    i.features.forEach((item) => {
      // console.log(item);
      let bl = item.attributes.BL;
      let bl_id = item.attributes.BL_ID;
      chartSetBlNames.add(bl);
    });
    chartSetBlNames.forEach((bl) => {
      let op = document.createElement("option");
      // console.log(bl);
      op.innerText = bl;
      op.value = blHsh[bl];
      selectBL.appendChild(op);
    });
    pageload.classList.remove("is-active");
  });
}

function covid19Chart(id) {
  _labels = [];
  _data = [];
  _color = [];
  _last_update = "";

  if (mychart !== undefined) {
    mychart.destroy();
  }
  chartSet.forEach((i) => {
    _last_update = " Aktualisierung: " + i.features[0].attributes.last_update;
    i.features.forEach((item) => {
      // console.log(i);
      if (item.attributes.BL_ID !== id) return;
      if (item.attributes.cases7_per_100k > 100) {
        _color.push("rgb(255, 99, 132)");
      } else {
        _color.push("rgb(60, 179, 113)");
      }
      _data.push(item.attributes.cases7_per_100k.toFixed(1));
      _labels.push(item.attributes.GEN);
    });
    title.innerText = _last_update;
    mychart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: _labels,
        datasets: [
          {
            label: "",
            backgroundColor: _color,
            borderColor: "rgb(255, 99, 132)",
            data: _data,
          },
        ],
      },
      options: {
        plugins: {
          decimation: _decimation,
        },
      },
    });
  }); // end fetch
}

function removeElement(el) {
  var elem = document.querySelector(el);
  elem.parentNode.removeChild(elem);
  return false;
}
