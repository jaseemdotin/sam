// ----- custom js ----- //
var imagePath = 'static/images/';

$(document).ready(function() {

  console.log("ready");
  modalControl();
  getAllImages();

});

// JSON.parse('{"name":"John", "age":30, "city":"New York"}')
// request for all images in database to display in modal
var getAllImages = function(){

     $.ajax({
      url: "/list",                   
      type: 'GET',
      success: function(data){
        displayModalImages(data)
      },
      error: function(error){
        console.log(error);  
        
      }
   });
}

// displays images in modal
var displayModalImages = function(imgList){
  
   for(var i = 0; i < imgList.length; i++){
      $(".modal-images-list").append("<img src="+imgList[i].url+" class=modal-image onclick=imageSelectSearch(this,"+imgList[i].id+") />");

   }
}

// handles click of modal image
var imageSelectSearch = function(_this,id,name) {
  var src = $(_this).attr("src");
  var id = id
  var name = name
  console.log(id)
  $("#modal").css("display", "none");
  $(".img-preview").attr("src", src);
  $("#results").html("");
  $("#results").append("<div id=searching>Searching For Results...</div>");

  var image = src.split('/')[2];
  var imageName = image.split('.')[0];

  $("#preview-name").text('QUERY: '+imageName);

  $.ajax({
    url: "/search",
    data: {img: src,id:id},
    cache: false,
    type: 'POST',
    success: function(data){
      console.log(data)
      displayResults(data);
    },
    error: function(error){
      console.log(error.toString()); 
    }
   });

}

//display results
var displayResults = function(data){

  $("#results").html("");

  for(var i = 0; i < data.length; i++){
    var image = data[i].image;
    var score = data[i].score;
    var element = "<div class=img-result><img class=responsive src="+image+"/>\
                   <div class=img-info>"+"<span class=image-name>IMAGE: "+image.split('.')[0]+"</span>\
                   <span class=img-score>SCORE: "+score+"</span></div></div>"
    $("#results").append(element);
  }
}

//Controls the opening and closing of the modal
var modalControl = function(){

  // Get the modal
  var modal = document.getElementById("modal");

  // Get the button that opens the modal
  var btn = document.getElementById("select");
  console.log(modal);
  
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  
  // When the user clicks the button, open the modal 
  btn.onclick = function() {
    modal.style.display = "block";
  }
  
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
  
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}