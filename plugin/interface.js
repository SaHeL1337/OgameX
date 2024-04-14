
let changeColor = document.getElementById('findCoordinates');

changeColor.onclick = function(element) {
    getPlayerCoordinates("SaHeL");
};

function getPlayerCoordinates(playerName){
  $("planetList").innerHTML = "
  1:1:1<br>
  1:2:3<br>
  
  ";
 $.get("http://localhost:3000/coordinates/" + playerName, function(data, status){
    console.log("Data: " + data + "\nStatus: " + status);
  });
  

}