var calendar = [];
var selectedEvents = [];
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var canvas = document.getElementById("gfxCanvas"),
    ctx = canvas.getContext("2d");
var backgroundImagePath = "";

run();

function run(){
    $( "#datepicker" ).datepicker();
    $.getJSON( "https://bvc.churchsuite.com/embed/calendar/json", function( data ) {
        calendar = data;
    });
}

function getEvents(){
    var startDate = $( "#datepicker" ).datepicker( "getDate" );
    var numberOfDays = parseInt($('#daysnumber').val());
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numberOfDays);

    var rangeItems = [];

    $.each( calendar, function (key, val){
        if (Date.parse(val.datetime_start) >= startDate.getTime() && Date.parse(val.datetime_start) < endDate){
            rangeItems.push(val);
        }
    });

    $('#eventsList').empty();

    $.each( rangeItems, function(key, val){
        var thisDate = new Date(val.datetime_start);
        $('#eventsList').append("<li class='list-group-item'><label for='ch" + key + "'><input id='ch" + key +"' type='checkbox' checked> " + val.name + " (" + days[thisDate.getDay()] + ")</label></li>")
    });

    selectedEvents = rangeItems;
}

function buildCalendar(){
    canvas = document.getElementById("gfxCanvas"),
    ctx = canvas.getContext("2d");
    backgroundImagePath = "./assets/BaseCalendarBlank.jpg";
    drawCalendar(0);
}

var logoFinished = false;
var mainFinished = false;

function startSecondDraw(){
    if (logoFinished == true && mainFinished == true){
        logoFinished = false;
        mainFinished = false;

        canvas = document.getElementById("instCanvas"),
        ctx = canvas.getContext("2d");
        backgroundImagePath = "./assets/CalendarInsStBase.png";
        drawCalendar(1);
    }
}

function drawCalendar(type){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var background = new Image();
    background.onload = function () {
        ctx.drawImage(background, 0, 0);

        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        var logo = new Image();
        logo.onload = function(){
            ctx.drawImage(logo, canvas.width-300, 0);
            if (type == 0){
                logoFinished = true;
                startSecondDraw();
            }
        }
        logo.src = "./assets/V61Logo.png";

        var scaleFactor = (canvas.width / 2048) * $('#customRange1').val();

        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.font = "italic bold " + 100 * scaleFactor + "px Montserrat";
        ctx.fillText($("#titleInput").val(), 40, 180);

        
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.font = "italic " + 60 * scaleFactor +"px Montserrat";
        ctx.fillText("Find out more at Vineyard61.org", 60, canvas.height-80);

        var daysString = [];
        var eventsString = [];
        var timesString = [];
        var currentDay = -1;
        var lineHeight = 80;
        var totalSize = 0;
        var lineCount = 0;

        $.each(selectedEvents, function(key, val){
            if ($('#ch' + key).is(':checked')) {
                var thisDate = new Date(val.datetime_start);

                if (currentDay != thisDate.getDay()){
                    currentDay = thisDate.getDay();
                    daysString.push(days[thisDate.getDay()]);
                    eventsString.push("");
                    timesString.push("");
                    lineCount++;2
                }

                daysString.push("");
                eventsString.push(val.name);
                timesString.push(("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2));
                lineCount++;
            }
        });

        lineHeight = (canvas.height-400)/lineCount;

        totalSize = (lineHeight * lineCount)

        var textScale = (lineHeight/110) * scaleFactor;

        var startPoint = (canvas.height)/2 - (totalSize/2) + 100;
        var xOffset = 10;

        for (var l = 0; l < lineCount; l++){
            var yPoint = startPoint + (l * lineHeight);
            var xPointOff = xOffset * l;

            ctx.font = "bold italic " + 190 * scaleFactor + "px Rockville";
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.fillText(daysString[l], 200 + xPointOff, yPoint+140);
        
            ctx.font = Math.min(90, 60 * textScale) + "px Montserrat";
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fillText(eventsString[l], 120 + xPointOff, yPoint);
        
            ctx.font = "bold italic " + Math.min(90 ,60 * textScale) + "px Montserrat";
            ctx.textAlign = 'right';
            ctx.fillText(timesString[l], canvas.width-200 + xPointOff, yPoint+40);
            ctx.textAlign = 'left';
            
            if (daysString[l] == ""){
                ctx.beginPath();
                ctx.moveTo(70 + xPointOff, yPoint+10);
                ctx.lineTo(canvas.width-100 + xPointOff, yPoint+10);

                var gradient = ctx.createLinearGradient(0, 0, canvas.width-50, 0);
                gradient.addColorStop("0", "rgba(255,255,255,0.4)");
                gradient.addColorStop("1.0", "rgba(100,100,100,0)");
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 80;
                ctx.stroke();
            }
        }
        if (type == 0){
            mainFinished = true;
            startSecondDraw();
        }
    };
    background.src = backgroundImagePath;
}

function downloadSquare(){
    var output = document.getElementById("gfxCanvas");
    image = output.toDataURL("image/jpeg");

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        var newTab = window.open('about:blank','image from canvas');
        newTab.document.write("<img src='" + image + "' alt='from canvas'/>");
    }

    var link = document.createElement('a');
    link.download = "calendar.jpg";
    link.href = image;
    link.click();
}

function downloadInstastory(){
    var output = document.getElementById("instCanvas");
    image = output.toDataURL("image/jpeg");
    var link = document.createElement('a');
    link.download = "calendar.jpg";
    link.href = image;
    link.click();
}