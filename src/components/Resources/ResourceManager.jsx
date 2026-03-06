import { useState } from 'react';
import { useResources } from '../../contexts/ResourcesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { SECTIONS, SECTION_GROUPS } from '../../utils/helpers';
import Modal from '../UI/Modal';
import './ResourceManager.css';

export default function ResourceManager() {
  const { getSubjects, addSubject, editSubject, deleteSubject, addItem, editItem, deleteItem } = useResources();
  const { admin, canAccessGroup } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);

  const [activeSection, setActiveSection] = useState(() => {
    for (const s of SECTIONS) {
      if (SECTION_GROUPS[s].some((g) => canAccessGroup(g))) return s;
    }
    return SECTIONS[0];
  });
  const [activeTab, setActiveTab] = useState('pdf');

  const subjects = getSubjects(activeSection, activeTab);

  // Subject modal
  const [subjectModal, setSubjectModal] = useState(null); // 'add' | 'edit'
  const [subjectTarget, setSubjectTarget] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', nameAr: '' });

  // Item modal
  const [itemModal, setItemModal] = useState(null); // 'add' | 'edit'
  const [itemSubjectId, setItemSubjectId] = useState(null);
  const [itemTarget, setItemTarget] = useState(null);
  const [itemForm, setItemForm] = useState({ title: '', titleAr: '', notes: '', url: '' });

  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Expanded subject
  const [expanded, setExpanded] = useState(null);

  /* ── Subject handlers ─────────────────────────────────────── */
  const openAddSubject = () => {
    setSubjectForm({ name: '', nameAr: '' });
    setSubjectTarget(null);
    setSubjectModal('add');
  };
  const openEditSubject = (sub) => {
    setSubjectForm({ name: sub.name, nameAr: sub.nameAr || '' });
    setSubjectTarget(sub);
    setSubjectModal('edit');
  };
  const closeSubjectModal = () => { setSubjectModal(null); setSubjectTarget(null); };
  const handleSubjectSave = () => {
    if (!subjectForm.name.trim()) return;
    if (subjectModal === 'add') {
      addSubject(activeSection, { name: subjectForm.name.trim(), nameAr: subjectForm.nameAr.trim(), type: activeTab });
      showToast(t('resources.subjectAdded'));
    } else {
      editSubject(activeSection, subjectTarget.id, { name: subjectForm.name.trim(), nameAr: subjectForm.nameAr.trim() });
      showToast(t('resources.subjectUpdated'));
    }
    closeSubjectModal();
  };
  const handleSubjectDelete = (sub) => {
    if (!window.confirm(t('resources.confirmDeleteSubject'))) return;
    deleteSubject(activeSection, sub.id);
    showToast(t('resources.subjectDeleted'));
  };

  /* ── Item handlers ────────────────────────────────────────── */
  const openAddItem = (subjectId) => {
    setItemForm({ title: '', titleAr: '', notes: '', url: '' });
    setItemSubjectId(subjectId);
    setItemTarget(null);
    setItemModal('add');
  };
  const openEditItem = (subjectId, item) => {
    setItemForm({ title: item.title, titleAr: item.titleAr || '', notes: item.notes || '', url: item.url || '' });
    setItemSubjectId(subjectId);
    setItemTarget(item);
    setItemModal('edit');
  };
  const closeItemModal = () => { setItemModal(null); setItemTarget(null); setItemSubjectId(null); };
  const handleItemSave = () => {
    if (!itemForm.title.trim()) return;
    if (itemModal === 'add') {
      addItem(activeSection, itemSubjectId, {
        title: itemForm.title.trim(),
        titleAr: itemForm.titleAr.trim(),
        notes: itemForm.notes.trim(),
        url: itemForm.url.trim(),
        addedByName: admin?.displayName || '',
      });
      showToast(t('resources.itemAdded'));
    } else {
      editItem(activeSection, itemSubjectId, itemTarget.id, {
        title: itemForm.title.trim(),
        titleAr: itemForm.titleAr.trim(),
        notes: itemForm.notes.trim(),
        url: itemForm.url.trim(),
      });
      showToast(t('resources.itemUpdated'));
    }
    closeItemModal();
  };
  const handleItemDelete = () => {
    if (!itemTarget) return;
    deleteItem(activeSection, itemSubjectId, itemTarget.id);
    closeItemModal();
    showToast(t('resources.itemDeleted'));
  };

  return (
    <div className="rman-page">
      <div className="rman-header">
        <div>
          <h1 className="rman-title">{t('resources.manageTitle')}</h1>
          <p className="rman-sub">{t('admin.loggedInAs')} <strong>{admin?.displayName}</strong></p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="dash-section-tabs">
        {SECTIONS.map((s) => {
          const hasAccess = SECTION_GROUPS[s].some((g) => canAccessGroup(g));
          if (!hasAccess) return null;
          return (
            <button
              key={s}
              className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              {t(`sections.${s}`)}
            </button>
          );
        })}
      </div>

      {/* Type tabs */}
      <div className="res-type-tabs" style={{ marginBottom: 20 }}>
        <button
          className={`res-type-tab ${activeTab === 'pdf' ? 'res-type-tab--active res-type-tab--pdf' : ''}`}
          onClick={() => { setActiveTab('pdf'); setExpanded(null); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          {t('resources.pdfResources')}
        </button>
        <button
          className={`res-type-tab ${activeTab === 'youtube' ? 'res-type-tab--active res-type-tab--yt' : ''}`}
          onClick={() => { setActiveTab('youtube'); setExpanded(null); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor"/>
            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          </svg>
          {t('resources.youtubeResources')}
        </button>
      </div>

      {/* Add subject button */}
      <button className="rman-add-subject" onClick={openAddSubject}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        {t('resources.addSubject')}
      </button>

      {/* Subject list */}
      <div className="rman-subjects">
        {subjects.length === 0 && (
          <p className="rman-empty">{t('resources.noSubjects')}</p>
        )}
        {subjects.map((sub) => {
          const isOpen = expanded === sub.id;
          const label = lang === 'ar' && sub.nameAr ? sub.nameAr : sub.name;
          return (
            <div key={sub.id} className={`rman-subject glass ${isOpen ? 'rman-subject--open' : ''}`}>
              <div className="rman-subject__head">
                <button className="rman-subject__toggle" onClick={() => setExpanded(isOpen ? null : sub.id)}>
                  <svg className={`rman-chevron ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="rman-subject__name">{label}</span>
                  <span className="rman-subject__count">{sub.items.length}</span>
                </button>
                <div className="rman-subject__actions">
                  <button className="rman-icon-btn" onClick={() => openEditSubject(sub)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="rman-icon-btn rman-icon-btn--danger" onClick={() => handleSubjectDelete(sub)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5M4 4l1 9h6l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="rman-items">
                  <button className="rman-add-item" onClick={() => openAddItem(sub.id)}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {activeTab === 'pdf' ? t('resources.addPdf') : t('resources.addVideo')}
                  </button>
                  {sub.items.length === 0 && (
                    <p className="rman-items__empty">{t('resources.noItems')}</p>
                  )}
                  {sub.items.map((item, idx) => {
                    const itemLabel = lang === 'ar' && item.titleAr ? item.titleAr : item.title;
                    return (
                      <div key={item.id} className="rman-item">
                        <span className="rman-item__num">{idx + 1}</span>
                        <div className="rman-item__info">
                          <p className="rman-item__title">{itemLabel}</p>
                          {item.notes && <p className="rman-item__notes">{item.notes}</p>}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="rman-item__url" dir="ltr">
                              {item.url.length > 50 ? item.url.slice(0, 50) + '…' : item.url}
                            </a>
                          )}
                        </div>
                        <div className="rman-item__actions">
                          <button className="rman-icon-btn" onClick={() => openEditItem(sub.id, item)} title="Edit">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subject Modal */}
      <Modal
        isOpen={!!subjectModal}
        onClose={closeSubjectModal}
        title={subjectModal === 'add' ? t('resources.addSubject') : t('resources.editSubject')}
      >
        <div className="rman-form">
          <div className="rman-form__group">
            <label className="rman-form__label">{t('resources.subjectName')} *</label>
            <input
              className="rman-form__input"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Network Security"
              dir="ltr"
            />
          </div>
          <div className="rman-form__group">
            <label className="rman-form__label">{t('resources.subjectNameAr')}</label>
            <input
              className="rman-form__input"
              value={subjectForm.nameAr}
              onChange={(e) => setSubjectForm((f) => ({ ...f, nameAr: e.target.value }))}
              placeholder="مثال: أمن الشبكات"
              dir="rtl"
              style={{ fontFamily: 'var(--font-ar)' }}
            />
          </div>
          <div className="rman-form__actions">
            <button className="ef-btn ef-btn--ghost" onClick={closeSubjectModal}>{t('admin.cancel')}</button>
            <button className="ef-btn ef-btn--primary" onClick={handleSubjectSave}>{t('admin.save')}</button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={!!itemModal}
        onClose={closeItemModal}
        title={itemModal === 'add'
          ? (activeTab === 'pdf' ? t('resources.addPdf') : t('resources.addVideo'))
          : (activeTab === 'pdf' ? t('resources.editPdf') : t('resources.editVideo'))
        }
      >
        <div className="rman-form">
          <div className="rman-form__group">
            <label className="rman-form__label">{t('resources.itemTitle')} *</label>
            <input
              className="rman-form__input"
              value={itemForm.title}
              onChange={(e) => setItemForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={activeTab === 'pdf' ? 'e.g. Lecture 1 - Introduction' : 'e.g. Lecture 1 - Overview'}
              dir="ltr"
            />
          </div>
          <div className="rman-form__group">
            <label className="rman-form__label">{t('resources.itemTitleAr')}</label>
            <input
              className="rman-form__input"
              value={itemForm.titleAr}
              onChange={(e) => setItemForm((f) => ({ ...f, titleAr: e.target.value }))}
              placeholder="مثال: المحاضرة 1 - مقدمة"
              dir="rtl"
              style={{ fontFamily: 'var(--font-ar)' }}
            />
          </div>
          <div className="rman-form__group">
            <label className="rman-form__label">
              {activeTab === 'pdf' ? t('resources.pdfLink') : t('resources.youtubeLink')} *
            </label>
            <input
              className="rman-form__input"
              value={itemForm.url}
              onChange={(e) => setItemForm((f) => ({ ...f, url: e.target.value }))}
              placeholder={activeTab === 'pdf' ? 'https://drive.google.com/...' : 'https://youtube.com/watch?v=...'}
              dir="ltr"
            />
          </div>
          <div className="rman-form__group">
            <label className="rman-form__label">{t('resources.itemNotes')}</label>
            <textarea
              className="rman-form__input rman-form__textarea"
              value={itemForm.notes}
              onChange={(e) => setItemForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t('resources.notesPlaceholder')}
              rows={3}
            />
          </div>
          <div className="rman-form__actions">
            {itemModal === 'edit' && (
              <button className="ef-btn ef-btn--danger" onClick={handleItemDelete}>{t('admin.delete')}</button>
            )}
            <div style={{ flex: 1 }} />
            <button className="ef-btn ef-btn--ghost" onClick={closeItemModal}>{t('admin.cancel')}</button>
            <button className="ef-btn ef-btn--primary" onClick={handleItemSave}>{t('admin.save')}</button>
          </div>
        </div>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
