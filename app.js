require("dotenv").config();
import "./style.css";
import "./node_modules/bulma-pageloader/dist/css/bulma-pageloader.min.css";
import Covid from "./Covid";

const pageload = document.querySelector("#process");
const title = document.querySelector("#aktuell");

let cov = new Covid(process.env.URL);

var ctx = document.getElementById("myChart").getContext("2d");
let _labels = [];
let _data = [];
let _color = [];
let _last_update = "";
let covData = cov.getData().then((i) => {
  _last_update = " Aktualisierung: " + i.features[0].attributes.last_update;
  i.features.forEach((item) => {
    console.log(i);
    if (item.attributes.BL_ID !== "5") return;
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
