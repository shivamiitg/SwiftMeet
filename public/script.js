const socket = io('/');
let myVideoStream;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
var currentPeer;
var local_stream;
var screenSharing = false;
var screenStream;
var mediaRecorder;
const parts = [];
var peer = new Peer();
var screenCount = 1;

navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
.then(function(stream){
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", call => {
        call.answer(stream);
        local_stream = stream;
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
            console.log("call");
            currentPeer = call;
        });
    });

    socket.on("user-connected", (userId) => {
        // console.log("sup");
        connecToNewUser(userId, stream);
    })

    let text = $("#chat_message");
    // console.log(text);
    // when press enter send message
    $('html').keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        // console.log(text.val());
        socket.emit('message', text.val(), NAME);
        text.val('')
        
      }
    });
    socket.on("createMessage", (message, by) => {
      $(".messages").append(`<div class = "font-bold text-gray-300">` + by + `</div><div class="message"></div>${message}</div>`);
      scrollToBottom();
    })
});

peer.on("open", function(id) {
    socket.emit("join-room", ROOM_ID, id);
})

const connecToNewUser = (userId, stream) => {
    // console.log("sup");
    const call = peer.call(userId, stream);
    currentPeer = call;
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
    });
};

/*toggled active class*/
const left = $('.main__left');
const right = $('.main__right');
$('#chat').click(function(){
  left.toggleClass('active');
  right.toggleClass('active');
});

// const a = $('.options');
// const b = $('.main__left');
// $('#newoption').click(function(){
//   console.log("hue");
//   a.toggleClass('active');
//   b.css('background', '#ccc');
// });


function addVideoStream (video, stream){
    // screenCount++;
    // if(screenCount == 2){
    //   $('video').animate({height:'300px', width: '400px'}, 500);
    // }
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
       video.play();
    });
    videoGrid.append(video);
};

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}



// -------------------------START/STOP AUDIO-------------------------------

  const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
  const mutebtn = document.getElementById("muteButton");

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
    mutebtn.style.backgroundColor = "rgb(53, 50, 50)";
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
    mutebtn.style.backgroundColor = "#CC3B33";
  }


  // -------------------------START/STOP VIDEO------------------------------


  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  const videobtn = document.getElementById("stopVideo");

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
    `
    videobtn.style.backgroundColor = "rgb(53, 50, 50)";
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    `
    videobtn.style.backgroundColor = "#CC3B33";
    document.querySelector('.main__video_button').innerHTML = html;
  }


// -------------------------SCREENSHARE-------------------------------

const screenPeer = new Peer();
screenPeer.on('open', id => {
  screenID = id;
})

const shareScreen = document.getElementById("shareScreen");
function startScreenShare() {
    console.log(screenSharing);
    if (screenSharing) {
        stopScreenSharing();
        return;
    }
    shareScreen.style.backgroundColor = "yellow";
    shareScreen.style.color = "black";
    navigator.mediaDevices.getDisplayMedia({
        
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
        },
        video: {
            cursor: "always",
        },
    }).then((stream) => {
        console.log(currentPeer);
        screenStream = stream;
        let videoTrack = stream.getVideoTracks()[0];
        let sender = currentPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
        screenSharing = true;
    }).catch((err) => {
        console.log(err);
    })
}

function stopScreenSharing() {
    if (!screenSharing) return;
    shareScreen.style.backgroundColor = "rgb(53, 50, 50)";
    shareScreen.style.color = "white";
    screenSharing = false
    let videoTrack = local_stream.getVideoTracks()[0];
    
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack)
  
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });
    
}


// -------------------------SCREEN RECORDING-------------------------------


const stbtn = document.getElementById("stbtn");

document.getElementById("stbtn").onclick = () => {
    // myVideo.muted = false;
    stbtn.style.backgroundColor = "#CC3B33";
    stbtn.style.color = "black";
    navigator.mediaDevices.getDisplayMedia({
        
        audio: true,
        video: {
            cursor: "always",
        },
    }).then(stream => {
        const video = document.createElement("video");
        video.srcObject = stream;
        // alert("Start recording?");
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start(1000);

        mediaRecorder.ondataavailable = (e) => {
            parts.push(e.data);
        }
        
    })
}

document.getElementById("stopbtn").onclick = () => {
    stbtn.style.backgroundColor = "rgb(53, 50, 50)";
    stbtn.style.color = "white";
    mediaRecorder.stop();
    const blob = new Blob(parts, {
        type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a  = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "rec.webm";
    a.click();
}


// -------------------------TIMER-------------------------------


window.onload = function () {
  
    var seconds = 00; 
    var mins = 00; 
    var appendMins= document.getElementById("mins")
    var appendSeconds = document.getElementById("seconds")

    var Interval ;
      
    clearInterval(Interval);
    Interval = setInterval(startTimer, 1000);
     
    
    function startTimer () {
    seconds++; 
      
      if(seconds <= 9){
        appendSeconds.innerHTML = "0" + seconds;
      }
      
      if (seconds > 9){
        appendSeconds.innerHTML = seconds;
        
      } 
      
      if (seconds > 59) {
        mins++;
        appendMins.innerHTML = "0" + mins;
        seconds = 0;
        appendSeconds.innerHTML = "0" + 0;
      }
      
      if (mins > 9){
        appendMins.innerHTML = mins;
      }
    
    }

  }



//--------------------------------------MAILING------------------------------------

const contactForm = document.querySelector('#getMail');

const email = document.getElementById("email");

contactForm.addEventListener('submit', (e) => {
    // e.preventDefault(); 
    let formData = {
      email: email.value,
    }
    console.log(formData);
    // email.value = '';
})

// let xhr = new XMLHttpRequest();
// xhr.open('POST', '/room');
// xhr.setRequestHeader('content-type', 'application/json');
// xhr.onload = function() {
//   console.log(xhr.responseText);
//   if(xhr.responseText == 'success'){
//     alert('Email sent!');
//     email.value = '';
//   }
//   else{
//     alert('Something went wrong')
//   }
// }

// xhr.send(JSON.stringify(formData));


