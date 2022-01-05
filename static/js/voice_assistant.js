//initialize
$(document).ready(function() {
const socket = io();
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.lang = 'th-TH';
var transcript = '';
var wakeword = 'สวัสดีหนูแดง';
var activeListening = false;
var countConsole = 0;
var childWindow;

//#region main
socket.on('mqtt_message', (data) => {
    var msg_mqtt = data.payload;
    if (msg_mqtt.emotion == 'angry')
    {
        responsiveVoice.speak("เดี๋ยวเปิดเพลงให้ฟังนะคะ", 'Thai Female', {
            onstart: () => {
                transcript = "";
            },
            onend: () => {
                $.ajax({
                    type: "GET",
                    url: "/youtube",
                    ContentType: 'application/json; charset=utf-8',
                    success:  (response) => {
                        if (response != '') {
                            console.log("success : " + response);
                        }
                    },
                    error:  (error)=> console.log(error)
                });
            }
        });
    }
    
});

recognition.start();
recognition.addEventListener('start', () => {
    $('#txt_listen').html("- o -");
    if (activeListening) {
        console.log("listening...");
    }
    else {
        console.log("sleep...");
    }
    clear_Console(10);
})
recognition.addEventListener('result', (e) => {
    transcript = e.results[e.results.length - 1][0].transcript.trim();
    console.log("stateResult : " + transcript);
    if (activeListening) {
        // console.log("Speed to Text : " + transcript);
        // console.log("Listening... : " + activeListening);
        if (transcript === 'เปิดแดชบอร์ดชั้น 9' || transcript === 'เปิด dashboard ชั้น 9' || transcript === 'เปิดจอแสดงผลชั้น 9' || transcript === 'เปิดหน้าแสดงผลชั้น 9'){
            showeDisplay('https://console.thinger.io/#!/dashboards/Touch_Show?authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJEYXNoYm9hcmRfVG91Y2hfU2hvdyIsInVzciI6Im5hcmF3aW4wMSJ9.e6FiGOH97nAfBtuWz8RXCuU_Y6DO8F5Y9AiQ7X-rYqI');
        }
        else if (transcript ==='ขอดูอากาศวันนี้'|| transcript ==='วันนี้อากาศเป็นไง'){
            showeDisplay('https://www.accuweather.com/th/th/bangkok/318849/weather-forecast/318849');
        }
        else if (transcript === 'ขอดูสถานะคนติดเชื้อ' ){
            showeDisplay('https://covid19.workpointnews.com/?fbclid=IwAR23Gt8UQ3fEDMad9LBHsOqUluKMjhafcq7PYovW-BNw4_qA1FJhIJVQCzc');
        }
        else if (transcript === 'เปิดเว็ป see it live' ){
            showeDisplay('https://www.seeitlivethailand.com');
        }
        else if (transcript === 'เปิดหน้าแสดงผล Office เชียงใหม่' || transcript === 'เปิดจอแสดงผลออฟฟิตเชียงใหม่' || transcript === 'เปิดแดชบอร์ดออฟฟิตเชียงใหม่ ' || transcript === 'เปิด dashboard Office เชียงใหม่' ){
            showeDisplay('http://34.126.76.29/');
        }
        else if (transcript === 'ขอดูน้ำท่วม' ){
            showeDisplay('http://touchwaterle  vel.herokuapp.com');
        }
        else if (transcript === 'ขอดูสถานะสแกนหน้ากาก' || transcript === 'ขอดูสถานะสแกนใส่หน้ากาก' || transcript === 'ขอดูสถานะสแกนเข้าออก' ){
            showeDisplay('http://touch-thermal.touch-ics.com');
        }
        else{
            dialogFlow(transcript);
        }
        activeListening = false;
    } else {
        if (transcript == wakeword) {
            //console.log("Speed to Text  : " + transcript);
            console.log("Active listening...");
            soundEffect();
            activeListening = true;
            setTimeout(()=> {
                activeListening = false;
                console.log("Timeout listening...");
            }, 10000);
        }
    }
})
recognition.addEventListener('end', () => {
    recognition.start();
})

$("#nooarai_logo").click((evt) => {
    responsiveVoice.speak(  
        "อารมณ์ไม่ดีหรอคะ เดี๋ยวหนูแดงเปิดเพลงให้ฟังนะคะ", 'Thai Female', {
        onstart: () => {
            transcript = "";
        },
        onend: () => {
            $.ajax({
                type: "GET",
                url: "/youtube",
                ContentType: 'application/json; charset=utf-8',
                success:  (response)=> {
                    if (response != '') {
                        console.log("success : " + response);
                    }
                },
                error:  (error)=> console.log(error)
            });
        }
    });
});

$("#iconSW").click( () => {
    if (childWindow) {
        alert("We already have one open.");
    } else {
        childWindow = window.open("https://google.com","Popup","width=500,height=500");
    }
});
//#endregion
const dialogFlow = (msg) => {
    $("#txt_listen").html(" . . . ");
    $.ajax({
        type: "POST",
        url: "/api",
        data: { message: msg },
        ContentType: 'application/json; charset=utf-8',
        success: function (response) {
            if (response != '') {
                console.log("Answer = " + response);
                $("#answer_message").html();
                $("#noodange_msgbox").show("slow");
                $("#answer_message").html(response);
                speak(response);
            }
        },
        error:  (error)=> console.log(error)
    });
}
const speak = (data) => {
    responsiveVoice.speak(data, 'Thai Female', {
        onstart: () => {
            transcript = "";
        },
        onend: () => {
            activeListening = false;
            transcript = "";
            recognition.stop();
        }
    });
}

const clear_Console = (count) => {
    if (countConsole >= count) {
        console.log("clearConsole");
        console.clear()
        countConsole = 0;
    }
    countConsole = countConsole + 1;
}

const soundEffect = () => {
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(() => {
        var audio = new Audio("static/sound/Active.wav");
        audio.play();
    })
}

const showeDisplay = (url) => {
    responsiveVoice.speak(  
        "รับทราบค่ะ", 'Thai Female', {
        onstart: () => {

        },
        onend: () => {
            childWindow.location.href= url;
            childWindow.focus();
            transcript = ""
        }
    });
}
});
