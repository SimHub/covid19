// import { resetZoom } from "chartjs-plugin-zoom";
import Covid from "./Covid.js";

const scaleOpts = {
  reverse: true,
  ticks: {
    callback: (val, index, ticks) =>
      index === 0 || index === ticks.length - 1 ? null : val,
  },
  grid: {
    borderColor: "#00FF00",
    color: "rgba( 0, 0, 0, 0.1)",
  },
  title: {
    display: true,
    text: (ctx) => ctx.scale.axis + " axis",
  },
};
const scales = {
  x: {
    position: "top",
  },
  y: {
    position: "right",
  },
};
Object.keys(scales).forEach((scale) => Object.assign(scales[scale], scaleOpts));
// </block:scales>

// <block:zoom:0>
const zoomOptions = {
  limits: {
    // x: { min: -200, max: 200, minRange: 50 },
    // y: { min: -200, max: 200, minRange: 50 },
  },
  pan: {
    enabled: true,
    mode: "xy",
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: "xy",
    onZoomComplete({ chart }) {
      // This update is needed to display up to date zoom level in the title.
      // Without this, previous zoom level is displayed.
      // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
      chart.update("none");
    },
  },
};
////////////
const blTitle = document.querySelector(".bl-title");
const nativeMainBox = document.querySelector(".native-main");
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
  const btn = document.createElement("button");
  btn.id = "reset";
  btn.classList.add("posAbsolute");
  btn.innerText = "Reset";
  let id = e.target.value;
  nativeMainBox.classList.add("posAbsolute");
  nativeMainBox.appendChild(btn);
  blTitle.classList.add("hide");
  if (id !== "null") covid19Chart(id);

  btn.addEventListener("click", resetZoomChart);
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

  if (window.bar !== undefined) {
    window.bar.destroy();
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
    window.bar = new Chart(ctx, {
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
        // scales: scales,
        plugins: {
          zoom: zoomOptions,
          // title: {
          // display: true,
          // position: "bottom",
          // },
          decimation: _decimation,
          id: "custom_canvas_background_color",
          beforeDraw: (chart) => {
            const _ctx = chart.canvas.getContext("2d");
            _ctx.save();
            _ctx.globalCompositeOperation = "destination-over";
            _ctx.fillStyle = "black";
            _ctx.fillRect(0, 0, chart.width, chart.height);
            _ctx.restore();
          },
        },
      },
    }); // End Chart
  }); // End Fetch
}

function removeElement(el) {
  var elem = document.querySelector(el);
  elem.parentNode.removeChild(elem);
  return false;
}
function resetZoomChart() {
  window.bar.resetZoom();
}
