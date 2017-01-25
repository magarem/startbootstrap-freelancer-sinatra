	// Swticher Cookie Base
	/**
	* Styleswitch stylesheet switcher built on jQuery
	* Under an Attribution, Share Alike License
	* By Kelvin Luck ( http://www.kelvinluck.com/ )
	* Thanks for permission!
	**/
	(function($)
	{
		$(document).ready(function() {
			$('.styleswitch').click(function()
			{
				switchStylestyle(this.getAttribute("rel"));
				return false;
			});
			var c = readCookie('style');
			if (c) switchStylestyle(c);
		});

		function switchStylestyle(styleName)
		{
			$('link[rel*=style][title]').each(function(i)
			{
				this.disabled = true;
				if (this.getAttribute('title') == styleName) this.disabled = false;
			});
			createCookie('style', styleName, 365);
		}
	})(jQuery);

	function createCookie(name,value,days)
	{
		if (days)
		{
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}
	function readCookie(name)
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++)
		{
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	function eraseCookie(name)
	{
		createCookie(name,"",-1);
	}

	// DEMO Swticher Base
	jQuery('.demo_changer .demo-icon').click(function(){

		if(jQuery('.demo_changer').hasClass("active")){
			jQuery('.demo_changer').animate({"left":"-400px"},function(){
				jQuery('.demo_changer').toggleClass("active");
			});
		}else{
			jQuery('.demo_changer').animate({"left":"0px"},function(){
				jQuery('.demo_changer').toggleClass("active");
			});
		}
	});

	// Selector (MODULE #4)
	$(window).on('load', function () {
		$('.selectpicker').selectpicker({
			'selectedText': 'cat'
		});
	});

	// Selector (MODULE #2)
	jQuery('.demo_changer .PatternChanger a').click(function(){
		var bgBgCol = jQuery(this).attr('href');
		jQuery('.demo_changer .PatternChanger a').removeClass('current');
		jQuery('header').css({backgroundColor:'#ffffff'});
		jQuery(this).addClass('current');
		jQuery('header').css({backgroundImage:'url(' + bgBgCol + ')'});
		if (jQuery(this).hasClass('bg_t')){
			jQuery('header').css({backgroundRepeat:'repeat', backgroundPosition:'50% 0', backgroundAttachment:'scroll'});
		} else {
			jQuery('header').css({backgroundRepeat:'repeat', backgroundPosition:'50% 0', backgroundAttachment:'scroll'});
		}
		return false;
	});

	// Selector (MODULE #5 and #6)
	/*
	   evol.colorpicker 2.2
	   (c) 2014 Olivier Giulieri
	*/
	$(document).ready(function(){
		var backColor = $("header").css("background-color");
		var backFontColor = $("header").css("color");

		$('#cp1').colorpicker({color:backColor})
		.on('change.color', function(evt, color){
			var backFontColor = $("header").css("color");
			$('header').attr('style','background-color:'+color+'; color:'+backFontColor);
		})
		$('#cp2').colorpicker({color:backFontColor})
		.on('change.color', function(evt, color){
			var backColor = $("header").css("background-color");
			$('header').attr('style','color:'+color+'; background-color:'+backColor);
			$('header hr.star-light').attr('style','border-color:'+color);
		})

		$('#fundos button').click(function(){
		  // do my image switching logic here.
			alert()
			var img = jQuery(this).children("img").attr('ng-src');
			$('header').css("background-image", "url("+img+")");
		});
	});
