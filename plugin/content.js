//delimiter definitions
var playerGUIDBegin="statistics?rel=";
var playerGUIDEnd="'>";


var playerNameBegin="<span style='margin-top:6px;float:left;'>";
var playerNameEnd="</span>";

var moonNameBegin="<div style='font-size:11px;font-weight:bold;color:#6f9fc8;float:left;width:100%;margin-bottom:5px;'>";
var moonNameEnd="</div>";

var playerBannerGUIDBegin = "ShowPlayerBadgeDialog('";
var playerBannerGUIDEnd = "');";

var rankTotalBegin="rel=%%PLAYERGUID%%'>";
var rankTotalEnd="</a>";

var urlGalaxyRegex = "ogamex\.net\/galaxy\\?";
var urlSavedPlanetsRegex = "ogamex\.net\/galaxy/savedplanets";
var urlMessagesRegex = "ogamex\.net\/messages";
var urlStatisticsRegex = "ogamex\.net\/statistics";

var addingPlunderButtons = false;

var searchHasBeenAdded = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("script has been loaded version 2");
    var url = window.location.toString();
    //console.log(url);
    if (request.message === 'loadComplete' && (url.match(urlGalaxyRegex) != null)) {
      //console.log("scanning galaxy");
      if(!searchHasBeenAdded){
        addGalaxyScanAutomation();
        searchHasBeenAdded = true;
      }
      scanGalaxy();
    }

    if (request.message === 'loadComplete' && (url.match(urlStatisticsRegex) != null)) {
      saveRanks();
    }

    if (request.message === 'loadComplete' && (url.match(urlSavedPlanetsRegex) != null)) {
      addPlayerSearch();
    }

    if (request.message === 'loadComplete' && (url.match(urlMessagesRegex) != null)) {
      //callback if page is changing
      $('body').on('DOMSubtreeModified', '.message-area', function(){
          if(!addingPlunderButtons){
            //highlightGoodSpyReports();
            //analyzeCombatReports();
          }
      });
      //highlightGoodSpyReports();
    }
});



function highlightGoodSpyReports(){
  //console.log("highlighting good spy reports");
  addingPlunderButtons = true;

  var all = $(".message-item").map(function(number, element) {
      var messageType = $(element).data("msg-template");
      if(messageType === "FLEET_ESPIONAGE_REPORT"){
          var amountMetal = $(element).find('img[src="/assets/images/resource/metal.png"]').parent().text().replace(/\D/g,'');
          var amountCrystal = $(element).find('img[src="/assets/images/resource/crystal.png"]').parent().text().replace(/\D/g,'');
          var amountDeuterium = $(element).find('img[src="/assets/images/resource/deuterium.png"]').parent().text().replace(/\D/g,'');
          var amountTotal = +amountMetal + +amountCrystal + +amountDeuterium;
          var amountFleet = $(element).find('span:contains("Flotte")').text().replace(/\D/g,'');
          var amountDefense = $(element).find('span:contains("Verteidigung")').text().replace(/\D/g,'');

          //insert plunder button to all scans
          var messageActions = $(element).find('.message-actions');
          var sendSpyData = messageActions.find('a[onclick*="SendSpy"]').attr('onclick');
          var sendPlunderButton = messageActions.find('a[onclick*="SendPlunder"]');
          //console.log(sendSpyData);
          // var planetGUID = extractFromText(sendSpyData,"SendSpy('", "')");
          // plunderButtonHTML = '<a href="#" onclick="SavePlanet(\'' + planetGUID + '\'); return false;" class="btn-msg-action btn-msg-mark-favorite tooltip" data-tooltip-position="top"></a>';
          // messageActions.append(plunderButtonHTML);
          


          if(
            (
            +amountDefense <= 1)
          ){
            $(element).css("background-color","#005780");
          }


          if((+amountFleet >= 10000000)){
            $(element).css("background-color","#700000");
          }

      }
  }).get();

  addingPlunderButtons = false;
}


function addGalaxyScanAutomation(){
  var scanGalaxyButton = '<button type="submit" id="galaxySearch">Start Galaxy Automation</button>';

  $(".galaxy-route").append(scanGalaxyButton);

  $("#galaxySearch").click(function(){ 
    var upperBoundary = Math.floor((Math.random() * 1500) + 1000);
    var lowerBoundary = Math.floor((Math.random() * 800) + 500);
    var timeoutinms = Math.floor((Math.random() * upperBoundary) + lowerBoundary);
    var rightButton = $('#btnSystemRight');
    var leftButton = $('#btnSystemLeft');
    var galaxyNumber = $("#galaxyInput").val(); 
    var systemNumber = $("#systemInput").val(); 
    goingRightGalaxies = ["1","3","5"];

      if((goingRightGalaxies.includes(galaxyNumber) && systemNumber == 499) || 
      (!goingRightGalaxies.includes(galaxyNumber) && systemNumber == 1)){
        if($("galaxyInput").val() != 6){
          var rightButtonGalaxy = $('#btnGalaxyRight');
          rightButtonGalaxy[0].click();
          setTimeout(function() {$("#galaxySearch").click()}, timeoutinms);
        }else{
          console.log("complete");
        }
      }
      
      if(goingRightGalaxies.includes(galaxyNumber)){
        rightButton[0].click();
      }else{
        leftButton[0].click();
      }
      setTimeout(function() {$("#galaxySearch").click()}, timeoutinms);
  });


}

function saveRanks(){
  console.log("saving ranks");

  $(".x-points-change").css("display","block");
  var saveRanksButton = '<button type="submit" id="saveRanks">SaveRanks</button>';
  $(".navigation").append(saveRanksButton);



  $("#saveRanks").click(function(){ 
  
    rankObjects = new Object();
    rankObjects.objects = [];

    $(".statistics-section").find("tbody").find("tr").map(function(number, element) {
      var playerTD = $($(element).find("td")[4]).find("a").last();
      var pointsTotal = $($(element).find("td")[6]).find("div").first().text().replace(/(\r\n|\n|\r)/gm, "").replaceAll('.','');
      var playerName = $(playerTD).text();
      var playerGUID = extractFromText($(playerTD).attr('onclick'),playerBannerGUIDBegin,playerBannerGUIDEnd);
      
      rankObject = new Object();
      rankObject.playerGUID = playerGUID;
      rankObject.playerName = playerName;
      rankObject.pointsTotal = pointsTotal;

      rankObjects.objects.push(rankObject);

      //console.log(playerName + " " + playerGUID + " " + pointsTotal + "");
    });

    saveRanksAPI(rankObjects);

   });

   
   $("#saveRanks").click();

   var upperBoundary = Math.floor((Math.random() * 800000) + 700000);
   var lowerBoundary = Math.floor((Math.random() * 650000) + 600000);
   var timeoutinms = Math.floor((Math.random() * upperBoundary) + lowerBoundary);
   setTimeout(function() {location.reload()}, timeoutinms);
  //rankCategory = $($(".navigation").find(".active")[0]).find(".nav-item-text").text(); //Spieler or Allianz
  //rankType = $($(".navigation").find(".active")[1]).find(".nav-item-text").text();

}


function addPlayerSearch(){
  console.log("player search");
  var searchInput = '<input type="text" id="playerSearchInput" style="padding:5px"> <input type="submit" id="playerSearchSubmit" value="Search">';
  var farmSearchButton = '<button type="submit" id="farmSearch">Farmsearch</button>';

  $(".galaxy-route").append(searchInput);
  $(".galaxy-player-selection").append(farmSearchButton);
  $("#playerSearchSubmit").click(function(){ 
    
    $(".galaxy-info").empty();
    positions = getPlayerPositions();

   });

   $("#farmSearch").click(function(){ 
    
    $(".galaxy-info").empty();
    positions = getFarmPositions();

   });

}


function scanGalaxy(){
      var galaxy = $("#galaxyInput").val();
      var system = $("#systemInput").val();
      var galaxyPositions = {};
      

      var all = $(".galaxy-item").map(function(number, element) {

          var position = {};
          position.galaxy = galaxy;
          position.system = system;
          position.position = 0;
          position.playerName = "";
          position.playerGUID = "";
          position.planetName = "";
          position.hasMoon = false;
          position.moonName = "";
          position.rankTotal = 0;
          position.isInactive = false;
          position.isVacation = false;
          position.isEmpty = true;
          position.isNoob = false;

          position.position = $(element).find(".planet-index").text();
          if(!position.position) return; //removes first line of the table
          if(position.position == "16") return; //no need for position 16
          if(position.position == "17") return; //no need for position 16

          //extract tooltips to get further information
          playerTooltipContent = $(element).find(".col-player").find(".text-area").data("tooltip-content");
          moonTooltipContent = $(element).find(".col-moon").find(".tooltip_sticky").data("tooltip-content");
          planetTooltipContent = $(element).find(".col-moon").find(".tooltip_sticky").data("tooltip-content");

          //If player exists on this position
          if(playerTooltipContent){
             //as position is not empty
             position.isEmpty = false;
             position.playerName = extractFromText(playerTooltipContent,playerNameBegin,playerNameEnd);
             position.playerGUID = extractFromText(playerTooltipContent,playerGUIDBegin,playerGUIDEnd);
             position.planetName = $(element).find(".col-planet-name").find(".text-area").text().replace(/(\r\n|\n|\r)/gm, "");;
             rankTotalBeginReplaced = rankTotalBegin.replace("%%PLAYERGUID%%",position.playerGUID);
             position.rankTotal = extractFromText(playerTooltipContent,rankTotalBeginReplaced,rankTotalEnd).replace(/\D/g,'');
             position.isInactive = $(element).find(".col-player").find(".isInactive7").text() ? true : false; //TODO 28 days inactive
             position.isVacation = $(element).find(".col-player").find(".isVacation").text() ? true : false;
             position.isNoob = $(element).find(".col-player").find(".isNoob").text() ? true : false;
             position.alliance = $(element).find(".col-alliance").find(".text-area").text();


             position.hasMoon = moonTooltipContent ? true : false;
             if(position.hasMoon){
                position.moonName = extractFromText(moonTooltipContent,moonNameBegin,moonNameEnd);
               
             }

             //show ranking directly in galaxy view
             var shortPlayerNameElement = $(element).find(".col-player").find(".text-area");
             shortPlayerNameElement.text(shortPlayerNameElement.text() + " (" + position.rankTotal + ")");

             //highlight player name if it is inactive and below certain ranking
             if(+position.rankTotal > 1 && +position.rankTotal < 1200 && !position.isVacation && !position.isNoob && position.alliance != "OGXEU" && position.isInactive){
                $(element).css("background-color","#005780");
             }
             //console.log(position);
          }
          
          saveGalaxy(position);
          galaxyPositions[position.position] = position;

      }).get();
      //saveGalaxy(galaxyPositions);
}

function extractFromText(content, begin, end){
    beginIndex = content.indexOf(begin) + begin.length;
    return content.substring(beginIndex,content.indexOf(end,beginIndex));
}

function getRowHTML(position){

    var positionHTMLBeginning = `
      <div class="galaxy-item" style="display: block;"> 
    <div class="galaxy-col col-planet-select"> 
    <input type="checkbox" class="x-planet x-planet-check" data-saved-planet-id="38fa8967-b980-4c46-809c-995c0aab3e0a" style="margin-top:6px;">
    </div>
    <div class="galaxy-col col-planet-index" data-sort-val="111003">
    <a href="/galaxy?x=${position.galaxy}&amp;y=${position.system}"><span class="planet-index">${position.galaxy}:${position.system}:${position.position}</span></a> <div class="planet-img tooltip_sticky" data-tooltip-position="right" data-tooltip-content="<div style='padding:5px;width:200px;float:left;line-height:12px;'><div style='font-size:11px;font-weight:bold;color:#6f9fc8;float:left;width:100%;margin-bottom:5px;'>Heimatplanet</div><div style='width:60px;float:left;'><div style='width: 48px;height: 48px;border-radius:24px;margin-top:6px;margin-left:6px;float:left;position:relative;background: url(../../assets/images/V2/planet/6/6_small.jpg)no-repeat;background-size: contain;'><div style='position:absolute;width:20px;height:20px;color:#ffa800;font-size:12px;background-color: #000;border: 1px solid #ffa800;border-radius: 3px;z-index: 10;line-height: 20px;text-align: center;'>43</div></div><div style='font-size:11px;color:#DDD;text-align:center;float:left;width:100%;margin-top:6px;'>[1:110:3]</div></div><div style='width:120px;float:left;margin-top:10px;margin-left:10px;'><div class='clearFix' style='color: #aaa;font-size: 10px;margin-top: -10px;margin-bottom:5px;'>Aktivität : 43 Minuten</div> <div class='clearFix'><a class='galaxy-shortcut-action' href='/fleet?x=1&amp;y=110&amp;z=3&amp;planet=1&amp;mission=4'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Transport</a></div><div class='clearFix'><a class='galaxy-shortcut-action' href='#' onclick='SendSpy('38fa8967-b980-4c46-809c-995c0aab3e0a');'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Spionieren</a></div><div class='clearFix'><a class='galaxy-shortcut-action' href='/fleet?x=1&amp;y=110&amp;z=3&amp;planet=1&amp;mission=8'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Angriff</a></div></div></div>" style="background:url(../../assets/images/V2/planet/6/6_small.jpg) no-repeat;">

    <div class="planet-spy-hover" data-id="38fa8967-b980-4c46-809c-995c0aab3e0a" data-moon-type="false">
    </div>
    </div>
    </div>
    <div class="galaxy-col col-planet-name" data-sort-val="Heimatplanet">
    <span class="text-area">
    ${position.planetName}
    </span>
    </div>
    <div class="galaxy-col col-moon" data-sort-val=" 1  ">
  `;

  var positionHTMLMoon = `
  <div style="width:26px;height:26px;border-radius:13px;background:url(../../assets/images/V2/planet/moon/1/1_small.jpg) 0px 0px no-repeat;margin:auto;cursor:pointer;position:relative;background-size:contain;" class="tooltip_sticky" data-tooltip-position="right" data-tooltip-content="<div style='padding:5px;width:200px;float:left;line-height:12px;'><div style='font-size:11px;font-weight:bold;color:#6f9fc8;float:left;width:100%;margin-bottom:5px;'>Ay</div><div style='width:60px;float:left;'><div style='width: 48px;height: 48px;border-radius:24px; margin-top:6px;margin-left:6px;float:left;position:relative;background: url(../../assets/images/V2/planet/moon/1/1_small.jpg)no-repeat;background-size:contain;'></div><div style='font-size:10px;color:#AAA;text-align:center;float:left;width:100%;margin-top:6px;'>1.000 km</div></div><div style='width:120px;float:left;margin-top:10px;margin-left:10px;'> <div class='clearFix'><a class='galaxy-shortcut-action' href='/fleet?x=2&amp;y=430&amp;z=4&amp;planet=2&amp;mission=4'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Transport</a></div><div class='clearFix'><a class='galaxy-shortcut-action' href='#' onclick='SendSpy('8b68a2cf-7ad3-47f5-be8c-7173587612d2',true);'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Spionieren</a></div><div class='clearFix'><a class='galaxy-shortcut-action' href='/fleet?x=2&amp;y=430&amp;z=4&amp;planet=2&amp;mission=8'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Angriff</a></div><div class='clearFix'><a class='galaxy-shortcut-action' href='/fleet?x=2&amp;y=430&amp;z=4&amp;planet=2&amp;mission=10'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Zerstören</a></div></div></div>">
      <div class="planet-spy-hover" data-id="8b68a2cf-7ad3-47f5-be8c-7173587612d2" data-moon-type="true">
      </div>
      </div>
  `

  if(position.hasMoon){
  positionHTMLBeginning = positionHTMLBeginning + positionHTMLMoon;
  }

  var positionHTMLEnd = `
  </div>
    <div class="galaxy-col col-player" data-sort-val="${position.playerName}" data-sort-id="7fbf5bba-7293-4395-b331-870eab6efeae">
    <a onclick="ShowPlayerBadgeDialog('7fbf5bba-7293-4395-b331-870eab6efeae');">
    <span class="text-area  tooltip_sticky" data-tooltip-position="right" data-tooltip-content="<div style='padding:5px;min-width:160px;max-width:200px;float:left;line-height:12px;'><div style='font-size:11px;font-weight:bold;color:#6f9fc8;float:left;width:100%;margin-bottom:5px;'><span class='flag_sm flag-tr' style='float:left;margin-right:5px;'></span> <span style='margin-top:6px;float:left;'>${position.playerName}</span></div><div style='float:left;width:100%;margin-top:0px;'><div class='clearFix' style='margin-bottom:5px;'><span style='font-size:11px;color:#DDD;margin:3px 3px 3px 0px;'>Rang : </span><a class='galaxy-shortcut-action' href='/statistics?rel=0e981531-debe-41bd-a8e6-28f5964ca122'>72</a></div><div class='clearFix'><a href='#' class='galaxy-shortcut-action' onclick='ShowChatDialog('0e981531-debe-41bd-a8e6-28f5964ca122');'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Nachricht schreiben</a></div class='clearFix'><div><a href='#' class='galaxy-shortcut-action' onclick='ShowPlayerFriendCreateModal('0e981531-debe-41bd-a8e6-28f5964ca122');'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Freundschaftsanfrage</a></div><div class='clearFix'><a href='#' class='galaxy-shortcut-action'  onclick='PlayerAddEnemy('0e981531-debe-41bd-a8e6-28f5964ca122');'><i class='fas fa-angle-right' style='font-size:11px;margin-right: 5px;'></i>Als Feind hinzufügen</a></div></div></div>">${position.playerName}</span>
    </a>
    </div>
    <div class="galaxy-col col-alliance" data-sort-val="">
    
    </div>
    <div class="galaxy-col col-action">
    <a href="#" class="btnActionSpy tooltip" onclick="SendSpy('38fa8967-b980-4c46-809c-995c0aab3e0a'); return false;" data-tooltip-position="top" data-tooltip-content="<div style='font-size:11px;'>Spionieren</div>"></a>
    <a href="#" class="btnActionPlunder tooltip" onclick="SendPlunder('38fa8967-b980-4c46-809c-995c0aab3e0a'); return false;" data-tooltip-position="top" data-tooltip-content="<div style='font-size:11px;'>Plünderflotte zum Planeten senden</div>"></a>
    <a href="#" class="btnActionRemovePlanet tooltip" onclick="RemoveSavedPlanet('38fa8967-b980-4c46-809c-995c0aab3e0a'); return false;" data-tooltip-position="top" data-tooltip-content="<div style='font-size:11px;'>Planet von Liste entfernen</div>"></a>
    </div>
    </div>
  `

positionHTML = positionHTMLBeginning + positionHTMLEnd;

  return positionHTML;
}

function getPlayerPositions(){
  playerName = $("#playerSearchInput").val();
  $.ajax({
      contentType: 'application/json',
      headers: {'x-hasura-admin-secret': 'jr892h982149843ur98hiuwefg447287hz23rh'},
      success: function(data){
          //console.log("OgameXScanner: Player positions gathered");
          positions = data["galaxy"];

          for(let i=0; i<positions.length; i++){
            position = positions[i];

            positionHTML = getRowHTML(position);
      
            $(".galaxy-info").append(positionHTML);
          }
          console.log("found " + positions.length + " positions");


      },
      error: function(){
          //console.log("OgameXScanner: Failed to gather player positions");
      },
      processData: false,
      type: 'GET',
      url: 'https://URL/api/rest/ogamex/positions/' + playerName
  });
  }


  function getFarmPositions(){
    playerName = $("#playerSearchInput").val();
    $.ajax({
        contentType: 'application/json',
        headers: {'x-hasura-admin-secret': 'jr892h982149843ur98hiuwefg447287hz23rh'},
        success: function(data){
            //console.log("OgameXScanner: Farm positions gathered");
            positions = data["galaxy"];
  
            for(let i=0; i<positions.length; i++){
              position = positions[i];
  
              positionHTML = getRowHTML(position);
        
              $(".galaxy-info").append(positionHTML);
            }
  
  
        },
        error: function(){
            //console.log("OgameXScanner: Failed to gather farm positions");
        },
        processData: false,
        type: 'GET',
        url: 'https://URL/api/rest/ogamex/farms/'
    });
    }

function saveGalaxy(galaxyPositions){
$.ajax({
    contentType: 'application/json',
    headers: {'x-hasura-admin-secret': 'jr892h982149843ur98hiuwefg447287hz23rh'},
    data: JSON.stringify(galaxyPositions),
    dataType: 'json',
    success: function(data){
        //console.log("OgameXScanner: System scanned");
    },
    error: function(){
        //console.log("OgameXScanner: Coordinates failed to save");
    },
    processData: false,
    type: 'POST',
    url: 'https://URL/api/rest/ogamex/position'
});
}

function saveRanksAPI(rankObjects){
  $.ajax({
      contentType: 'application/json',
      headers: {'x-hasura-admin-secret': 'jr892h982149843ur98hiuwefg447287hz23rh'},
      data: JSON.stringify(rankObjects),
      dataType: 'json',
      success: function(data){
          //console.log("OgameXScanner: System scanned");
      },
      error: function(){
          //console.log("OgameXScanner: Coordinates failed to save");
      },
      processData: false,
      type: 'POST',
      url: 'https://URL/api/rest/ranks'
  });
  }
  
