//#region initialize
var main = true;
var web = true;
var chat = [];
var temp_msg = JSON.parse(localStorage.getItem('nooarai_msg'));

if (temp_msg == null) {
    localStorage.setItem('nooarai_msg', JSON.stringify("สวัสดีคะ หนูอะไรยินดีต้อนรับค่ะ"));
}
init_chat()
//#endregion

//#region  Event 

$("#helloTime").html(formatTime(new Date()))

$(".exit").click(function () {
    $(".iframe").slideUp(1000, function () {
        console.log("END");
    });
});

$("#iconSW").click(function () {

    $("#noodange_msgbox").hide();
    var imgname = $("#iconSW").attr("src");
    if (imgname == "../static/img/keyboard.png") {
        $("#microphone").hide();
        $("#iconSW").attr("src", "../static/img/mic.png")
        $("#chat_boxdialog").show();
        $("#message").hide();
        $("#txt_listen").hide();
        $("#noodange_pic").addClass("nooaria-move animated bounceInRight slow");
        $("#message_small").show();
        $("#nooarai_logo").addClass("logo-move");
    } else {
        $("#microphone").show();
        $("#microphone").attr("src", "../static/img/mic_on.gif");
        $("#iconSW").attr("src", "../static/img/keyboard.png")
        $("#chat_boxdialog").hide();
        $("#message_small").hide();
        $("#message").show();
        $("#txt_listen").show();
        $("#noodange_pic").removeClass("nooaria-move animated bounceInRight slow");
        $("#nooarai_logo").removeClass("logo-move");
    }
});

$("#noodange_pic").click(function () {
    $("#noodange_msgbox").toggle("slow");
});

$("#clear_message").click(function () {
    clear_chat();
});
$("#close_iframe").click(function () {
    back_home();
    setTimeout(function () {
        $("#close_iframe").hide();
    }, 500)
});
$("#btn_closechat").click(function () {
    $("#chat_boxdialog").hide();
    $("#microphone").show();
    $("#iconSW").attr("src", "../static/img/keyboard.png")
    recognizing = true;
    microphone = true;
    startButton(event);
});

//#endregion

//#region   enter send message now
$("#txtmessage").keyup(function (e) {
    if (e.keyCode == 13) {
        console.log("send message now");
        var msg = $("#txtmessage").val();
        if (msg != "") {
            console.log('response  : ' + $("#txtmessage").val());
            $("#msg_chat").append(
                "<div class='flex-container'>" +
                "<div class='flex45'></div>" +
                "<div class='flex10 flexhide'></div>" +
                "<div class='flex45 d-flex animated slideInRight faster'>" +
                "<p class='msg-question flex100'><i class='fas fa-keyboard mr-3'></i>" + msg + "</p>" +
                "</div>" +
                "</div>"
            );
            console.log('end');
            $.ajax({
                url: '/api',
                data: { "message": msg },
                type: 'POST',
                success: (response) => {
                    var botMsg = response;
                    if (response != "" && typeof (response) != "undefined") {
                        timeanswer = formatTime(new Date());
                        $("#msg_chat").append(
                            "<div class='flex-container'>" +
                            "<div class='flex45 d-flex animated bounceInLeft'>" +
                            "<div class='flex20 mr-4'>" +
                            "<img class='rounded-img img-answer' src='../static/img/nooari.png' alt='' style='width: 100%;'>" +
                            "</div>" +
                            "<p class='msg-answer flex80 mt-2'>" + botMsg + "</p>" +
                            "</div>" +
                            "<div class='flex10 flexhide'></div>" +
                            "<div class='flex45'></div>" +
                            "</div>"
                        );
                        $(function () {
                            var wtf = $('#msg_chat');
                            var height = wtf[0].scrollHeight;
                            wtf.scrollTop(height);
                        });
                    }
                    var data = {
                        "command": msg,
                        "message": botMsg,
                    };
                    chat = JSON.parse(localStorage.getItem('chatMessage'));
                    chat.push(data);
                    console.log(chat);
                    localStorage.setItem('chatMessage', JSON.stringify(chat));
                    $(function () {
                        var wtf = $('#msg_chat');
                        var height = wtf[0].scrollHeight;
                        wtf.scrollTop(height);
                    });
                    $("#txtmessage").val("");

                },
                error: (error) => {
                    console.log(error);
                }
            });
        }
    }
});
//#endregion

//#region  functions
function formatDate(date) {
    var monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฏาคม", "สิงหาคม", "กันยายน", "ตุลาคน", "พฤศจิกายน", "ธันวาคม"];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ' ' + (year + 543);
}

function formatTime(d) {
    return ("0" + d.getHours()).substr(-2) + ":" + ("0" + d.getMinutes()).substr(-2) + ":" + ("0" + d.getSeconds()).substr(-2);
}

function init_chat() {
    chat = JSON.parse(localStorage.getItem('chatMessage'));
    console.log(chat);
    if (chat == null) {
        chat = [];
        localStorage.setItem('chatMessage', JSON.stringify(chat));
        chat = JSON.parse(localStorage.getItem('chatMessage'));
    }
    if (chat != "") {
        for (var i = 0; i < chat.length; i++) {
            $("#msg_chat").append(
                "<div class='flex-container'>" +
                "<div class='flex45'></div>" +
                "<div class='flex10 flexhide'></div>" +
                "<div class='flex45'>" +
                "<p class='msg-question'><i class='fas fa-keyboard mr-3'></i>" + chat[i].command + "</p>" +
                "</div>" +
                "</div>"
            );
            $("#msg_chat").append(
                "<div class='flex-container'>" +
                "<div class='flex45 d-flex'>" +
                "<div class='flex20 mr-4'>" +
                "<img class='rounded-img img-answer' src='../static/img/nooari.png' alt='' style='width: 100%;'>" +
                "</div>" +
                "<p class='msg-answer flex80 mt-2'>" + chat[i].message + "</p>" +
                "</div>" +
                "<div class='flex10 flexhide'></div>" +
                "<div class='flex45'></div>" +
                "</div>"
            );
        }
    }
    $(function () {
        var wtf = $('#msg_chat');
        var height = wtf[0].scrollHeight;
        wtf.scrollTop(height);
    });
}
function clear_chat() {
    chat = [];
    localStorage.setItem('chatMessage', JSON.stringify(chat));
    $("#msg_chat").html("");
    init_chat();
}
//#endregion