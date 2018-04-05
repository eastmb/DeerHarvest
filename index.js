      require([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/FeatureLayer",
          "esri/widgets/Legend",
          "dojo/domReady!"
        ],
        function(
          Map, MapView,
          FeatureLayer, Legend
        ) {

          var less2 = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "#A5B9DF",
            style: "solid",
            outline: {
              width: 0.5,
              color: "white"
            }
          };

          var less4 = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "#567CC2",
            style: "solid",
            outline: {
              width: 0.5,
              color: "white"
            }
          };

          var more4 = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "#023189",
            style: "solid",
            outline: {
              width: 0.5,
              color: "white"
            }
          };

          var renderer = {
            type: "class-breaks", // autocasts as new ClassBreaksRenderer()
            field: "DeerPerSqMi",

            classBreakInfos: [{
              minValue: 0,
              maxValue: 2.19,
              symbol: less2,
              label: "< 2.2"
            }, {
              minValue: 2.2,
              maxValue: 4.2,
              symbol: less4,
              label: "2.2 - 4.2"
            }, {
              minValue: 4.21,
              maxValue: 7,
              symbol: more4,
              label: "> 4.2"
            }]
          };

          var template = { // autocasts as new PopupTemplate()
            title: "{NAME} County",
            content: "<p>{DeerPerSqMi} deer harvested per square mile</p>",
            fieldInfos: [{
              fieldName: "DeerPerSqMi",
              format: {
                places: 2
              }
            }],
            actions: [{
                title: "Open Chart",
                id: "Harvchart", ///ID called in nested function below
                className: "esri-icon-chart"
            }]
          };

          var harvestLyr = new FeatureLayer({
            url: "https://services6.arcgis.com/9QlSLDqa0P1cHLhu/arcgis/rest/services/DeerHarvestRelate/FeatureServer/0",
            renderer: renderer,
            outFields: ["*"],
            popupTemplate: template
          });
  
          var map = new Map({
            basemap: "hybrid",
            layers: [harvestLyr]
          });
  
          var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [-83,32.6],
            zoom: 6.5,
          });
          var legend = new Legend({
            view: view,
            layerInfos: [
            {
              layer: harvestLyr,
              title: "Legend"
            }]
          });
                
          view.ui.add(legend, "bottom-left");

          view.when(function() {
            // Watch for when features are selected
            view.popup.watch("selectedFeature", function(graphic) {
                if (graphic) {
                // Set the action's visible property to true if the 'NAME' field value is not null, otherwise set it to false
                    graphic.popupTemplate.actions.items[0].visible =
                    graphic.attributes.NAME ? true : false;
                }
            });
          });
            view.when(function() {
                var popup = view.popup;
                popup.viewModel.on("trigger-action", function(event) {
                    if (event.action.id === "Harvchart") {
                        var attributes = popup.viewModel.selectedFeature.attributes;
                        // Get the 'NAME' field attribute
                        var info = attributes.NAME;
                        // Make sure the 'NAME' field value is not null
                         if (info) {
                            // Open harvest date chart below map if county is not null
                            var definition = {
                                type: "bar",
                                datasets: [
                                    {
                                    url: "https://services6.arcgis.com/9QlSLDqa0P1cHLhu/arcgis/rest/services/DeerHarvestRelate/FeatureServer/1",
                                        query: {
                                        orderByFields: "Harvest_Date",
                                        where: "County = '" + info + "'"
                                        }
                                    }
                                ],
                                series: [
                                    {
                                    category: { field: "TextDate", label: "Date" },
                                    value: { field: "CountOfCounty", label: "Deer Harvested" }
                                    }
                                ]
                            };

                            var cedarChart = new cedar.Chart("chart", definition);
                            cedarChart.show();
                            chart.override = {
                                "marks": [
                                    {"properties": 
                                        {
                                            "hover": {"fill": {"value": "#17a086"}},
                                            "update": {"fill": {"value": "#7fcdbb"}}
                                        }
                                    }
                                ]
                            };

                        }
                    }
                });
            });                 
        });
