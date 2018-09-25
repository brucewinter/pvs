
// PVS: Photo Video Slideshow.   Documentation is pvs.txt

// Changelog:
//  09/24/2018 Created

var slidecount1    =    100

var slidelist      = 'photo_index.txt'
var videolist      = 'video_index.txt'

var speed_photo = 30000
var speed_video = 30000

var slidesrc    = []
var slidelabel  = []
var pic_list    = []
var vid_list    = []
var picvid_list = []
var whichslide
var paused      = false
var videoplayer = document.getElementById("myvideo"); 

var class_slide_default = 'slide1'
console.log("Default class: " + class_slide_default );

read_list();
search_list("");

// Read an index of all photos and videos
function read_list(search_string) {
    console.log("Loading slidelist ...");
    $.ajax({
	type:'GET',
	dataType:'text', 
	async: false,
	url: slidelist,
	data: {},
	success: function(data) {pic_list = data.split('\n');},
        error: function(jqXHR, textStatus, errorThrown) {console.log("read slidelist error: " + errorThrown);}
    });
    console.log("Done loading slidelist");
    $.ajax({
	type:'GET',
	dataType:'text',
	async: false,
	url: videolist,
	data: {},
	success: function(data) {vid_list = data.split('\n');},
        error: function(jqXHR, textStatus, errorThrown) {console.log("read videolist error: " + errorThrown);}
    });
    picvid_list = pic_list
    picvid_list = picvid_list.concat(vid_list);      // repeat if you want more video clips
//  picvid_list = picvid_list.concat(vid_list);
    picvid_list = picvid_list.filter(String) // Remove empty values
    console.log("db read_list1: p=" + pic_list.length + " v=" + vid_list.length + " pv=" + picvid_list.length);
//  console.log("db read_list2: p=" + pic_list);     // carefule, can be very long, 100k+

    picvid_list.sort(function(a, b){return 0.5 - Math.random()});
}

// Find specified photos/videos, if search specified, then randomly read slidecount1 photos/videos
function search_list(search_string) {
    var picvid_list2 = []
    if (search_string == "") {
	picvid_list2 = picvid_list
    }
    else {
	console.log("db search_list: " + search_string);
	search_regex = new RegExp(search_string, "i")
	for (i=0; i <= picvid_list.length; i++) {
            if (picvid_list[i].match(search_regex)) {
		picvid_list2.push(picvid_list[i])
            }
	}
    }

    var slidecount2 = picvid_list2.length
    slidesrc   = [];
    slidelabel = [];
    console.log("db search_list slide count1: " + slidecount2 +  " pause" + paused + " ss=" + search_string)
    for (i=0; i<slidecount1; i++) {
	if (i >= slidecount2) {break}
	var j
	if (slidecount1 <= slidecount2) {
	    j = Math.floor((Math.random() * slidecount2))
	}
	else {
	    j = i
	}
	var pic       = picvid_list2[j].replace("/mnt/", "../")
//	var pic       = picvid_list2[j]
// 	console.log("db search_list: i=" + i + " j=" + j + " pic=" + pic)
	var pic_label = pic;

	var prefix = "";
	var suffix = "";

// Pick out optional slide label data, drop video time index
        n = pic.search(/label=/);
        if (n > 0) {
	    suffix = pic.substr(n + 6);
	    pic    = pic.substr(0, n-1);
 	}


	// Try to pick out the year from the file path/name
	var year = "";
	n = pic.search(/(19\d\d|20\d\d)/);
	if (n > 0) {
	    year = pic.substr(n, 4);
	}
	else {
	    n = pic.search(/[\/\_ ]\d\d[\/ /-]/);
	    if (n > 0) {
		year = pic.substr(n+1, 2);
		if (year > 20) {
		    year = 1900 + parseInt(year);
		}
		else {
		    year = 2000 + parseInt(year);
		}
	    }
        }
        if (year > 0) {
            prefix = year + ":   ";
//	    prefix = year + ":   " + i + "/" + slidecount1 + "/" + slidecount2 + ": "
        }

        n = pic.search(/#t=/);
        if (n > 0) {
	    pic_label = pic.substr(0, n);
 	}
//  console.log("db search_list n=" + n + " pic=" + pic + " s=" + suffix);

	slidesrc[i]   =              pic;
        slidelabel[i] = prefix + " " + pic_label.replace(/..\/photos\/|..\/videos\//, "") + " " + suffix;

//	console.log("db search_list i=" + i + " j=" + j + " p1=" + slidesrc[i]);
    }

    whichslide = 0;
//  if (search_string != "") slide_pause('inc');

}

function slideit_inc() {
    slideit('inc');
}

function slideit(dir) {
    if (dir == 'dec') {
	whichslide--;
    }
    else if (dir == 'inc') {
	whichslide++;
    }
    if (whichslide > slidesrc.length-1) { whichslide = 0 }
    if (whichslide < 0) { whichslide = slidesrc.length-1 }
    console.log("db slideit 1: " + paused + dir + "slide=" + whichslide + ". ss=" + slidesrc[whichslide]);
    var picvid = slidesrc[whichslide];
    n = picvid.search(/video/);
    if (n > 0) {
	myvideo.src = picvid;
	document.getElementById("video_container").className = "video1";
	document.getElementById("slide_container").className = "hide";
	videoplayer.play();
        console.log("db slideit 3: " + paused);
	if (paused === true)  {document.getElementById("video_container").className = "pause_video"}
	clearTimeout(slide_timer);
	slide_timer = setTimeout("slideit('inc')",speed_video)
    }
    else {
	document.images.myslide.src = picvid;
	document.getElementById("slide_container").className = class_slide_default;
	document.getElementById("video_container").className = "hide";
	if (paused === true) {document.getElementById("slide_container").className = "pause_slide"}
	videoplayer.pause();
    }
    slide_label.innerHTML = "<center>" + slidelabel[whichslide] + "</center>";
    console.log("db slideit 2: " + document.getElementById("slide_container").className + document.getElementById("video_container").className );
}

// Pause slideshow.  If clicked when already paused, show previous photo
var slide_timer;
function slide_pause(dir) {
    paused = true;
    slideit(dir);
    console.log("db slide_pause: " + paused + whichslide + dir );
    clearTimeout(slide_timer);
//  slide_timer = setTimeout("slide_resume()",30000)
}
function slide_resume() {
    console.log("db slide_resume: " + class_slide_default);
    paused = false;
    snapshot_index = 0;
    slideit();
}
function slide_hide() {
    console.log("db slide_hide: " + class_slide_default);
    clearTimeout(slide_timer);
    document.getElementById("slide_container").className = "hide";
    document.getElementById("video_container").className = "hide";
}

// next slide slide when css animation is done
document.addEventListener('DOMContentLoaded', function () {
    var anim = document.getElementById("slide_container");
    anim.addEventListener("animationiteration", slideit_inc); // Not sure how to use slideit('inc') here, so hack it with slide_inc
    slideit('inc');
});

var lastkey;
document.onkeydown = function(event) {
    var e = event.keyCode;
//    if (e == lastkey) return;
//    lastkey = e;

// Note:  use below console.log to decode key.  does not match ascii table (higher by 1x)
    var key;
    if (e == 37) key = 'left';
    if (e == 65) key = 'a';
    if (e == 70) key = 'f';
    if (e == 82) key = 'r';
    if (e == 86) key = 'v';
    if (e == 66) key = 'b';
    if (e == 78) key = 'n';
    if (e == 77) key = 'm';
    if (e == 38) key = 'up';
    if (e == 39) key = 'right';
    if (e == 40) key = 'down';
    if (e == 13) key = 'enter';
    console.log("db onkeydown: " + e + key + paused);
    if (key == 'left')  slide_pause('dec');
    if (key == 'r')     slide_pause();
    if (key == 'a')     toggleMute();
    if (key == 'right') slide_pause('inc');
    if (key == 'down')  slide_hide();
    if (key == 'up') {
	if (paused === true) {slide_resume()}
	else                 {slide_pause()}
    }
    if (key == 'enter') search_slides();
    lastkey = '';
    console.log("db onkeydown: " + e + key + paused);
}

// Currently not enabled in pvs.html
function search_slides () {
    var search_text = document.getElementById("search_text_id").value;
    search_list(search_text);
}


function mouse_click(event) {
    var w = $(document).width();
    console.log("db mouse_label: X=" + event.clientX + " Y= " + event.clientY + " W=" + screen.width  + " " + w )
    if (event.clientX < w / 3 ) {
	slide_pause('dec');
    }
    else if (event.clientX > w / 1.5) {
	slide_pause('inc');
    }
    else {
	if (paused === true) {slide_resume()}
	else                 {slide_pause()}
    }

}

function toggleMute() {
    console.log("db toggleMute" + videoplayer.muted);
    if(videoplayer.muted){
	videoplayer.muted = false;
    } else {
	videoplayer.muted = true;
    }
    console.log("db toggleMute" + videoplayer.muted);
}


var reload_time = 1000*60*30;  // Periodic page refresh.  30 minutes
//tTimeout(function(){window.location.reload(true)},  reload_time);  // Periodic page refreshes for new photos and maybe avoid memory leaks.   Avoid this, so we can keep snapshot_list  array valid
//setTimeout("read_list()",  reload_time);  // This re-reads entire list files
setInterval("search_list()",  reload_time);  // This re-randomized currently displayed list.  setInterval re-triggers indefinatly

function startTime() {
  var t = moment().format("h:mm:ss");
  document.getElementById("clock").innerHTML = t
  t=setTimeout('startTime()', 1500)
//  console.log("db clock: " + t);

}

startTime();
