function scale(el, val) {
  el.style.mozTransform =
  el.style.msTransform =
  el.style.webkitTransform =
  el.style.transform = 'scale3d(' + val + ', ' + val + ', 1)';
}
var el = document.getElementById('logo');

var springSystem = new rebound.SpringSystem();
var spring = springSystem.createSpring(50, 3);
spring.addListener({
  onSpringUpdate: function(spring) {
    var val = spring.getCurrentValue();
    val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
    scale(el, val);
  }
});

el.addEventListener('mousedown', function() {
  spring.setEndValue(1);
});

el.addEventListener('mouseout', function() {
  spring.setEndValue(0);
});

el.addEventListener('mouseup', function() {
  spring.setEndValue(0);
});

var i = 1;
function openNav() {
  i = 0;
  document.getElementById("mySidenav").style.width = "200px";
  document.getElementById("f").style.width = "7%";
  document.getElementById("chat").style.paddingLeft = "200px";
}

function closeNav() {
  i = 1;
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("f").style.width = "19%";
  document.getElementById("chat").style.paddingLeft = "0";
}


function nav(){
  if(i == 1 ){
    openNav();
  }else{
    closeNav();
  }
}

$('.hamburger').click(function(){
  
  if($( ".hamburger" ).hasClass( "is-active")){
    $('.hamburger').removeClass("is-active");
  }else{
    $('.hamburger').addClass("is-active");
  }
})