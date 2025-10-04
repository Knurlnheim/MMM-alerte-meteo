'use strict';

Module.register("MMM-alerte-meteo", {
  defaults: {
    title: 'Alertes Météo',
    baseUrl: 'https://public-api.meteofrance.fr',
    apiPath: '/public/DPVigilance/v1/textesvigilance/encours',
    apikey: '',
    updateInterval: 30 * 60 * 1000,
    dptsList: ['59']
  },

  start: function () {
    this.getData();
    this.scheduleUpdate();
    this.vigilances = [];
  },

  getStyles: function () {
    return ["alertstyle.css"];
  },

  risques: [
    'Aucun',
    'Vent',
    'Pluie',
    'Orages',
    'Crues',
    'Neige / Verglas',
    'Canicule',
    'Grand Froid',
    'Avalanches',
    'Vagues-Submersion'
  ],

  risquesIcons: [
    'None',
    'wi-strong-wind',
    'wi-rain',
    'wi-thunderstorm',
    'wi-flood',
    'wi-snow',
    'wi-hot',
    'wi-snowflake-cold',
    'Avalanches',
    'wi-tsunami'
  ],

  colorClass: [
    "none",
    "vigigreen",
    "vigiyellow",
    "vigiorange",
    "vigired"
  ],



  getDom: function () {
    var wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    var table = document.createElement("table");
    table.className = "medium";

    for (var i in this.vigilances) {
      // Log.info(this.vigilances[i].bloc_items.find(x => x.id === "DEP_SITUATION" ));
      // Log.info(this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI" ));
      // Log.info(this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION" ));    
      // Log.info(this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION_ZONAL" ));    


      if (this.vigilances[i].bloc_items.length != 0 && (
        typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SITUATION") !== 'undefined'
        || typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI") !== 'undefined'
        || typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION") !== 'undefined'
        || typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION_ZONAL") !== 'undefined'
      )) {
        //if (this.vigilances[i].bloc_items.length > 0) {
        let dept_id = this.vigilances[i].domain_id
        let dept_name = this.vigilances[i].domain_name
        // Log.info("dept_id="+dept_id+" | dept_name="+dept_name);    
        if (typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI") !== 'undefined') {
          var Qualif = this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI");
        } else if (typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION") !== 'undefined') {
          var Qualif = this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION");
        } else if (typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SITUATION") !== 'undefined') {
          var Qualif = this.vigilances[i].bloc_items.find(x => x.id === "DEP_SITUATION");
        } else if (typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION_ZONAL") !== 'undefined') {
          var Qualif = this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION_ZONAL");
        };
        // Log.info(Qualif);
        let hazard_code = Qualif.text_items[0].hazard_code
        // Log.info("hazard_code :" + hazard_code);
        // let color = Qualif.text_items[0].term_items[0].risk_code
        // Log.info("end_time="+Qualif.text_items[0].term_items[0].end_time)
        var rows = 0;
        if (Date.parse(Qualif.text_items[0].term_items[0].end_time) > Date.now()) {
          var color = this.colorClass[Qualif.text_items[0].term_items[0].risk_code];

          var row = document.createElement("tr");
          table.appendChild(row);

          var cell = document.createElement("td");
          var risqueIdx = parseInt(hazard_code);
          //Log.info("risqueIdx :" + risqueIdx);
          cell.innerHTML = dept_name + " (" + dept_id + ")";
          cell.className = "dept " + color;
          row.appendChild(cell);

          var iconCell = document.createElement("td");
          iconCell.className = color + " weather-icon";
          row.appendChild(iconCell);

          var icon = document.createElement("span");
          icon.className = "wi weathericon " + this.risquesIcons[risqueIdx];
          iconCell.appendChild(icon);
          rows = rows + 1;
        }
      }
      // Log.info("rows="+rows);
      if (rows == 0) {
        // Log.info("Will hide")
        this.hide(1000, function () {
          //Module hidden
        });
      }
    }

    wrapper.appendChild(table)
    return wrapper;
  },



  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setInterval(function () {
      self.getData();
    }, nextLoad);
  },

  getData: function () {
    var myconf = {};
    myconf.baseUrl = this.config.baseUrl;
    myconf.apiPath = this.config.apiPath;
    myconf.apikey = this.config.apikey;
    myconf.dptsList = this.config.dptsList;
    // Log.info(myconf) ;
    this.sendSocketNotification('GET_VIGILANCE', myconf);
    //    this.sendSocketNotification('GET_VIGILANCE', this.config.departements);
    this.loaded = false;
  },

  socketNotificationReceived: function (notification, payload) {
    //    Log.info("received :"+ notification);
    //    Log.info("received :"+ payload);
    this.loaded = true;
    if (notification === "DATA_VIGILANCE") {
      // Log.info("received :"+ payload);
      this.vigilances = payload;
      //      this.loaded = true;
      var fade = 500;
      var has_alert = false;
      //this.updateDom(fade);
      for (var i in this.vigilances) {
        // Log.info(this.vigilances[i].bloc_items.length);
        if (this.vigilances[i].bloc_items.length != 0 && (typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI") !== 'undefined' || typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SITUATION") !== 'undefined' || typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_QUALIFICATION_ZONAL") !== 'undefined')) {
          //if (this.vigilances[i].bloc_items.length != 0 && typeof this.vigilances[i].bloc_items.find(x => x.id === "DEP_SUIVI" ) !== 'undefined') {
          has_alert = true;
          //Log.info(this.vigilances[i].bloc_items.length);
          // Log.info("has_alert :"+ has_alert) ;
        }
      }

      // Log.info("this.hidden="+this.hidden) ;
      if (has_alert === true) {
        if (this.hidden == true) {
          this.show(1000, function () {
          });

          // Log.info("hidden was true") ;
        }
        this.updateDom(fade);
        // Log.info("updateDom") ;
      } else {
        if (this.hidden == false) {
          this.hide(1000, function () {
            // Log.info("hidden was false")
            //Module hidden
          });
          // Log.info("hidden was false") ;
        }
      }
    }
    else if (notification === "DATA_VIGILANCE_ERROR") {
      // Log.info("hide cause DATA_VIGILANCE_ERROR") ;
      this.hide(1000, function () {
        //Module hidden
      });
    }

  }

});
