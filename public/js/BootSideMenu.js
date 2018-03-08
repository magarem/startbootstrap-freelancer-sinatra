$(document).ready(function(){

  var menu = $(".menu");
  var toggle_button = $(".toggle_button");
  var menuOpen;

  function openMenu(){
    menu.css("left", "0px");
    $(".toggle_button").css("right", "-30px");
    menuOpen = true;
  }

  function closeMenu(){
    menu.css("left", "-320px");
    $(".toggle_button").css("right", "-150px");
    menuOpen = false;
  }

  function toggleMenu(){
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // toggle.on({
  //   mouseenter: function(){
  //     openMenu();
  //   }
  // });

  $(".toggle_button").click(function(e) {
     toggleMenu()
  });

  // menu.on({
  //   mouseleave: function(){
  //     closeMenu();
  //   }
  //
  // });

  // hamburger.on({
  //   click: function(){
  //     toggleMenu();
  //   }
  // })



});
