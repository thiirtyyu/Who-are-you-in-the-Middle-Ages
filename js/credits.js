const MEMBERS = [
  {
    name: 'Numcha', role: 'Producer', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: 'Instagram', value: 'glimpssesoftea', url: 'https://www.instagram.com/glimpssesoftea' },]
  },
  {
    name: 'thirtyyu', role: 'Developer', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: 'Instagram', value: 'thiirtyyu', url: 'https://www.instagram.com/thiirtyyu' },]
  },
  {
    name: 'KitsuhaK', role: 'Artist', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: 'Twitter', value: '@RgsKitsune', url: 'https://x.com/RgsKitsune' },]
  },
  {
    name: 'Aky', role: 'Artist', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: 'Instagram', value: 'ake_atthapol', url: 'https://www.instagram.com/ake_atthapol' },]
  },
  {
    name: 'NE-3s', role: 'Artist', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: 'Instagram', value: 'n_net2009', url: 'https://www.instagram.com/n_net2009/' },]
  },
  {
    name: 'MOJI', role: 'Artist', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: '', value: '', url: '' },]
  },
  {
    name: 'อาร์ท', role: 'Voice Actor', icon: '', image: '',
    penName: '',
    profileImage: '',
    contact: [{ label: '', value: ' ' },]
  },
  {
    name: 'Toey', role: 'Voice Actor', icon: '',
    image: 'assets/images/credit/12_20260714215321.webp',
    penName: '',
    profileImage: 'assets/images/credit/12_20260714215321.webp',
    contact: [{ label: 'Instagram', value: 'tt_oeeey', url: 'https://www.instagram.com/tt_oeeey' },]
  },
];

const ROSTER_HEADING = '✦ สมาชิกกลุ่ม ✦';

function renderRoster() {
  const container = document.getElementById('creditsRoster');
  if (!container) return;

  const headingEl = document.createElement('div');
  headingEl.className = 'roster-heading';
  headingEl.textContent = ROSTER_HEADING;

  const gridEl = document.createElement('div');
  gridEl.className = 'roster-grid';

  MEMBERS.forEach((member, index) => {
    const card = document.createElement('div');
    card.className = 'roster-member';
    card.id = `member-${index + 1}`;

    const avatarHtml = member.image
      ? `<div class="member-avatar">
           <img src="${member.image}" alt="${member.name}" class="member-avatar-img">
         </div>`
      : `<div class="member-avatar member-avatar-placeholder">
           <span class="member-icon">${member.icon}</span>
         </div>`;

    card.innerHTML = `
      ${avatarHtml}
      <span class="member-name">${member.name}</span>
      <span class="member-role">${member.role}</span>
    `;

    card.addEventListener('click', () => openModal(index));

    gridEl.appendChild(card);
  });

  container.appendChild(headingEl);
  container.appendChild(gridEl);
}

const overlay = () => document.getElementById('modalOverlay');
const modalBody = () => document.getElementById('modalBody');

function openModal(index) {
  const member = MEMBERS[index];
  if (!member) return;

  const body = modalBody();
  if (!body) return;

  const photoHtml = member.profileImage
    ? `<div class="modal-photo-frame">
         <img src="${member.profileImage}" alt="${member.name}" class="modal-photo-img">
       </div>`
    : `<div class="modal-photo-frame modal-photo-placeholder">
         <span class="modal-photo-icon">${member.icon}</span>
       </div>`;

  const penHtml = member.penName
    ? `<div class="modal-pen-name">
         <span class="modal-pen-label">นามปากกา:</span> ${member.penName}
       </div>`
    : '';

  let contactHtml = '';
  if (member.contact && member.contact.length > 0) {
    const rows = member.contact.map(c => {
      const valueHtml = c.url
        ? `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="modal-contact-link">${c.value}</a>`
        : `<span class="modal-contact-value">${c.value}</span>`;
      return `<div class="modal-contact-row">
         <span class="modal-contact-label">${c.label}</span>
         ${valueHtml}
       </div>`;
    }).join('');

    contactHtml = `
      <div class="modal-divider"><span class="modal-divider-icon">✦</span></div>
      <div class="modal-contact-heading">ช่องทางติดต่อ</div>
      <div class="modal-contact-list">${rows}</div>`;
  }

  body.innerHTML = `
    ${photoHtml}
    <div class="modal-name">${member.name}</div>
    <div class="modal-role-tag">${member.role}</div>
    ${penHtml}
    ${contactHtml}
  `;

  const el = overlay();
  el.classList.add('is-open');
  void el.offsetHeight;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const el = overlay();
  el.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderRoster();

  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const ov = overlay();
  if (ov) {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
