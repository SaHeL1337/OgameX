const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');

const app = express();

const positions = [
    {
        galaxy  : "1",
        system: "1",
        pos: "1",
        playerName: "admin",
        playerGUID: "someguid",
        planetName: "myname",
        hasMoon: true,
        moonName: "mymoon",
        rankTotal: "",
        isInactive: false,
        isVacation: false,
        isEmpty: false,
        lastUpdate: Date.now() - 1000000000
    }
]

//------------------------------------------------------------------------------
app.use(bodyParser.json());



app.post('/positions', (req, res) => {
    coords = req.body;
    for (const [key, value] of Object.entries(coords)) {

      //delete if it already exists - always overwrite
      const existingCoordinates = positions.find(c => { return c.galaxy === value.galaxy && c.system === value.system && c.pos === value.pos });
      var index = positions.indexOf(existingCoordinates);
      if (~index) {
          positions.splice(index, 1);
      }

      //add new entry to the database
      updatedCoordinates = {}
      updatedCoordinates.galaxy = value.galaxy;
      updatedCoordinates.system = value.system;
      updatedCoordinates.pos = value.pos;
      updatedCoordinates.playerName = value.playerName;
      updatedCoordinates.playerGUID = value.playerGUID;
      updatedCoordinates.planetName = value.planetName;
      updatedCoordinates.hasMoon = value.hasMoon;
      updatedCoordinates.rankTotal = value.rankTotal;
      updatedCoordinates.isInactive = value.isInactive;
      updatedCoordinates.isVacation = value.isVacation;
      updatedCoordinates.isEmpty = value.isEmpty;
      updatedCoordinates.lastUpdate = Date.now();
      positions.push(updatedCoordinates);
      console.log("Coordinates for " + value.galaxy + ":" + value.system + ":" + value.pos + " have been updated");
    }
    res.status(200).json({status:"ok"})
});

app.get('/positions/player/:playerName', (req, res) => {
    console.log(req.params.playerName);
    const coords = positions.filter(c => { return c.playerName == req.params.playerName });
    res.send(coords);
});

app.get('/positions/outdated', (req, res) => {
    const timeUntilOutdated = 24 * 60 * 60 * 1000;
    const outdatedPositions = positions.filter(c => { return c.lastUpdate <= (Date.now() - timeUntilOutdated) });
    res.send(outdatedPositions);
});

app.get('/positions/unknown', (req, res) => {
    const numberOfGalaxies = 5;
    const numberOfSystemsPerGalaxy = 499;
    const numberOfPositionsPerSystem = 15;

    unknownPositions = [];
    for (galaxy = 1; galaxy <= numberOfGalaxies; galaxy++) {
      for (system = 1; system <= numberOfSystemsPerGalaxy; system++) {
        for (pos = 1; pos <= numberOfPositionsPerSystem; pos++) {
          positionExists = positions.find(c => { return c.galaxy === galaxy && c.system === system && c.pos === pos });
          if(!positionExists){
            unknownPositions.push(galaxy + ":" + system + ":" + pos);
          }
        }
      }
    }
    res.send(unknownPositions);
});

app.get('/positions/statistics', (req, res) => {
    const timeUntilOutdated = 24 * 60 * 60 * 1000;
    const positionsOutdated = positions.filter(c => { return c.lastUpdate <= (Date.now() - timeUntilOutdated) });
    const numberOfPositionsPossible = 5 * 499 * 15;
    statistics = [{
      "numberOfPositionsPossible" : numberOfPositionsPossible,
      "numberOfPositionsKnown" : positions.length,
      "numberOfPositionsUnknown" : numberOfPositionsPossible - positions.length,
      "numberOfPositionsOutdated" : positionsOutdated.length
    }];
    res.send(statistics);
});

app.listen(3005, () => {
    console.log('Server started on port 3000');
});


//ideas:
//timestamp for all values
//how many have been updated in past 24 hours (interval definition for "current")
//how many have been scanned in total at all
//random system which is most likely outdated with link
//pie chart of fleet/building points
//endpoint that automatically gives you one galaxy to scan (most outdated, if multiple then random) - bot who runs on the server and only goes to this system every few seconds
