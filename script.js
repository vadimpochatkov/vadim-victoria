// ============================================================
//  ВАДИМ И ВИКТОРИЯ — СВАДЕБНОЕ ПРИГЛАШЕНИЕ
//  1. Музыка
//  2. Открытие приглашения
//  3. Вертикальный слайдер
//  4. Обратный отсчёт до 24 июля 2027, 16:00
// ============================================================
(function () {
    'use strict';

    var $ = function (selector, root) {
        return (root || document).querySelector(selector);
    };

    var splash = $('#splash');
    var enterBtn = $('#enterBtn');
    var mainContent = $('#mainContent');
    var music = $('#bgMusic');
    var soundToggle = $('#soundToggle');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var swiper = null;
    var countdownId = null;
    var opened = false;

    // ------------------------------------------------------------
    // 1. МУЗЫКА
    // ------------------------------------------------------------
    function paintSoundUI(isPlaying) {
        soundToggle.classList.toggle('is-playing', isPlaying);
        soundToggle.setAttribute('aria-pressed', String(isPlaying));
        soundToggle.setAttribute('aria-label', isPlaying ? 'Выключить музыку' : 'Включить музыку');
    }

    function playMusic() {
        var attempt = music.play();

        if (attempt && typeof attempt.then === 'function') {
            attempt
                .then(function () { paintSoundUI(true); })
                .catch(function () { paintSoundUI(false); });
        } else {
            paintSoundUI(true);
        }
    }

    function toggleMusic() {
        if (music.paused) {
            playMusic();
        } else {
            music.pause();
            paintSoundUI(false);
        }
    }

    music.addEventListener('play', function () { paintSoundUI(true); });
    music.addEventListener('pause', function () { paintSoundUI(false); });
    soundToggle.addEventListener('click', toggleMusic);

    // ------------------------------------------------------------
    // 2. ОТКРЫТИЕ ПРИГЛАШЕНИЯ
    // ------------------------------------------------------------
    function openInvitation() {
        if (opened) return;
        opened = true;

        playMusic();
        mainContent.hidden = false;
        soundToggle.hidden = false;
        document.body.classList.add('is-open');

        initSwiper();
        startCountdown();

        splash.classList.add('is-hidden');
        window.setTimeout(function () {
            splash.hidden = true;
        }, 1100);
    }

    enterBtn.addEventListener('click', openInvitation);

    // ------------------------------------------------------------
    // 3. ВЕРТИКАЛЬНЫЙ СЛАЙДЕР
    // ------------------------------------------------------------
    function initSwiper() {
        if (swiper) return;

        // Если Swiper не загрузился (нет интернета), оставляем
        // сайт работоспособным: обычная вертикальная прокрутка.
        if (typeof Swiper === 'undefined') {
            document.body.classList.add('no-swiper');
            return;
        }

        try {
            swiper = new Swiper('.mySwiper', {
                direction: 'vertical',
                slidesPerView: 1,
                spaceBetween: 0,
                speed: reduceMotion ? 0 : 850,
                resistanceRatio: 0.7,
                grabCursor: true,
                mousewheel: {
                    forceToAxis: true,
                    sensitivity: 1,
                    thresholdDelta: 12
                },
                keyboard: {
                    enabled: true,
                    onlyInViewport: true
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                },
                a11y: {
                    enabled: true,
                    paginationBulletMessage: 'Слайд {{index}}'
                }
            });
        } catch (error) {
            // Резервный вариант: обычная прокрутка страницы
            document.body.classList.add('no-swiper');
            return;
        }

        var scrollButtons = document.querySelectorAll('[data-scroll-next]');
        for (var i = 0; i < scrollButtons.length; i++) {
            scrollButtons[i].addEventListener('click', function () {
                swiper.slideNext();
            });
        }
    }

    // ------------------------------------------------------------
    // 4. ОБРАТНЫЙ ОТСЧЁТ
    //    Дата свадьбы: 24 июля 2027, 16:00 (местное время)
    // ------------------------------------------------------------
    function startCountdown() {
        if (countdownId) return;

        var target = new Date(2027, 6, 24, 16, 0, 0).getTime();
        var box = $('#countdown');
        if (!box) return;

        var fields = {
            days: $('#days'),
            hours: $('#hours'),
            minutes: $('#minutes'),
            seconds: $('#seconds')
        };

        function pad(value) {
            return String(value).padStart(2, '0');
        }

        function tick() {
            var diff = target - Date.now();

            if (diff <= 0) {
                window.clearInterval(countdownId);
                countdownId = null;
                box.innerHTML = '<p class="countdown-done">Сегодня тот самый день ✨</p>';
                return;
            }

            fields.days.textContent = pad(Math.floor(diff / 86400000));
            fields.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
            fields.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
            fields.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
        }

        tick();
        countdownId = window.setInterval(tick, 1000);
    }
})();
