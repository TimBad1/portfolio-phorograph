import i18Obj from './translate.js';

document.addEventListener('DOMContentLoaded', () => {

  function getLocalStorage() {
    if(localStorage.getItem('lang')) {
      const lang = localStorage.getItem('lang');

      document.querySelectorAll('.lang__button').forEach(btn => btn.classList.remove('is-active'));
      document.querySelector(`[data-lang="${lang}"]`).classList.add('is-active');

      getTranslate(lang);
    }

    if(localStorage.getItem('theme')) {
      const theme = localStorage.getItem('theme');

      if (theme === 'light') {
        document.body.classList.add('light');
      }
    }
  }
  window.addEventListener('load', getLocalStorage)

// BURGER
  const burgerButton = document.getElementById('burger');
  const burgerMenu = document.getElementById('menu');
  const headerBlock = document.querySelector('header');

  const toggleMenu = () => {
    document.body.classList.toggle('lock');
    burgerButton.classList.toggle('open');
    burgerMenu.classList.toggle('open');
    headerBlock.classList.toggle('open');
  }

  burgerButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  })


  document.addEventListener('click', (event) => {
    if(document.body.classList.contains('lock')) {
      const target = event.target;
      const its_menu = target == burgerMenu || burgerMenu.contains(target);
      const its_btnMenu = target == burgerButton;
      const menu_is_active = burgerMenu.classList.contains('open');
      const navItem = target.classList.contains('nav__link');

      if (!its_menu && !its_btnMenu && menu_is_active || navItem) {
          toggleMenu();
      }
    }
  });

  // SCROLL
  const anchors = document.querySelectorAll('a[href*="#"]');

	for (let anchor of anchors) {
		anchor.addEventListener('click', function (e) {
			e.preventDefault()

			const blockID = anchor.getAttribute('href').substring(1)

			document.getElementById(blockID).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
			})
		})
	};

  // Portfolio TABs
  const portfolioBtn = document.querySelectorAll('.portfolio__button');
  const portfolioImages  = document.querySelectorAll('.portfolio__img');

  portfolioBtn.forEach(btn => {
    btn.addEventListener('click', function(event) {
      const season = event.currentTarget.dataset.season;
      const button = event.target;

      if (!button.classList.contains('is-active')) {
        portfolioImages.forEach((img, index) => img.src = `./assets/img/portfolio/${season}/${index + 1}.jpg`);
        portfolioBtn.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
      }
    })
  })

  // TRANSLATE
  const translateBtn = document.querySelectorAll('button.lang__button');

  translateBtn.forEach(btn => {
    btn.addEventListener('click', function(event) {
      const language = event.currentTarget.dataset.lang;

      const button = event.target;

      if(!button.classList.contains('is-active')) {
        translateBtn.forEach(btn => btn.classList.remove('is-active'));

        button.classList.add('is-active');

        getTranslate(language);

        localStorage.setItem('lang', event.currentTarget.dataset.lang)
      }
    })
  })

  function getTranslate(language) {
    document.querySelectorAll(`[data-i18]`).forEach(item => {
      if(item.placeholder) {
        item.placeholder = i18Obj[language][item.dataset.i18];
      } else {
        item.textContent = i18Obj[language][item.dataset.i18];
      }
    })
  }

  // THEME
  const themeBtn = document.getElementById('light-theme');

  themeBtn.addEventListener('click', function(event) {
    document.body.classList.toggle('light');

    if (document.body.classList.contains('light')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
  })

  // PLAYER
  const videoWrap = document.getElementById('player');
  const myVideo = videoWrap.querySelector('video');
  const playBigBtn = videoWrap.querySelector('.play-btn');
  const playBtn = videoWrap.querySelector('.player__button.play');
  const volumeBtn = videoWrap.querySelector('.player__button.volume');
  const volumeControl = videoWrap.querySelector('.player__slider[name="volume"]');
  const controlSkip = videoWrap.querySelectorAll('.player__button[data-skip]');
  const progressBar = videoWrap.querySelector('.progress__filled');
  const controlProgress = videoWrap.querySelector('.progress');
  const fullScreenBtn = videoWrap.querySelector('.player__button.fullscreen');
  const currTime = videoWrap.querySelector('.current-time');
  const allTime = videoWrap.querySelector('.all-time')

  let drag;
  let grap;

  myVideo.addEventListener('click', getTogglePlay);
  playBtn.addEventListener('click', getTogglePlay);
  volumeControl.addEventListener('change', updateVolume);
  volumeBtn.addEventListener('click', getToggleVolume);
  controlSkip.forEach(control => control.addEventListener('click', forward));
  fullScreenBtn.addEventListener('click', goFullScreen);
  controlProgress.addEventListener('mouseover', function(){drag = true});
  controlProgress.addEventListener('mouseout', function(){drag = false; grap = false});
  controlProgress.addEventListener('mousedown', function(){grap = drag});
  controlProgress.addEventListener('mouseup', function(){grap = false});
  controlProgress.addEventListener('click', updateCurrentPos);
  controlProgress.addEventListener('mousemove', function(e){ if(drag && grap){updateCurrentPos(e)}});

  let progression;

  function getToggleVolume() {
    volumeBtn.classList.toggle('mute');
    volumeBtn.classList.contains('mute')
      ? myVideo.muted = true
      : myVideo.muted = false;
  }

  function updateVolume() {
    let volume = this.value;
    myVideo.volume = volume;

    if (volume == 0) {
      volumeBtn.classList.add('mute');
      myVideo.muted = true
    } else {
      volumeBtn.classList.remove('mute');
      myVideo.muted = false;
    }
  }

  function goFullScreen(){
    console.dir(myVideo);
    if(myVideo.webkitSupportsFullscreen) myVideo.webkitEnterFullScreen();
  }

  playBigBtn.addEventListener('click', function() {
    getTogglePlay();
    playBigBtn.style.display = 'none';
  })

  function getTogglePlay() {
    if(myVideo.paused) {
      myVideo.play();
      playBigBtn.style.display = 'none';
      playBtn.classList.remove('paused');
      updateProgress();
      progression = window.setInterval(updateProgress, 200);
    } else {
      myVideo.pause();
      playBigBtn.style.display = 'block';
      playBtn.classList.add('paused');

      clearInterval(progression);
    }
  }

  function forward(){
    var value = Number(this.dataset.skip);
    myVideo.currentTime = myVideo.currentTime + value;
  }

  function updateProgress() {
    let progress = myVideo.currentTime / myVideo.duration;
    progressBar.style.flexBasis = Math.floor(progress * 1000) / 10 + '%';
    currTime.textContent = videoTime(myVideo.currentTime);
    allTime.textContent = videoTime(myVideo.duration);
  }

  function updateCurrentPos(e){
    let newProgress = (e.clientX - ((document.body.offsetWidth - myVideo.offsetWidth) / 2)- controlProgress.offsetLeft) / controlProgress.clientWidth;
    progressBar.style.flexBasis = Math.floor(newProgress * 1000) / 10 + '%';
    myVideo.currentTime = newProgress * myVideo.duration;
  }

  function videoTime(time) {
    time = Math.floor(time);
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    let minutesVal = minutes;
    let secondsVal = seconds;

    if(minutes < 10) {
      minutesVal = '0' + minutes;
    }

    if(seconds < 10) {
      secondsVal = '0' + seconds;
    }

    return minutesVal + ':' + secondsVal;
  }

  for (let e of document.querySelectorAll('input[type="range"].slider-progress')) {
    e.style.setProperty('--value', e.value);
    e.style.setProperty('--min', e.min == '' ? '0' : e.min);
    e.style.setProperty('--max', e.max == '' ? '100' : e.max);
    e.addEventListener('input', () => e.style.setProperty('--value', e.value));
  }
})
