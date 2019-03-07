'use strict';

Module.register("MMM-alerte-meteo", {
  defaults: {
    title: 'Alertes Météo',
    url: '',
    updateInterval: 30*60*1000,
    dptsList: [{id: '59', label: 'Nord'}]
    },

  start: function() {
    this.getData();
    this.scheduleUpdate();
    this.vigilances = [];

  },

  getStyles: function() {
  	return ["alertstyle.css"];
  },



  risques: [
    'Aucun',
    'Vent',
    'Pluie-Inondation',
    'Orages',
    'Inondation',
    'Neige',
    'Canicule',
    'Grand Froid',
    'Avalanches',
    'Vagues-Submersion'
  ],

  risquesIcons: [
    'Aucun',
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



  getDom: function() {
    var wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    var table = document.createElement("table");
    table.className = "medium";
    for (var i in this.vigilances) {
      if (parseInt(this.vigilances[i].couleur) > 1) {
        var color = this.colorClass[this.vigilances[i].couleur];

        var row = document.createElement("tr");
        table.appendChild(row);

        var cell = document.createElement("td");
        var risqueIdx = parseInt(this.vigilances[i].risque);
        cell.innerHTML = this.vigilances[i].label + " ("+this.vigilances[i].dept+")" ;
        cell.className = "dept " + color;
        row.appendChild(cell);

        var iconCell = document.createElement("td");
  			iconCell.className = color + " weather-icon";
  			row.appendChild(iconCell);

  			var icon = document.createElement("span");
  			icon.className = "wi weathericon " + this.risquesIcons[risqueIdx];
        iconCell.appendChild(icon);
      }
    }
    wrapper.appendChild(table)
    return wrapper;
  },



  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setInterval(function() {
      self.getData();
    }, nextLoad);
  },

  getData: function () {
    this.sendSocketNotification('GET_VIGILANCE', this.config.dptsList);
//    this.sendSocketNotification('GET_VIGILANCE', this.config.departements);
    this.loaded = false;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "DATA_VIGILANCE") {
      //Log.info("received :"+ payload);
      this.vigilances = payload;
      this.loaded = true;
      var fade = 500;
      var has_alert = false;
      this.updateDom(fade);
      for (var i in this.vigilances) {
        if (this.vigilances[i].couleur !== "1") {
          has_alert = true;
          //Log.info("has_alert :"+ has_alert) ;
        }
      }
      if (has_alert === true) {
        if (this.hidden == true ) {
          this.show(1000, {lockString: this.identifier});
          //Log.info("hidden was true") ;
        }
        this.updateDom(fade);
        //Log.info("updateDom") ;
      } else {
        if (this.hidden == false ) {
          this.hide(1000, {lockString: this.identifier});
          //Log.info("hidden was false") ;
        }
      }
    }

  }

});
