
"use client";
import { useEffect } from 'react';

export default function ClientScript() {
  useEffect(() => {
    // Add missing ChatWidget dependencies or mock them if they throw
    try {
      
  (function(){
    try{
      var IS_DEMO = (window.__IS_DEMO !== undefined ? window.__IS_DEMO : "{{IS_DEMO_JS}}" === "true");
      var form = document.getElementById('contactForm');
      if(form){
        form.addEventListener('submit', function(e){
          if(IS_DEMO){
            e.preventDefault();
            var submitBtn = document.getElementById('formSubmitBtn');
            if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Gönderiliyor...'; }
            setTimeout(function(){
              form.style.display = 'none';
              var msg = document.getElementById('formMsg');
              msg.innerHTML = '<div class="form-success">'
                + '<div class="form-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16 9.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
                + '<h4>Mesajınız alındı!</h4>'
                + '<p>Bu bir örnek sitedir. Gerçek siteniz canlıya alındığında mesajlar antrenörün e-postasına doğrudan iletilir &mdash; genellikle 1 iş günü içinde dönüş yapılır.</p>'
                + '</div>';
            }, 800);
          }
          // IS_DEMO false iken Formspree/action URL'e gönderim yapılır
        });
      }
    }catch(err){}
  })();

  (function(){
    try{
      var slides = document.querySelectorAll('.hero-frame .hero-photo');
      var dots = document.querySelectorAll('.hero-dots button');
      if(slides.length < 2) return;
      var idx = 0;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function goTo(n){
        slides[idx].classList.remove('active');
        if(dots[idx]) dots[idx].classList.remove('active');
        idx = n % slides.length;
        slides[idx].classList.add('active');
        if(dots[idx]) dots[idx].classList.add('active');
      }
      dots.forEach(function(dot, i){
        dot.addEventListener('click', function(){ goTo(i); });
      });
      if(!reduceMotion){
        setInterval(function(){ goTo((idx + 1) % slides.length); }, 4500);
      }
    }catch(err){}
  })();

  (function(){
    try{
      var tabs = document.querySelectorAll('#teamTabs .tab');
      var cards = document.querySelectorAll('.team-card');
      tabs.forEach(function(tab){
        tab.addEventListener('click', function(){
          tabs.forEach(function(t){ t.classList.remove('active'); });
          cards.forEach(function(c){ c.classList.remove('focus'); });
          tab.classList.add('active');
          var target = document.getElementById(tab.getAttribute('data-target'));
          if(target){ target.classList.add('focus'); }
        });
      });
    }catch(err){}
  })();

  (function(){
    try{
      var TRAINER_NAME = '{{TRAINER_NAME}}';
      var TRAINER_FIRST = '{{TRAINER_FIRST_NAME}}';
      var TRAINER_BRANCH = '{{TRAINER_BRANCH}}';

      var fab = document.getElementById('chatFab');
      var panel = document.getElementById('chatPanel');
      var closeBtn = document.getElementById('chatCloseBtn');
      var body = document.getElementById('chatBody');
      var input = document.getElementById('chatInput');
      var sendBtn = document.getElementById('chatSendBtn');
      var quick = document.getElementById('chatQuick');
      console.log('Chatbot init:', {fab, panel, body, input, sendBtn});
      if(!fab || !panel || !body || !input || !sendBtn) {
         console.warn('Chatbot elements missing, aborting init');
         return;
      }
      
      if(fab.hasAttribute('data-chat-init')) return;
      fab.setAttribute('data-chat-init', 'true');

      var greeted = false;
      var typingEl = null;

      function scrollToEnd(){ body.scrollTop = body.scrollHeight; }

      function addMsg(text, who){
        var el = document.createElement('div');
        el.className = 'chat-msg ' + who;
        el.textContent = text;
        body.appendChild(el);
        scrollToEnd();
        return el;
      }

      function showTyping(){
        typingEl = document.createElement('div');
        typingEl.className = 'chat-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(typingEl);
        scrollToEnd();
      }
      function hideTyping(){
        if(typingEl && typingEl.parentNode){ typingEl.parentNode.removeChild(typingEl); }
        typingEl = null;
      }

      function respondTo(userText){
        showTyping();
        
        // Pass trainer config to API
        var configStr = '{}';
        try {
          // Since we can't easily pass config from server component to here without props,
          // We will just fetch it from the API side directly. Wait, the API route reads trainer-config.json itself!
        } catch(e) {}

        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText, config: {} })
        })
        .then(res => res.json())
        .then(data => {
          hideTyping();
          addMsg(data.reply || "Bir hata oluştu, lütfen tekrar deneyin.", 'bot');
        })
        .catch(err => {
          hideTyping();
          addMsg("Bağlantı hatası, lütfen formu kullanın.", 'bot');
        });
      }

      function sendMessage(text){
        var val = (text || input.value || '').trim();
        if(!val) return;
        addMsg(val, 'user');
        input.value = '';
        respondTo(val);
      }

      function openPanel(){
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        fab.classList.add('open');
        fab.setAttribute('aria-expanded', 'true');
        if(!greeted){
          greeted = true;
          showTyping();
          setTimeout(function(){
            hideTyping();
            addMsg('Merhaba! Ben ' + TRAINER_NAME + ' için çalışan yapay zeka otomasyonlu asistanım. Sorularını hemen yanıtlayabilirim; özel durumlarda ' + TRAINER_FIRST + ' sana kendisi döner.', 'bot');
          }, 600);
        }
        setTimeout(function(){ input.focus(); }, 250);
      }

      function closePanel(){
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        fab.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
      }

      fab.addEventListener('click', function(){
        if(panel.classList.contains('open')){ closePanel(); } else { openPanel(); }
      });
      if(closeBtn){ closeBtn.addEventListener('click', closePanel); }
      sendBtn.addEventListener('click', function(){ sendMessage(); });
      input.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); sendMessage(); }
      });
      if(quick){
        Array.prototype.slice.call(quick.querySelectorAll('button')).forEach(function(btn){
          btn.addEventListener('click', function(){ sendMessage(btn.getAttribute('data-q')); });
        });
      }
      var nudgeBtns = document.querySelectorAll('.js-open-chat');
      nudgeBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          openPanel();
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
    }catch(err){}
  })();

  // ─── Guclendirilmis Scroll-reveal ───
  (function(){
    try{
      if(!window.IntersectionObserver) return;
      var els = document.querySelectorAll('.reveal');
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function(el){ obs.observe(el); });
    }catch(err){}
  })();

  // ─── Glassmorphism Nav scroll ───
  (function(){
    try{
      var shell = document.getElementById('navShell');
      if(!shell) return;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduceMotion) return;
      function updateNav(){
        if(window.scrollY < 80){
          shell.classList.add('at-top');
        } else {
          shell.classList.remove('at-top');
        }
      }
      updateNav();
      window.addEventListener('scroll', updateNav, { passive: true });
    }catch(err){}
  })();

  // ─── Parallax Hero Banner ───
  (function(){
    try{
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduceMotion) return;
      var frame = document.querySelector('.hero-frame');
      if(!frame) return;
      function onScroll(){
        var rect = frame.getBoundingClientRect();
        var visible = rect.top < window.innerHeight && rect.bottom > 0;
        if(!visible) return;
        var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        var shift = (progress - 0.5) * 48;
        var imgs = frame.querySelectorAll('.hero-photo');
        imgs.forEach(function(img){
          img.style.transform = 'translateY(' + shift + 'px)';
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
    }catch(err){}
  })();

  // ─── Counter Animasyon ───
  (function(){
    try{
      if(!window.IntersectionObserver) return;
      var counters = document.querySelectorAll('.counter');
      if(!counters.length) return;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function parseVal(str){
        // Sadece rakam kismi al: "120+" -> {num:120, suffix:"+"}
        var match = String(str).match(/^(\d+)(.*)$/);
        if(!match) return null;
        return { num: parseInt(match[1], 10), suffix: match[2] || '' };
      }

      function animateCounter(el, target, suffix, duration){
        var start = 0;
        var startTime = null;
        function step(ts){
          if(!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          // easeOutCubic
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting) return;
          var el = entry.target;
          var raw = el.getAttribute('data-target') || el.textContent;
          var parsed = parseVal(raw);
          if(!parsed) return;
          obs.unobserve(el);
          if(reduceMotion){
            el.textContent = parsed.num + parsed.suffix;
            return;
          }
          animateCounter(el, parsed.num, parsed.suffix, 1400);
        });
      }, { threshold: 0.5 });

      counters.forEach(function(el){ obs.observe(el); });
    }catch(err){}
  })();

  // ─── Testimonial Carousel ───
  (function(){
    try{
      var track = document.getElementById('testiTrack');
      var prevBtn = document.getElementById('testiPrev');
      var nextBtn = document.getElementById('testiNext');
      var dotsEl = document.getElementById('testiDots');
      if(!track || !prevBtn || !nextBtn) return;

      var cards = track.querySelectorAll('.testi-card');
      var total = cards.length;
      if(total < 2) return;

      var currentIdx = 0;
      var autoTimer = null;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function getVisible(){
        var w = window.innerWidth;
        if(w <= 760) return 1;
        if(w <= 900) return 2;
        return 3;
      }

      function getCardWidth(){
        if(!cards[0]) return 0;
        var style = window.getComputedStyle(track);
        var gap = parseFloat(style.gap) || 22;
        return cards[0].offsetWidth + gap;
      }

      function goTo(idx){
        var maxIdx = Math.max(0, total - getVisible());
        currentIdx = Math.max(0, Math.min(idx, maxIdx));
        var offset = currentIdx * getCardWidth();
        track.style.transform = 'translateX(-' + offset + 'px)';
        var dots = dotsEl ? dotsEl.querySelectorAll('.testi-dot') : [];
        dots.forEach(function(d, i){ d.classList.toggle('active', i === currentIdx); });
      }

      prevBtn.addEventListener('click', function(){ goTo(currentIdx - 1); resetAuto(); });
      nextBtn.addEventListener('click', function(){ goTo(currentIdx + 1); resetAuto(); });

      if(dotsEl){
        dotsEl.querySelectorAll('.testi-dot').forEach(function(dot){
          dot.addEventListener('click', function(){
            goTo(parseInt(dot.getAttribute('data-i'),10));
            resetAuto();
          });
        });
      }

      function startAuto(){
        if(reduceMotion) return;
        autoTimer = setInterval(function(){
          var maxIdx = Math.max(0, total - getVisible());
          goTo(currentIdx >= maxIdx ? 0 : currentIdx + 1);
        }, 5000);
      }
      function resetAuto(){ clearInterval(autoTimer); startAuto(); }

      window.addEventListener('resize', function(){ goTo(currentIdx); });
      startAuto();
    }catch(err){}
  })();

  // ─── Floating CTA ───
  (function(){
    try{
      var cta = document.getElementById('floatCta');
      var closeBtn = document.getElementById('floatCtaClose');
      if(!cta) return;
      var dismissed = false;

      function updateCta(){
        if(dismissed) return;
        if(window.scrollY > 400){
          cta.classList.add('visible');
        } else {
          cta.classList.remove('visible');
        }
      }

      window.addEventListener('scroll', updateCta, { passive: true });

      if(closeBtn){
        closeBtn.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          dismissed = true;
          cta.classList.remove('visible');
        });
      }
    }catch(err){}
  })();

  // ─── Hamburger / Mobile Drawer ───
  (function(){
    try{
      var hamburger = document.getElementById('hamburgerBtn');
      var drawer = document.getElementById('mobileDrawer');
      var drawerClose = document.getElementById('drawerClose');
      if(!hamburger || !drawer) return;

      function openDrawer(){
        drawer.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }

      function closeDrawer(){
        drawer.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      hamburger.addEventListener('click', function(){
        if(drawer.classList.contains('open')){ closeDrawer(); } else { openDrawer(); }
      });

      if(drawerClose){ drawerClose.addEventListener('click', closeDrawer); }

      // Drawer linklerine tiklaninca kapat
      drawer.querySelectorAll('.drawer-link').forEach(function(link){
        link.addEventListener('click', closeDrawer);
      });

      // Drawer CTA'ya tiklaninca kapat
      var drawerCta = drawer.querySelector('.drawer-cta .btn');
      if(drawerCta){ drawerCta.addEventListener('click', closeDrawer); }

      // ESC ile kapat
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && drawer.classList.contains('open')){ closeDrawer(); }
      });
    }catch(err){}
  })();


    } catch (e) {
      console.error(e);
    }
  }, []);

  return null;
}
