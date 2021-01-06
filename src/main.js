var gui = new dat.GUI({
    name: 'options'
  });

let options = null;
var options1 = {
  decreasePresenceSpeed: 0.8,
  increasePresenceSpeed: 2.3,
  minPlaybackSpeed: 0.325,
  maxPlaybackSpeed: 1,
  minOverlayOpacity: 0,
  maxOverlayOpacity: 1,
  presenceDebounceDelay: 0.2
};
for (let id in options1) {
  if (localStorage.getItem(id + "1")) {
    options1[id] = parseFloat(localStorage.getItem(id + "1"));
  }
}

function writeOptions1() {
  for (let id in options1) {
    localStorage.setItem(id + "1", options1[id]);
  }
}
var options2 = {
  decreasePresenceSpeed: 0.8,
  increasePresenceSpeed: 2.3,
  minPlaybackSpeed: 0.325,
  maxPlaybackSpeed: 1,
  minOverlayOpacity: 0,
  maxOverlayOpacity: 1,
  presenceDebounceDelay: 0.2
};
for (let id in options2) {
  if (localStorage.getItem(id + "2")) {
    options2[id] = parseFloat(localStorage.getItem(id + "2"));
  }
}

function writeOptions2() {
  for (let id in options2) {
    localStorage.setItem(id + "2", options2[id]);
  }
}

var folder1 = gui.addFolder('set 1 options');
folder1.add(options1, "increasePresenceSpeed", 0, 10).onChange(writeOptions1);
folder1.add(options1, "decreasePresenceSpeed", 0, 10).onChange(writeOptions1);

folder1.add(options1, "minPlaybackSpeed", 0, 3).onChange(writeOptions1);
folder1.add(options1, "maxPlaybackSpeed", 0, 3).onChange(writeOptions1);
folder1.add(options1, "minOverlayOpacity", 0, 1).onChange(writeOptions1);
folder1.add(options1, "maxOverlayOpacity", 0, 1).onChange(writeOptions1);

folder1.add(options1, "presenceDebounceDelay", 0, 10).onChange(writeOptions1);

var folder2 = gui.addFolder('set 2 options');
folder2.add(options2, "increasePresenceSpeed", 0, 10).onChange(writeOptions2);
folder2.add(options2, "decreasePresenceSpeed", 0, 10).onChange(writeOptions2);

folder2.add(options2, "minPlaybackSpeed", 0, 3).onChange(writeOptions2);
folder2.add(options2, "maxPlaybackSpeed", 0, 3).onChange(writeOptions2);
folder2.add(options2, "minOverlayOpacity", 0, 1).onChange(writeOptions2);
folder2.add(options2, "maxOverlayOpacity", 0, 1).onChange(writeOptions2);

folder2.add(options2, "presenceDebounceDelay", 0, 10).onChange(writeOptions2);

function setupInput(id) {
  if (localStorage.getItem(id)) {
    document.getElementById(id).value = localStorage.getItem(id);
  }
  document.getElementById(id).addEventListener('change', (event) => {
    localStorage.setItem(id, event.target.value);
  });
}

for (let v of['v0name1', 'v1name1', 'v0name2', 'v1name2']) {
  setupInput(v);
}

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      const option = document.createElement('button');
      option.innerHTML = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      option.onclick = () => {
        options = options1;
        button_callback(deviceInfo.deviceId,
          document.getElementById("v0name1").value,
          document.getElementById("v1name1").value);
      };
      document.getElementById("options").appendChild(option);

      const option2 = document.createElement('button');
      option2.innerHTML = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      option2.onclick = () => {
        options = options2;
        button_callback(deviceInfo.deviceId,
          document.getElementById("v0name2").value,
          document.getElementById("v1name2").value);
      };
      document.getElementById("options2").appendChild(option2);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

let initialized = false;
function button_callback(deviceId, v0name, v1name) {
  if (!initialized) {
    let fullscreen = {
      clickToFullscreen: () => {
        document.getElementById('videos').requestFullscreen()
      },
    };
    gui.add(fullscreen, "clickToFullscreen");
  }

  picoSetup(deviceId);

  let videoContainer = document.getElementById("videos");

  v0 = document.createElement("VIDEO");
  v0.setAttribute("src", "videos/" + v0name);
  v0.setAttribute("id", "video0");

  v1 = document.createElement("VIDEO");
  v1.setAttribute("src", "videos/" + v1name);
  v1.setAttribute("id", "video1");

  for (let v of[v0, v1]) {
    v.setAttribute("class", "cb_video");
    v.setAttribute("autoplay", "autoplay");
    v.setAttribute("loop", "loop");
    videoContainer.appendChild(v);
  }

  requestAnimationFrame(updateVideo);
}

let currentPresence = 0;
let presenceDebounceCounter = 0;

let previousTime = Date.now();

function updateVideo() {
  let currentTime = Date.now();
  let dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  if (v0.currentTime - v1.currentTime > .05) {
    v1.currentTime = v0.currentTime;
  }
  if (typeof dets !== 'undefined') {
    // if (dets.length > 0) {
    //   v1.style.opacity = 1;

    //   v0.playbackRate = 1;
    //   v1.playbackRate = 1;
    // } else {
    //   v1.style.opacity = 0;
    //   v0.playbackRate = .4;
    //   v1.playbackRate = .4;
    // }
    if (dets.length > 0) {
      presenceDebounceCounter = options.presenceDebounceDelay;
    } else if (presenceDebounceCounter > 0) {
      presenceDebounceCounter -= dt;
    }

    if (presenceDebounceCounter > 0) {
      currentPresence += dt * options.increasePresenceSpeed;
    } else {
      currentPresence -= dt * options.decreasePresenceSpeed;
    }
    currentPresence = Math.min(currentPresence, 1);
    currentPresence = Math.max(currentPresence, 0);

    v0.playbackRate = v1.playbackRate = (options.minPlaybackSpeed + (options.maxPlaybackSpeed - options.minPlaybackSpeed) * currentPresence);
    v1.style.opacity = (options.minOverlayOpacity + (options.maxOverlayOpacity - options.minOverlayOpacity) * currentPresence);
  }

  requestAnimationFrame(updateVideo);
}
