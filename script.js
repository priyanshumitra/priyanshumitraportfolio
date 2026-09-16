/* Priyanshu Mitra — Portfolio behavior
   Vanilla JS, no external runtime dependencies. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a, .mobile-menu a'));
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var byId = {};
    navAnchors.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') === 0) {
        var id = href.slice(1);
        byId[id] = byId[id] || [];
        byId[id].push(a);
      }
    });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.remove('active'); });
          var links = byId[entry.target.id];
          if (links) links.forEach(function (a) { a.classList.add('active'); });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
    document.querySelectorAll('.stagger').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--i', i);
      });
    });
  }

  /* ---------------- Hero boot sequence ---------------- */
  var bootEl = document.getElementById('boot-line');
  if (bootEl) {
    if (reduceMotion) {
      bootEl.textContent = '> systems nominal — profile loaded';
    } else {
      var lines = ['> initializing profile…', '> loading engineering record…', '> systems nominal — welcome'];
      var li = 0, ci = 0;
      var typeNext = function () {
        if (li >= lines.length) return;
        var current = lines[li];
        if (ci <= current.length) {
          bootEl.innerHTML = current.slice(0, ci) + '<span class="cursor"></span>';
          ci++;
          setTimeout(typeNext, 18);
        } else {
          li++; ci = 0;
          if (li < lines.length) {
            setTimeout(typeNext, 380);
          } else {
            setTimeout(function () {
              bootEl.innerHTML = lines[lines.length - 1] + '<span class="cursor"></span>';
            }, 200);
          }
        }
      };
      typeNext();
    }
  }

  /* ---------------- Background canvas: drifting circuit nodes ---------------- */
  var canvas = document.getElementById('bg-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var width, height, nodes = [];
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = Math.min(70, Math.floor((width * height) / 22000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      var maxDist = Math.min(150, width / 7);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = width; if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height; if (n.y > height) n.y = 0;
      }
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = 'rgba(43,231,200,' + (0.10 * (1 - dist / maxDist)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }
      for (var j = 0; j < nodes.length; j++) {
        ctx.beginPath();
        ctx.arc(nodes[j].x, nodes[j].y, nodes[j].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(43,231,200,0.45)';
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    if (!reduceMotion) {
      requestAnimationFrame(step);
    } else {
      step();
    }
  }

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var statusEl = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (resp) {
        if (resp.ok) {
          statusEl.textContent = 'Message sent — thank you. I will get back to you soon.';
          statusEl.className = 'form-status ok';
          form.reset();
        } else {
          statusEl.textContent = 'Something went wrong sending that. Please try again or email me directly.';
          statusEl.className = 'form-status err';
        }
      }).catch(function () {
        statusEl.textContent = 'Network error — please check your connection and try again.';
        statusEl.className = 'form-status err';
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      });
    });
  }
})();
