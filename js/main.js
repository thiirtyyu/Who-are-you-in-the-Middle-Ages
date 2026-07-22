const sceneIntro = document.getElementById('sceneIntro');
const sceneSlide = document.getElementById('sceneSlide');
const sceneResult = document.getElementById('sceneResult');
const slideArea = document.getElementById('slideArea');
const resultContent = document.getElementById('resultContent');

const bgmPlayer = document.getElementById('bgmPlayer');
const sfxPlayer = document.getElementById('sfxPlayer');

function playBGM(src) {
  if (!bgmPlayer || !src) return;
  if (bgmPlayer.src.endsWith(src)) {
    if (bgmPlayer.paused) bgmPlayer.play().catch(e => console.log('BGM play failed:', e));
    return;
  }
  bgmPlayer.src = src;
  bgmPlayer.volume = 0.2;
  bgmPlayer.play().catch(e => console.log('BGM play failed:', e));
}

function playSFX(src) {
  if (!sfxPlayer || !src) return;
  sfxPlayer.src = src;
  sfxPlayer.volume = 0.8;
  sfxPlayer.play().catch(e => console.log('SFX play failed:', e));
}

let isMuted = false;
const btnMute = document.getElementById('btnMute');
if (btnMute) {
  btnMute.addEventListener('click', () => {
    isMuted = !isMuted;
    if (bgmPlayer) bgmPlayer.muted = isMuted;
    if (sfxPlayer) sfxPlayer.muted = isMuted;

    if (isMuted) {
      btnMute.classList.add('muted');
      btnMute.innerHTML = '<span class="icon-sound">🔇</span>';
    } else {
      btnMute.classList.remove('muted');
      btnMute.innerHTML = '<span class="icon-sound">🔊</span>';

      // ลองเล่น BGM เผื่อว่าโดน browser block ไว้ตอนแรก (ถ้ามี path เพลงแล้ว)
      if (bgmPlayer && bgmPlayer.paused && bgmPlayer.src && bgmPlayer.src !== window.location.href) {
        bgmPlayer.play().catch(e => console.log('BGM play failed:', e));
      }
    }
  });
}

const _questionSlides = quizData.slides
  .map((s, i) => ({ ...s, _idx: i }))
  .filter(s => s.type === 'question');
const totalQuestions = _questionSlides.length;

function getQuestionNumber(slideIndex) {
  const qi = _questionSlides.findIndex(s => s._idx === slideIndex);
  return qi >= 0 ? qi + 1 : null;
}

function initIntroPage() {
  const { label, title, description, buttonText, image } = quizData.intro;
  const el = id => document.getElementById(id);
  if (el('introLabel')) el('introLabel').textContent = label;
  if (el('introTitle')) el('introTitle').textContent = title;
  if (el('introDesc')) el('introDesc').innerHTML = escapeHtml(description).replace(/\n/g, '<br>');
  if (el('btnStart') && buttonText) el('btnStart').textContent = buttonText;

  const wrap = el('introHeroWrap');
  const img = el('introHeroImg');
  if (wrap && img) {
    if (image) {
      img.src = image;
      img.alt = title || '';
      wrap.style.display = 'flex';
    } else {
      wrap.style.display = 'none';
    }
  }
}

function renderSlide(index, direction) {
  const slide = quizData.slides[index];
  if (!slide) return;

  if (slide.sfx) {
    playSFX(slide.sfx);
  }

  const isLast = slide.isLast === true;

  const html = slide.type === 'story'
    ? buildStoryHTML(slide, index, isLast)
    : buildQuestionHTML(slide, index);

  const existing = slideArea.querySelector('.slide-content');
  if (existing && direction) {
    const exitX = direction === 'forward' ? '-20px' : '20px';
    existing.style.transition = 'opacity .18s ease, transform .18s ease';
    existing.style.opacity = '0';
    existing.style.transform = `translateX(${exitX})`;

    setTimeout(() => {
      slideArea.innerHTML = html;
      enterAnimation(direction === 'forward' ? '20px' : '-20px');
      bindListeners(index, isLast, slide.type);
    }, 200);
  } else {
    slideArea.innerHTML = html;
    enterAnimation('10px');
    bindListeners(index, isLast, slide.type);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterAnimation(fromX) {
  const el = slideArea.querySelector('.slide-content');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = `translateX(${fromX})`;
  el.style.transition = 'opacity .26s ease, transform .26s ease';
  void el.offsetHeight;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });
}

function buildStoryHTML(slide, index, isLast) {
  const imgHtml = slide.image
    ? `<div class="slide-img" style="background-image:url('${slide.image}')"></div>`
    : '';

  const parasHtml = slide.paragraphs
    .map(p => `<p class="story-para">${escapeHtml(p)}</p>`)
    .join('');

  const backBtn = index > 0
    ? `<button class="btn-slide-back" id="btnBack" type="button">← ย้อนกลับ</button>`
    : '<span></span>';

  const nextLabel = isLast ? 'ดูผลลัพธ์' : 'ถัดไป →';
  const nextClass = isLast ? 'btn-next btn-next--final' : 'btn-next';

  return `
    <div class="slide-content story-slide">
      ${imgHtml}
      <div class="story-body">${parasHtml}</div>
      <div class="slide-nav">
        ${backBtn}
        <button class="${nextClass}" id="btnNext" type="button">${nextLabel}</button>
      </div>
    </div>`;
}

function buildQuestionHTML(slide, index) {
  const qNum = getQuestionNumber(index);
  const pct = Math.round(((qNum - 1) / totalQuestions) * 100);
  const prev = userAnswers[slide.id];
  const letters = ['A', 'B', 'C', 'D'];

  const imgHtml = slide.image
    ? `<div class="slide-img q-slide-img" style="background-image:url('${slide.image}')"></div>`
    : '';

  const answersHtml = slide.answers.map((ans, i) => `
    <button class="btn-answer ${prev === ans.type ? 'is-selected' : ''}"
            type="button"
            data-type="${ans.type}"
            id="ans-${slide.id}-${i}">
      ${letters[i]}. ${escapeHtml(ans.text)}
    </button>`).join('');

  const backBtn = index > 0
    ? `<button class="btn-slide-back" id="btnBack" type="button">← ย้อนกลับ</button>`
    : '';

  return `
    <div class="slide-content question-slide">
      <div class="q-progress">
        <div class="q-progress-bar">
          <div class="q-progress-fill" style="width:${pct}%"></div>
        </div>
        <span class="q-progress-label">คำถามที่ ${qNum} / ${totalQuestions}</span>
      </div>
      ${imgHtml}
      <div class="q-meta">คำถามที่ ${slide.id}: ${escapeHtml(slide.title)}</div>
      <div class="q-story">${escapeHtml(slide.story).replace(/\n/g, '<br>')}</div>
      <div class="q-answers">${answersHtml}</div>
      ${backBtn}
    </div>`;
}

function bindListeners(index, isLast, type) {
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      currentSlideIndex--;
      renderSlide(currentSlideIndex, 'backward');
    });
  }

  if (type === 'story') {
    const btnNext = document.getElementById('btnNext');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (isLast) {
          showResult();
        } else {
          currentSlideIndex++;
          renderSlide(currentSlideIndex, 'forward');
        }
      });
    }
  } else {
    document.querySelectorAll('.btn-answer').forEach(btn => {
      btn.addEventListener('click', function () {
        const slide = quizData.slides[currentSlideIndex];
        recordAnswer(slide.id, this.dataset.type);

        document.querySelectorAll('.btn-answer').forEach(b => b.classList.remove('is-selected'));
        this.classList.add('is-selected');

        setTimeout(() => {
          currentSlideIndex++;
          if (currentSlideIndex >= quizData.slides.length) {
            showResult();
          } else {
            renderSlide(currentSlideIndex, 'forward');
          }
        }, 300);
      });
    });
  }
}

function showResult() {
  const { type, result } = calculateQuizResult();
  if (!result) return;

  const { animal, job, image, description, traits, jobs } = result;

  const imgInner = image
    ? `<img src="${image}" alt="${escapeHtml(job)}" class="result-img">`
    : `<span class="result-img-placeholder">( รอใส่รูปภาพ )</span>`;

  const traitsHtml = traits
    .map(t => `<span class="trait-text">${escapeHtml(t)}</span>`)
    .join('<span class="trait-sep">✦</span>');

  const descHtml = description.split('\n\n')
    .map(p => `<p class="result-desc-para">${escapeHtml(p)}</p>`)
    .join('');

  const jobMap = {};
  Object.entries(quizData.results).forEach(([mbti, r]) => {
    jobMap[r.job] = { animal: r.animal, mbti, image: r.image };
  });

  const jobsHtml = (jobs || []).map(j => {
    const ref = jobMap[j] || {};
    const aName = ref.animal ? escapeHtml(ref.animal) : '';
    const aLine = aName ? `<span class="job-animal-name">${aName}</span>` : '';
    const frameContent = ref.image
      ? `<img src="${ref.image}" alt="${escapeHtml(j)}" class="job-img">`
      : `<span class="job-img-ph">✦</span>`;
    return `
      <div class="job-item">
        <div class="job-img-frame">${frameContent}</div>
        ${aLine}
        <span class="job-name">${escapeHtml(j)}</span>
      </div>`;
  }).join('');

  resultContent.innerHTML = `
    <div class="result-inner">

      <div class="result-img-box">
        <div class="result-img-corner-tl"></div>
        <div class="result-img-corner-br"></div>
        <span class="result-img-star-top">✦</span>
        ${imgInner}
      </div>

      <h2 class="result-animal">
        <span class="result-animal-deco">❧—</span>
        ${escapeHtml(job)}
        <span class="result-animal-deco">—❧</span>
      </h2>

      <div class="result-subtitle-row">
        <span class="result-type-tag">${type}</span>
      </div>

      <div class="result-desc-block">${descHtml}</div>

      <div class="result-traits">${traitsHtml}</div>

      <div class="result-divider">
        <span class="result-divider-icon">◆</span>
      </div>

      <div class="result-jobs">
        <div class="result-jobs-label">✦ พัธมิตรของคุณ ✦</div>
        <div class="result-jobs-grid">${jobsHtml}</div>
      </div>

      <button class="btn-restart" type="button" id="btnRestart">↩ ทำแบบทดสอบอีกครั้ง</button>
      <a href="credits.html" class="btn-credits" id="btnCredits">⚜ ดูเครดิต</a>
    </div>`;


  switchScene(sceneSlide, sceneResult, 'forward');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) btnRestart.addEventListener('click', restartQuiz);
  }, 400);
}

function restartQuiz() {
  resetQuizState();
  switchScene(sceneResult, sceneIntro, 'backward');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchScene(from, to, direction) {
  const exitClass = direction === 'forward' ? 'exit-left' : 'exit-right';
  from.classList.remove('visible');
  from.classList.add(exitClass);

  setTimeout(() => {
    from.classList.remove('active', exitClass);
    to.classList.add('active');
    to.style.transform = direction === 'forward' ? 'translateX(28px)' : 'translateX(-28px)';
    to.style.opacity = '0';
    void to.offsetHeight;
    requestAnimationFrame(() => {
      to.style.transform = '';
      to.style.opacity = '';
      to.classList.add('visible');
    });
  }, 280);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', () => {
  initIntroPage();


  if (quizData.intro.bgm) {

    if (bgmPlayer && bgmPlayer.src !== quizData.intro.bgm) {
      bgmPlayer.src = quizData.intro.bgm;
      bgmPlayer.volume = 0.2;
    }


    if (!isMuted) {
      bgmPlayer.play().catch(() => { });
    }


    const tryPlayAudioOnInteraction = () => {
      if (bgmPlayer && bgmPlayer.paused && !isMuted) {
        bgmPlayer.play().catch(() => { });
      }
      document.removeEventListener('click', tryPlayAudioOnInteraction);
      document.removeEventListener('touchstart', tryPlayAudioOnInteraction);
    };
    document.addEventListener('click', tryPlayAudioOnInteraction);
    document.addEventListener('touchstart', tryPlayAudioOnInteraction);
  }

  document.getElementById('btnStart').addEventListener('click', () => {
    resetQuizState();
    if (quizData.intro.bgm && bgmPlayer && bgmPlayer.paused && !isMuted) {
      bgmPlayer.play().catch(e => console.log('BGM play failed:', e));
    }
    switchScene(sceneIntro, sceneSlide, 'forward');
    setTimeout(() => renderSlide(0, null), 320);
  });
});
