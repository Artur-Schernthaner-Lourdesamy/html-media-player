HTMLElement.prototype.wrap = function (elms) {
  // Convert `elms` to an array, if necessary.
  if (!elms.length) elms = [elms];

  // Loops backwards to prevent having to clone the wrapper on the
  // first element (see `child` below).
  for (var i = elms.length - 1; i >= 0; i--) {
    var child = (i > 0) ? this.cloneNode(true) : this;
    var el = elms[i];

    // Cache the current parent and sibling.
    var parent = el.parentNode;
    var sibling = el.nextSibling;

    // Wrap the element (is automatically removed from its current
    // parent).
    child.appendChild(el);

    // If the element had a sibling, insert the wrapper before
    // the sibling to maintain the HTML structure; otherwise, just
    // append it to the parent.
    if (sibling) {
      parent.insertBefore(child, sibling);
    } else {
      parent.appendChild(child);
    }
  }
};

let mediaElements = document.querySelectorAll("audio[controls], video[controls]");
Array.prototype.forEach.call(mediaElements, function (el) {
  const media = el;
  media.removeAttribute("controls");
  media.setAttribute("preload", "metadatata");
  const wrapper = document.createElement("div");
  wrapper.classList.add("basic-media-player");
  if (media.nodeName == "AUDIO") {
    wrapper.classList.add("audio-wrapper");
    wrapper.wrap(media);
    wrapper.innerHTML += `<h1>Audio File</h1>`;
  } else if (media.nodeName == "VIDEO") {
    wrapper.classList.add("video-wrapper");
    wrapper.wrap(media);
  }
  // media controls wrapper
  const mediaControls = document.createElement("div");
  mediaControls.classList.add("media-controls");
  wrapper.appendChild(mediaControls);
  // playpause button
  const playpause = document.createElement('button');
  playpause.classList.add('playpause');
  playpause.innerHTML = 'play';
  mediaControls.appendChild(playpause);
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
  mediaControls.appendChild(timeSlider);
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
  mediaControls.appendChild(timeDisplay);
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
  mediaControls.appendChild(mute);
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
  mediaControls.appendChild(volumeSlider);
  volumeSlider.setAttribute("style", `--value:100%`);
  volumeSlider.addEventListener('input', () => {
    media.volume = volumeSlider.value;
    volumeSlider.setAttribute("style", `--value:${volumeSlider.value * 100}%`);
  });
  if (media.nodeName = "VIDEO") {
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
    if ((wrapper.requestFullscreen || wrapper.webkitRequestFullscreen) && media.hasAttribute("allowfullscreen")) {
      const fullScreen = document.createElement('button');
      fullScreen.classList.add('fullscreen');
      fullScreen.innerHTML = "fullscreen";
      mediaControls.appendChild(fullScreen);
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