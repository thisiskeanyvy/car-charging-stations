function goBorne(name) {
  window.open(name, '_blank');
}

$(document).ready(function () {

    $('.blog-lead p img').removeAttr( 'style' );
    $('.blog-lead p').removeAttr( 'style' );

		$(".navbar-toggle").on("click", function () {
			$(this).toggleClass("active");
	  });

      $(".cmsPages input, .cmsPages textarea").focusin( function() {
          if (this.value == this.defaultValue)
           { this.value = ''; }
      });
      $(".cmsPages input, .cmsPages textarea").focusout( function() {
          if (this.value == '')
           { this.value = this.defaultValue; }
      });

      /* Faq */
      $(".category .icnFaq").click( function() {
          $(".container-press").hide();
          $(".container-reviews").hide();
          $(".container-faq").toggle("slow");
          $('html, body').animate({
    		scrollTop:$(".container-faq").offset().top
    	    }, 'slow');
      });

      /* Reviews */
      $(".category .icnReviews").click( function() {
          $(".container-press").hide();
          $(".container-faq").hide();
          $(".container-reviews").toggle("slow");
          $('html, body').animate({
    		scrollTop:$(".container-reviews").offset().top
    	    }, 'slow');
      });

      /* Press */
      $(".category .icnPress").click( function() {
          $(".container-faq").hide();
          $(".container-reviews").hide();
          $(".container-press").toggle("slow");
          $('html, body').animate({
    		scrollTop:$(".container-press").offset().top
    	    }, 'slow');
      });
});

document.addEventListener("DOMContentLoaded", function(event) {

  function initArticles (selector) {
    if($('article', selector)) {
      // add click to all element
      // not modified in edit mode
      if ( window.location.href.indexOf("?edit") == -1 ) {
        $( selector + ' h3 a').each(function(ind, e) {
          $(e).closest('.post-item').on('click', function() {
            window.location.href = e.href;
          });
        })
      }

      // Move article elements
      $(selector + ' article').each(function(ind, e) {
        var header = $(e).children('header');
        var lead = $(e).children('.blog-lead');

        var children = lead.children();
        $(children[0]).addClass('blog-illustration');  // image
        $(children[1]).addClass('blog-description'); // description

        $(children[1]).prepend(header);

        header.children('h3').css({'margin-bottom':'2em'})
      });
    }
  }

  function isNumeric(value) {
      return /^-?\d+$/.test(value);
  }

  function calculateDistance(lat1, lon1, lat2, lon2, unit) {
      //rayon moyen de la Terre en kilomètres
      var R = 6371;

      //conversion des latitudes et longitudes en radians
      var lat1Rad = deg2rad(lat1);
      var lon1Rad = deg2rad(lon1);
      var lat2Rad = deg2rad(lat2);
      var lon2Rad = deg2rad(lon2);

      //différences de latitudes et longitudes
      var dLat = lat2Rad - lat1Rad;
      var dLon = lon2Rad - lon1Rad;

      //formule de Haversine
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      //distance en kilomètres
      var distanceInKilometers = R * c;

      //vérifier si la distance est inférieure à 1 kilomètre
      if (distanceInKilometers < 1) {
          // Conversion en mètres si la distance est inférieure à 1 kilomètre
          distanceInKilometers *= 1000;
          unit = 'm';
      }

      //par défaut, retourne la distance en kilomètres
      if(unit == 'm') {
        return parseFloat(distanceInKilometers).toFixed(1) + " m";
      } else {
        return parseFloat(distanceInKilometers).toFixed(1) + " km";
      }
  }

  //fonction pour convertir des degrés en radians
  function deg2rad(deg) {
      return deg * (Math.PI / 180);
  }

  // Exemple d'utilisation en kilomètres
  var distanceInKilometers = calculateDistance(40.7128, -74.0060, 40.7128, -74.0050, 'km');
  //console.log("Distance en kilomètres : " + distanceInKilometers + " km");


  async function bornesInfo() {
    var url = window.location.href;
    if (url.includes("/recherche/")) {
      var url = window.location.href;
      var urlObj = new URL(url);
      var recherche = urlObj.searchParams.get("q");
      const response3 = await fetch('/assets/cities.json');
      const citiesData = await response3.json();
      var region = "";
      if(isNumeric(recherche) == true) {
        for(var m = 0; m < citiesData["cities"].length; m++) {
          if(recherche == citiesData["cities"][m].zip_code) {
            recherche = citiesData["cities"][m].city_code.replaceAll(" ","_");
            region = citiesData["cities"][m].department_name;
          }
        }
      } else {
        recherche = recherche.replaceAll(" ","_")
        for(var l = 0; l < citiesData["cities"].length; l++) {
          if(recherche.toLowerCase().replaceAll("_"," ") == citiesData["cities"][l].city_code) {
            region = citiesData["cities"][l].department_name;
          }
        }
      }
      document.querySelector("#villeRecherche").innerHTML = '<a href="https://www.google.com/maps/place/'+encodeURIComponent(recherche)+'" target="_blank"> <span itemprop="addressLocality">'+recherche.replaceAll("_"," ")+'</span> (<span itemprop="addressRegion">'+region+'</span>)</a>';

      if(recherche != "") {
        //seo
        document.title = 'Liste des bornes de recharge pour voiture électrique à '+recherche+' ('+region+') | Ma Recharge';
        document.querySelector('meta[property="og:url"]').setAttribute('content', url);
        document.querySelector('meta[property="twitter:url"]').setAttribute('content', url);

        //call api
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 50000)
        const response = await fetch('https://api.ma-recharge.fr/v1/app?ville='+encodeURIComponent(recherche),{ signal: controller.signal });
        const dataBornes = await response.json();
        dataBornes.sort(function(a, b) {
          return b.reputation - a.reputation;
        });
        for(var i=0; i < dataBornes.length; i++) {
          var count_connectors = [0,0,0,0,0,0];
          connectors = "";

          for(var j = 0; j < dataBornes[i].types.length; j++) {
            if(dataBornes[i].types[j] == "Type 1") {
              count_connectors[0] += 1
            } else {
              if(dataBornes[i].types[j] == "Type 2") {
                count_connectors[1] += 1
              } else {
                if(dataBornes[i].types[j] == "Type 3C") {
                  count_connectors[2] += 1
                } else {
                  if(dataBornes[i].types[j] == "Combo CSS") {
                    count_connectors[3] += 1
                  } else {
                    if(dataBornes[i].types[j] == "CHAdeMO") {
                      count_connectors[4] += 1
                    } else {
                      if(dataBornes[i].types[j] == "Domestique UE") {
                        count_connectors[5] += 1
                      }
                    }
                  }
                }
              }
            }
          }

          if(count_connectors[0] > 0 && count_connectors[1] > 0 && count_connectors[2] > 0) {
            connectors += "TYPE (1; 2; 3C)";
            if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
              connectors += ", "
            }
          } else {
            if(count_connectors[0] > 0 && count_connectors[1] > 0) {
              connectors += "TYPE (1;2)";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
            if(count_connectors[1] > 0 && count_connectors[2] > 0) {
              connectors += "TYPE (2;3C)";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
            if(count_connectors[0] > 0 && count_connectors[2] > 0) {
              connectors += "TYPE (1;3C)";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
            if(count_connectors[0] > 0 && connectors.includes("1") == false) {
              connectors += "TYPE 1";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
            if(count_connectors[1] > 0 && connectors.includes("2") == false) {
              connectors += "TYPE 2";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
            if(count_connectors[2] > 0 && connectors.includes("3C") == false) {
              connectors += "TYPE 3C";
              if(count_connectors[3] > 0 || count_connectors[4] > 0 || count_connectors[5] > 0) {
                connectors += ", "
              }
            }
          }
          if(count_connectors[3] > 0) {
            connectors += "COMBO";
            if(count_connectors[4] > 0 || count_connectors[5] > 0) {
              connectors += ", "
            }
          }
          if(count_connectors[4] > 0) {
            connectors += "CHADEM";
            if(count_connectors[5] > 0) {
              connectors += ", "
            }
          }
          if(count_connectors[5] > 0) {
            connectors += "Domestique UE"
          }
          if(dataBornes[i].reputation == 0) {
            dataBornes[i].reputation = 'N/A';
          } else {
            dataBornes[i].reputation += "/5";
          }

          //Logo
          const response2 = await fetch('/assets/brand/brand.json');
          const dataBrand = await response2.json();
          var chaineMinuscules = dataBornes[i].title.toLowerCase();
          var logo = "default.svg";

          for (var logosearch in dataBrand["logo"]) {
            var logoMinuscules = logosearch.toLowerCase();
            if (chaineMinuscules.includes(logoMinuscules) || logoMinuscules.includes(chaineMinuscules)) {
              logo =  logosearch+"."+dataBrand["logo"][logosearch].type;
            }
          }

          //distance bornes
          var distanceInKilometers = "PROCHE";

          for(var m = 0; m < citiesData["cities"].length; m++) {
            if(dataBornes[i].title.includes(citiesData["cities"][m].city_code)) {
              var latitude_ville = citiesData["cities"][m].latitude;
              var longitude_ville = citiesData["cities"][m].longitude;
              if(urlObj.searchParams.get("lat") && urlObj.searchParams.get("lng")) {
                var latitude_user = parseFloat(urlObj.searchParams.get("lat"));
                var longitude_user = parseFloat(urlObj.searchParams.get("lng"));
                distanceInKilometers = calculateDistance(latitude_user, longitude_user, latitude_ville, longitude_ville, 'km');
              }
              if(distanceInKilometers == "PROCHE") {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    function (position) {
                      var latitude_user = position.coords.latitude;
                      var longitude_user = position.coords.longitude;
                      distanceInKilometers = calculateDistance(latitude_user, longitude_user, latitude_ville, longitude_ville, 'km');
                      localStorage.setItem('distanceInKilometers', distanceInKilometers);
                  });
                }
              }
            }
          }

          if(localStorage.getItem('distanceInKilometers')) {
            distanceInKilometers = localStorage.getItem('distanceInKilometers');
          }

          //affichage
          count_connectors_display = [0,0,0,0,0];
          count_connectors_display[0] = count_connectors[1];
          count_connectors_display[1] = count_connectors[3];
          count_connectors_display[2] = count_connectors[4];
          count_connectors_display[3] = count_connectors[2];
          count_connectors_display[4] = count_connectors[0];
          connectors_display = "";
          for(var k = 0; k < count_connectors_display.length; k++) {
            if(count_connectors_display[k] > 0) {
              connectors_display += '<td class="enabledconnectors"> <div class="connectors"> x'+count_connectors_display[k]+' </div> <br /> <span style="font-size:1em;font-weight:bold;" itemprop="enabledconnectors">OUI</span> </td>';
            } else {
              connectors_display += '<td class="disabledconnectors"> <div class=""></div> <br /> <span style="font-size:1em;font-weight:bold;" itemprop="enabledconnectors">NON</span> </td>';
            }
          }
          document.querySelector("#bornesInfo-desktop").innerHTML += '<tr onclick="goBorne(\'https://www.google.com/maps/place/'+encodeURIComponent(dataBornes[i].address)+'\')"> <td class="logoStation"> <img itemprop="logo" class="logoStationImg" src="/assets/brand/'+logo+'" alt="brand" /> </td> <td class="adress"> <a class="a--no-underline" href="https://www.google.com/maps/place/'+encodeURIComponent(dataBornes[i].address)+'" target="_blank"> <span>'+distanceInKilometers+'</span> <br /> <span style="font-size:1em;color:#111;" itemprop="name">'+dataBornes[i].title+'</span> <br /> <span style="font-size:1em;" itemprop="location" itemscope itemtype="http://schema.org/PostalAddress"> <span style="font-size:1em;color:#111;" itemprop="addressLocality"> '+dataBornes[i].address+'</span> </span> </a> </td> <td class="disabledconnectors"> <div class=""></div> <br /> <span style="font-size:1em;font-weight:bold;" itemprop="enabledconnectors"></span> </td> '+connectors_display+'<td class="disabledconnectors"> <div class=""></div> <br /> <span style="font-size:1em;font-weight:bold;" itemprop="enabledconnectors">'+dataBornes[i].reputation+'</span> </td> </tr>';
          document.querySelector("#bornesInfo-mobile").innerHTML += '<a href="https://www.google.com/maps/place/'+encodeURIComponent(dataBornes[i].address)+'" target="_blank" class="mobile-list-link"> <div id="enabledconnectors_717045" class="mobileList hidden-sm hidden-lg hidden-md"> <div class="mobileStation"> <div> <img itemprop="logo" class="logoStation" alt="brand" src="/assets/brand/'+logo+'" /> </div> <div class="mobileAdress"> <span>'+distanceInKilometers+'</span> <br /> <span style="font-size:1em;color:#111;" itemprop="name">'+dataBornes[i].title+'</span> <br /> <span style="font-size:1em;" itemprop="location" itemscope itemtype="http://schema.org/PostalAddress"> <span style="font-size:1em;color:#111;" itemprop="addressLocality"> </span> </span> </div> </div> <div class="mobileenabledconnectors"> <div class="connectors"> '+connectors+' </div> <br /> <div> <span style="font-size:1em;font-weight:bold;" itemprop="enabledconnectors">'+dataBornes[i].reputation+'</span> </div> </div> </div> </a>';
        }
      }
    } else {
        console.log("Impossible de lister les bornes sur cette page...");
    }
  }

  bornesInfo();
  initArticles('.latest-articles .blog-latest-entries');
  initArticles('.blog-list');
});