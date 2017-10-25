
// Map
      var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 22.28552, lng: 114.15769},
          zoom: 10
        });
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(22.285, 114.157),
            map: map,
            animation: google.maps.Animation.BOUNCE,
            title: "Michelle's here"
          });
          marker.setMap(map);
        var infowindow = new google.maps.InfoWindow({
            content:"<b>Find Michelle here!<b>"

            });
          infowindow.open(map,marker);
        google.maps.event.addListener(map, 'idle', function () {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        });
      }
      


        $(document).ready(function(){
        $('a[href*="#"]').on('click', function(event) {
          
              // Make sure this.hash has a value before overriding default behavior
              if (this.hash !== "") {
                // Prevent default anchor click behavior
                event.preventDefault();
          
                // Store hash
                var hash = this.hash;
          
                // Using jQuery's animate() method to add smooth page scroll
                // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
                $('html, body').animate({
                  scrollTop: $(hash).offset().top
                }, 800, function(){
             
                  // Add hash (#) to URL when done scrolling (default click behavior)
                  window.location.hash = hash;
                });
              }
              });
      });

  $(function(){
    $('.first').hide();
    $('.second').hide();
    $('.third').hide();
    $('.fourth').hide();
    $('.fifth').hide();
    $('.sixth').hide();
    $(window).scroll(function(){ //onscroll
        var scrolleddown = false;//used to keep the state
        if($(window).scrollTop() > 500){ //if they've scrolled down
        $('.first').slideDown();
        $('.second').delay(1000).slideDown();
        $('.third').delay(2000).slideDown();
        $('.fourth').slideDown();
        $('.fifth').delay(1000).slideDown();
        $('.sixth').delay(2000).slideDown();
          
        } else {
          $('.first').slideUp();
          $('.second').slideUp();
          $('.third').slideUp();
          $('.fourth').slideUp();
          $('.fifth').slideUp();
          $('.sixth').slideUp();
        }
    });
});



