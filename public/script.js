const videoGrid = document.getElementById("video-grid");
const socket = io("/");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
      //console.log(userId);
    });

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    });

    let text1 = $("input");
    //console.log(text);

    $("html").keydown((e) => {
      if (e.which == 13 && text1.val().length !== 0) {
        socket.emit("message", text1.val());
        text1.val("");
      }
    });

    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class="message"><b>user</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //console.log(userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

function endCall() {
  window.location.href = "/";
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

function getURL() {
        const c_url = window.location.href;
        copyToClipboard(c_url);
        
      }




// cache dom
var $shareBtn = $('.share-btn');
var $shareUrl = $('.share-url');
var $shareContainer = $('.share-container');
var $notificationButton = $('.notification-button');

// set data
var $url = window.location.href;
var $shared = false;

/**
 *
 */
function shareLink(e){

    // set active class
    $shareBtn.toggleClass('active');
    $shareUrl.toggleClass('active');
    $shareContainer.toggleClass('active');

    if ($shared === false) {

        // trigger notification alert
        $notificationButton.toggleClass('active');
        $shared = true;
        $shareBtn.text('Stop');
        $shareUrl.text($url);

        var range = document.createRange();
        range.selectNode($(this).next()[0]);
        window.getSelection().addRange(range);

        try {
            // Now that we've selected the anchor text, execute the copy command
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg);

        } catch(err) {

            console.log('Oops, unable to copy');

        }

        // Remove the selections - NOTE: Should use
        // removeRange(range) when it is supported
        window.getSelection().removeAllRanges();


    } else {
        $shared = false;
        $shareBtn.text('Invite');
    }
}

/**
 * removes the active class after a set period of time
 */
function fadeOutNotification(){
    setTimeout(function(){
        $notificationButton.removeClass('active');
    }, 2000);
}

// bind events
$shareBtn.on('click', shareLink);
$notificationButton.on('transitionend', fadeOutNotification);
