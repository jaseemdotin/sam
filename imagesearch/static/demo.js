$(document).ready(function() {

    console.log("ready");
    $("#mdbtn").hide()
    //modalControl();
    //getAllImages();


    $("#forms").submit(function (event) {
        event.preventDefault(); 
        var fileExtension = ['jpeg', 'jpg', 'png'];
        var formData = new FormData(this);
        formData.append('min', $('#min').val())
        formData.append('image',  $('#image')[0].files[0])
        formData.append('limit', $('#limit').val())
        formData.append('max', $('#max').val())
        console.log(formData)

        $.ajax({
            url : "/search2",
            type: "POST",
            data : formData,
            processData: false,
            contentType: false,
            success:function(data){
               console.log(data)
                displayResults(data)
                $("#mdbtn").click()
            },
            error: function(error){
                console.log(error) 
                alert("Only formats are allowed : "+fileExtension.join(', '));  
            }
        });
        return false; //<---- move it here
      });
  
  });

var displayResults = function(data){

    $("#results").html("");
    $("#ogimg").html("");
    var cls = "img-thumbnail float-start"
    try{
        var valid = data[0].valid
        if(valid==1){
            var og = data[0].ogimg;
            var imgelement = "<img src="+og+" class="+cls+">"
            $("#ogimg").append(imgelement);
            return
        }

    }
    catch{
        console.log('nope')
    }
    
    for(var i = 0; i < data.length; i++){
      var image = data[i].image;
      var score = data[i].score;
      var og = data[i].ogimg;
      var imgelement = "<img src="+og+" class="+cls+">"
      var element = "<div class=img-result><img class=img-thumbnail src="+image+"/>\
                     <div class=img-info>"+"<span class=image-name>IMAGE: "+image.split('.')[0]+"</span>\
                     <span class=img-score>SCORE: "+score+"</span></div></div>"
      $("#results").append(element);
    }
    $("#ogimg").append(imgelement);
  }


var displayModalImages = function(imgList){
  
    for(var i = 0; i < imgList.length; i++){
       $(".modal-images-list").append("<img src="+imgList[i].url+" class=modal-image onclick=imageSelectSearch(this,"+imgList[i].id+") />");
 
    }
 }


var getAllImages = function(){

    $.ajax({
     url: "/list",                   
     type: 'GET',
     success: function(data){
       //displayModalImages(data)
       console.log(data)
     },
     error: function(error){
       console.log(error);  
       
     }
  });
}