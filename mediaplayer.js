let mediaElements = document.querySelectorAll("audio[controls], video[controls]");
Array.prototype.forEach.call(mediaElements, (el) => {
  const media = el;
  media.removeAttribute("controls");
  media.setAttribute("preload", "metadatata");
  const options = { // quick way for disabling control elements
    playPauseButton: true,
    timeSlider: true,
    timeDisplay: true,
    muteButton: true,
    volumeSlider: true,
    fullScreenButton: true
  }
  const wrapper = document.createElement("div");
  wrapper.classList.add("basic-media-player");
  if (media.nodeName == "AUDIO") {
    wrapper.classList.add("audio-wrapper");
    wrapper.innerHTML += `<h1>Audio File</h1>`;
  } else if (media.nodeName == "VIDEO") {
    wrapper.classList.add("video-wrapper");
  }
  const parent = media.parentNode;        //
  const sibling = media.nextSibling;      //
  wrapper.append(media);                  // wrapping the media Element in the wrapper
  parent.insertBefore(wrapper, sibling);  //
  // media controls wrapper
  const mediaControls = document.createElement("div");
  mediaControls.classList.add("media-controls");
  wrapper.append(mediaControls);
  // playpause button
  const playpause = document.createElement('button');
  playpause.classList.add('playpause');
  playpause.innerHTML = 'play';
  if (options.fullScreenButton) mediaControls.append(playpause);
  playpause.addEventListener('click', () => {
    if (media.paused) {
      media.play();
    } else {
      media.pause();
    }
  });
  media.addEventListener('play', () => {
    playpause.innerHTML = 'pause';
  });
  media.addEventListener('pause', () => {
    playpause.innerHTML = 'play';
    styleTimeSlider();
  });
  // time slider
  const timeSlider = document.createElement('input');
  timeSlider.classList.add("time-slider");
  timeSlider.type = "range";
  timeSlider.value = 0;
  timeSlider.min = 0;
  timeSlider.max = 100;
  timeSlider.step = 0.05;
  const styleTimeSlider = () => {
    timeSlider.setAttribute("style", `--value:${timeSlider.value}%`);
  }
  styleTimeSlider();
  if (options.timeSlider) mediaControls.append(timeSlider);
  timeSlider.addEventListener('input', () => {
    media.pause();
    media.currentTime = timeSlider.value * 0.01 * media.duration;
    styleTimeSlider();
  });
  timeSlider.addEventListener('change', () => {
    media.play();
  });
  media.addEventListener('durationchange', () => {
    updateTimeDisplay();
  });
  media.addEventListener('timeupdate', () => {
    if (!media.paused) timeSlider.value = media.currentTime / media.duration * 100;
    styleTimeSlider();
    updateTimeDisplay();
  });
  media.addEventListener('ended', () => {
    timeSlider.value = 100;
    styleTimeSlider();
  });
  // time display
  const timeDisplay = document.createElement('div');
  timeDisplay.classList.add("time-display");
  if (options.timeDisplay) mediaControls.append(timeDisplay);
  const timeFormat = (s) => {
    let Seconds = Math.round(s) % 60;
    let Minutes = Math.round(s / 60);
    Seconds = (Seconds < 10 ? '0' : '') + Seconds;
    Minutes = (Minutes < 10 ? '0' : '') + Minutes;
    return `${Minutes}:${Seconds}`;
  }
  let showTimeLeft = true;
  const updateTimeDisplay = () => {
    if (showTimeLeft) {
      timeDisplay.innerHTML = "-" + timeFormat(media.duration - media.currentTime);
    } else {
      timeDisplay.innerHTML = timeFormat(media.currentTime);
    }
  }
  updateTimeDisplay();
  timeDisplay.addEventListener('click', () => {
    showTimeLeft = !showTimeLeft;
    updateTimeDisplay();
  });
  // mute button
  const mute = document.createElement('button');
  mute.classList.add('mute');
  mute.innerHTML = "mute";
  if (options.muteButton) mediaControls.append(mute);
  mute.addEventListener('click', () => {
    if (media.muted) {
      media.muted = false;
      mute.innerHTML = "mute";
    } else {
      media.muted = true;
      mute.innerHTML = "unmute";
    }
  });
  // volume Slider
  const volumeSlider = document.createElement('input');
  volumeSlider.classList.add("volume-slider");
  volumeSlider.type = "range";
  volumeSlider.value = 1;
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.step = 0.05;
  if (options.volumeSlider) mediaControls.append(volumeSlider);
  volumeSlider.setAttribute("style", `--value:100%`);
  volumeSlider.addEventListener('input', () => {
    media.volume = volumeSlider.value;
    volumeSlider.setAttribute("style", `--value:${volumeSlider.value * 100}%`);
  });
  if (media.nodeName == "VIDEO") {
    // idleMouse
    let idleMouseTimer;
    wrapper.addEventListener('mousemove', () => {
      wrapper.classList.remove("idle");
      clearTimeout(idleMouseTimer);
      if (!media.paused) {
        idleMouseTimer = setTimeout(function () {
          wrapper.classList.add("idle")
        }, 1000);
      }
    });
    // playpause when clicking on video
    media.addEventListener('click', () => {
      if (media.paused) {
        media.play();
      } else {
        media.pause();
      }
    });
    // fullScreen
    if ((wrapper.requestFullscreen || wrapper.webkitRequestFullscreen) && options.fullScreenButton) {
      const fullScreen = document.createElement('button');
      fullScreen.classList.add('fullscreen');
      fullScreen.innerHTML = "fullscreen";
      mediaControls.append(fullScreen);
      fullScreen.addEventListener('click', () => {
        toggleFullScreen();
      });
      media.addEventListener('dblclick', () => {
        toggleFullScreen();
      });
      let fullscreenFlag = false;

      function toggleFullScreen() {
        if (wrapper.requestFullscreen) {
          if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
          } else {
            document.exitFullscreen().then(() => {
              wrapper.scrollIntoView();
            });
          }
        } else if (wrapper.webkitRequestFullscreen) { // Safari
          if (!fullscreenFlag) {
            wrapper.webkitRequestFullscreen();
            fullscreenFlag = true;
          } else {
            document.webkitExitFullscreen();
            fullscreenFlag = false;
          }
        }
      }
    }
  }
});