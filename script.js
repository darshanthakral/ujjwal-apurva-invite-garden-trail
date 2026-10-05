(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  const cfg = window.WEDDING_CONFIG || {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = $('readingProgress'), topbar = $('topbar');
  let scrollPending = false;
  function onScroll() {
    if(scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (range ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0) + '%';
      topbar.classList.toggle('scrolled', window.scrollY > 30);
      scrollPending = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  if('IntersectionObserver' in window && !motion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for(const entry of entries) if(entry.isIntersecting) {entry.target.classList.add('is-visible'); observer.unobserve(entry.target);}
    }, {rootMargin:'0px 0px -32px 0px', threshold:0.07});
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

  // Countdown uses explicit ISO date-time with +05:30 timezone. It is NOT based on browser locale.
  const deadline = Date.parse(cfg.eventStartISO || '2026-11-28T00:00:00+05:30');
  function renderCountdown(){
    if(!Number.isFinite(deadline)) {$('countdown').hidden = true; $('countdownEnded').hidden = false;return;}
    let rem = Math.max(0, deadline - Date.now());
    if(rem === 0){$('countdown').hidden = true; $('countdownEnded').hidden = false;return;}
    const days = Math.floor(rem/86400000);rem %= 86400000;
    const hrs = Math.floor(rem/3600000);rem %= 3600000;
    const mins = Math.floor(rem/60000);rem %= 60000;
    const secs = Math.floor(rem/1000);
    $('days').textContent=String(days).padStart(2,'0');
    $('hours').textContent=String(hrs).padStart(2,'0');
    $('minutes').textContent=String(mins).padStart(2,'0');
    $('seconds').textContent=String(secs).padStart(2,'0');
  }
  renderCountdown();const tick=setInterval(() => {renderCountdown();if(Date.now()>=deadline)clearInterval(tick);},1000);

  // User-requested dates only. A proper all-day iCalendar event ends EXCLUSIVELY on 1 December.
  $('calendarBtn').addEventListener('click', () => {
    const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Apurwal//Save The Date//EN',
      'CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
      'UID:ujjwal-apurva-wedding-20261128@apurwal.in',
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,
      `DTSTART;VALUE=DATE:${cfg.calendarStartDate || '20261128'}`,
      `DTEND;VALUE=DATE:${cfg.calendarExclusiveEndDate || '20261201'}`,
      'SUMMARY:Ujjwal & Apurva - Wedding Celebrations',
      'DESCRIPTION:Save the Date! Ganesh Sthapana (28 Nov)\\nHasta Melap (29 Nov)\\nReception (30 Nov). With love from the Jani and Wanjari families. Nagpur, India. More details will come with the formal invitation.',
      'STATUS:CONFIRMED','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob=new Blob([text],{type:'text/calendar;charset=utf-8'});
    const href=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=href;a.download='Ujjwal-Apurva-Save-the-Date.ics';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),2000);
    feedback('Save-the-date calendar card downloaded.');
  });
  let feedbackTimer;
  function feedback(s){const el=$('actionFeedback'); if(!el) return; el.textContent=s; clearTimeout(feedbackTimer); feedbackTimer=setTimeout(()=>el.textContent='',5000);}

  // The first gesture on the invitation requests Spotify playback. Spotify and browser
  // policies may still refuse; the official embedded player always remains available.
  const toggle = $('musicToggle'), panel = $('musicPanel'), close = $('closeMusic'), slot = $('musicSlot');
  const status = $('musicStatus'), gate = $('welcomeGate');
  const spotifyTracks = Array.isArray(cfg.spotifyTracks)
    ? cfg.spotifyTracks.filter(t => /^[A-Za-z0-9]{22}$/.test(t.spotifyId)) : [];
  const initialIndex = Math.max(0, spotifyTracks.findIndex(t => t.spotifyId === cfg.defaultSpotifyId));
  let selectedIndex = initialIndex;
  let playerController = null;
  let playerReady = false;
  let sdkInitialized = false;
  let pendingEntrancePlay = false;
  let playbackConfirmed = false;
  let requestTimer = null;
  let fallbackTimer = null;
  let playerHost = null;
  let selectedLink = null;
  let playSelected = null;
  const songButtons = [];

  function spotifyUri(track) { return 'spotify:track:' + track.spotifyId; }
  function setStatus(message) { if (status) status.textContent = message; }
  function setPlaying(playing) {
    toggle.classList.toggle('is-playing', !!playing);
    toggle.setAttribute('aria-label', playing ? 'Wedding music is playing; choose a song' : 'Open wedding music');
    const text = toggle.querySelector('.music-text');
    if (text) text.textContent = playing ? 'PLAYING' : 'MUSIC';
  }
  function setSelected(index) {
    selectedIndex = index;
    const track = spotifyTracks[index];
    if (!track) return;
    selectedLink.href = 'https://open.spotify.com/track/' + track.spotifyId;
    songButtons.forEach((button, j) => {
      button.classList.toggle('active', j === index);
      button.setAttribute('aria-pressed', String(j === index));
    });
    if (playerReady && playerController) {
      playbackConfirmed = false;
      setPlaying(false);
      playerController.loadEntity(spotifyUri(track));
    } else if (playerHost && !sdkInitialized) {
      mountDirectPlayer(track);
    }
    setStatus('Selected: ' + track.label + '. Press Play if Spotify does not start.');
  }
  function mountDirectPlayer(track) {
    if (!playerHost) return;
    playerHost.replaceChildren();
    const iframe = document.createElement('iframe');
    iframe.src = 'https://open.spotify.com/embed/track/' + track.spotifyId + '?utm_source=generator&theme=0';
    iframe.title = track.label + ' on Spotify';
    iframe.loading = 'eager';
    iframe.height = '152';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    playerHost.append(iframe);
    if (playSelected) playSelected.hidden = true;
  }
  function revealPlayerFallback() {
    if (playbackConfirmed || gate && !gate.hidden) return;
    setStatus('Your browser or Spotify needs one more tap. Press Play in the Spotify player below.');
    showMusic(true, false);
  }
  function requestPlay() {
    if (playerReady && playerController) {
      try {
        setStatus('Opening ' + spotifyTracks[selectedIndex].label + ' on Spotify…');
        playerController.play();
      } catch (_error) { revealPlayerFallback(); }
    } else {
      pendingEntrancePlay = true;
      setStatus('Spotify is loading. If it stays silent, use the player below.');
    }
  }
  function createMusicInterface() {
    if (!spotifyTracks.length) {
      slot.textContent = 'The wedding playlist will be available shortly.';
      return;
    }
    const heading = document.createElement('p');
    heading.className = 'song-selector-heading'; heading.textContent = 'Choose a song'; slot.append(heading);
    const list = document.createElement('div');
    list.className = 'song-selector'; list.setAttribute('role','group');
    list.setAttribute('aria-label','Choose a Spotify wedding song'); slot.append(list);
    spotifyTracks.forEach((track, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'song-select-btn';
      const title = document.createElement('span');
      title.className = 'song-title'; title.textContent = track.label;
      const mood = document.createElement('span');
      mood.className = 'song-mood'; mood.textContent = track.mood;
      button.append(title, mood);
      button.addEventListener('click', () => {
        setSelected(i);
        // A song choice remains optional. Native Spotify controls are the reliable fallback.
      });
      list.append(button); songButtons.push(button);
    });
    playSelected = document.createElement('button');
    playSelected.type = 'button'; playSelected.className = 'music-play-button';
    playSelected.textContent = '▶ Play selected song';
    playSelected.addEventListener('click', requestPlay);
    slot.append(playSelected);
    playerHost = document.createElement('div');
    playerHost.className = 'spotify-player-host';
    playerHost.setAttribute('aria-label', 'Spotify wedding song player');
    slot.append(playerHost);
    const link = document.createElement('a');
    link.className = 'spotify-open-link'; link.target = '_blank';
    link.rel = 'noopener noreferrer'; link.textContent = 'Open song on Spotify ↗';
    slot.append(link); selectedLink = link;
    // Update selection without reconstructing the Spotify controller.
    selectedLink.href = 'https://open.spotify.com/track/' + spotifyTracks[selectedIndex].spotifyId;
    songButtons[selectedIndex].classList.add('active');
    songButtons[selectedIndex].setAttribute('aria-pressed','true');
    // A direct embed appears immediately; the Spotify SDK replaces it if it loads.
    mountDirectPlayer(spotifyTracks[selectedIndex]);
    loadSpotifySDK();
  }
  function loadSpotifySDK() {
    window.onSpotifyIframeApiReady = (api) => {
      if (!playerHost || sdkInitialized) return;
      sdkInitialized = true;
      playerHost.replaceChildren();
      try {
        api.createController(playerHost, {
          uri: spotifyUri(spotifyTracks[selectedIndex]),
          width: '100%', height: 152
        }, (controller) => {
          playerController = controller;
          playerReady = true;
          if (playSelected) playSelected.hidden = false;
          controller.addListener('playback_started', () => {
            playbackConfirmed = true;
            pendingEntrancePlay = false;
            if (requestTimer) clearTimeout(requestTimer);
            setPlaying(true);
            setStatus('Now playing: ' + spotifyTracks[selectedIndex].label);
          });
          controller.addListener('playback_update', event => {
            if (!event || !event.data) return;
            if (event.data.isPaused) setPlaying(false);
            else if (!event.data.isBuffering) {
              playbackConfirmed = true;
              if (requestTimer) clearTimeout(requestTimer);
              setPlaying(true);
            }
          });
          if (pendingEntrancePlay) {
            pendingEntrancePlay = false;
            requestPlay();
          }
        });
      } catch (_error) {
        sdkInitialized = false;
        mountDirectPlayer(spotifyTracks[selectedIndex]);
      }
    };
    const sdkScript = document.createElement('script');
    sdkScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
    sdkScript.async = true;
    sdkScript.onerror = () => {
      sdkInitialized = false;
      mountDirectPlayer(spotifyTracks[selectedIndex]);
      setStatus('Spotify can still be played directly from its player below.');
    };
    document.body.append(sdkScript);
  }
  function showMusic(show, focus = true) {
    panel.hidden = !show;
    toggle.setAttribute('aria-expanded', String(show));
    if (show && focus) close.focus();
    else if (!show && focus) toggle.focus();
  }
  createMusicInterface();
  toggle.addEventListener('click', () => showMusic(panel.hidden));
  close.addEventListener('click', () => showMusic(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) showMusic(false);
    // Keep keyboard focus inside the first-visit entrance dialog.
    if (event.key === 'Tab' && gate && !gate.hidden) {
      const first = $('enterWithMusic'); const last = $('enterQuietly');
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) {
      showMusic(false, false);
    }
  });

  function enterInvitation(withMusic) {
    if (gate.hidden) return;
    if (withMusic && spotifyTracks.length) {
      setSelected(initialIndex);
      pendingEntrancePlay = true;
      // A direct, synchronous play call within the visitor's gesture is the best attempt.
      if (playerReady) { pendingEntrancePlay = false; requestPlay(); }
    }
    gate.classList.add('is-leaving');
    document.documentElement.classList.add('invitation-entered');
    document.body.classList.remove('entrance-locked');
    $('enterWithMusic').disabled = true; $('enterQuietly').disabled = true;
    window.setTimeout(() => {
      gate.hidden = true;
      // If Spotify took longer than the entrance animation, retry when ready.
      if (withMusic && pendingEntrancePlay && playerReady) {
        pendingEntrancePlay = false; requestPlay();
      }
      if (withMusic) {
        requestTimer = window.setTimeout(revealPlayerFallback, 4700);
      }
    }, motion.matches ? 0 : 540);
  }
  if (gate) {
    document.body.classList.add('entrance-locked');
    $('enterWithMusic').addEventListener('click', () => enterInvitation(true));
    $('enterQuietly').addEventListener('click', () => enterInvitation(false));
    $('enterWithMusic').focus({ preventScroll: true });
  } else document.documentElement.classList.add('invitation-entered');
})();
