function playBGM(){
    try{
        var bgm = document.getElementById("bgm");
        // console.log(bgm);
        if(bgm) {
            bgm.play();
        }
    }
    catch(DOMException){
        return;
    }
}

function playFailure() {
    var bgm = document.getElementById("bgm");
    bgm.pause();
    var failure = document.getElementById("failure");
    failure.play();
    bgm.play();
}

function playWonderful() {
    var bgm = document.getElementById("bgm");
    bgm.pause();
    var wonderful = document.getElementById("wonderful");
    wonderful.play();
    bgm.play();
}

function playReady() {
    var bgm = document.getElementById("bgm");
    bgm.pause();
    var ready = document.getElementById("ready");
    ready.play();
    bgm.play();
}

function playShoot() {
    var bgm = document.getElementById("bgm");
    bgm.pause();
    var shoot = document.getElementById("shoot");
    shoot.play();
    bgm.play();
}

function playTakeoff() {
    var bgm = document.getElementById("bgm");
    bgm.pause();
    var takeoff = document.getElementById("takeoff");
    takeoff.play();
    bgm.play();
}