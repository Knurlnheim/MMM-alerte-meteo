var NodeHelper = require('node_helper');
var request = require('request');
var convert = require('xml-js');

module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-alerte-meteo helper started...');
  },

  getViligance: function (deptsList) {
      var self = this;
      request({ url: 'http://www.vigimeteo.com/data/NXFR33_LFPW_.xml', method: 'GET' }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var vigiResult = convert.xml2js(body, {compact: true, attributesKey: 'attributes', textKey: 'value', cdataKey: 'value', commentKey: 'value', ignoreDeclaration: true});
            var deptResult = vigiResult.CV.DV;
            //var deptsList = ["59", "62", "57", "27", "32"];
            var result = [];
            for (var j in deptsList) {
            // console.log("id " + deptsList[j].id + " label " + deptsList[j].label);
              for (var i in deptResult) {
                if (deptResult[i].attributes.dep === deptsList[j].id) {
                  var dept = deptResult[i].attributes.dep;
                  var couleur = deptResult[i].attributes.coul;
                  // console.log("id " + deptsList[j].id +" couleur "+ deptResult[i].attributes.coul);
                  // console.log(Array.isArray(deptResult[i].risque));
                  if (parseInt(couleur) > 1 )  {
                  //if (typeof deptResult[i].risque !== "undefined" && deptResult[i].risque !== null)  {
                    if (Array.isArray(deptResult[i].risque)) {
                    //  console.log("its an array of " + deptResult[i].risque.length);
                      for (var n in deptResult[i].risque) {
                    //    console.log("iteration " + n);
                        var risque = deptResult[i].risque[n].attributes.val;
                        result_item = {'dept': dept, 'label': deptsList[j].label, 'couleur': couleur, 'risque': risque };
                    //    console.log(result_item);
                        result.push(result_item);
                      }
                    } else {
                      var risque = deptResult[i].risque.attributes.val;
                      result_item = {'dept': dept, 'label': deptsList[j].label, 'couleur': couleur, 'risque': risque };
                      result.push(result_item);
                    }
                  } else {
                    var  risque ="0";
                    result_item = {'dept': dept, 'label': deptsList[j].label, 'couleur': couleur, 'risque': risque };
                        result.push(result_item);
                  }
                  //console.log(result[j]) ; // {a: 5, b: 6}
                }
              }
            }

            self.sendSocketNotification('DATA_VIGILANCE', result);

          }
      });
  },


  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    //console.log("Received :" + notification);
  //  console.log("Received payload:" + payload);
    if (notification === 'GET_VIGILANCE') {
      this.getViligance(payload);
    }
  }

});
