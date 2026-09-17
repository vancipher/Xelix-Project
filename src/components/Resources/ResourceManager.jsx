import { useState } from 'react';
import { useResources } from '../../contexts/ResourcesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { SECTIONS, SECTION_GROUPS } from '../../utils/helpers';
import { translateArToEn } from '../../utils/translate';
import Modal from '../UI/Modal';
import '../Admin/admin-shared.css';
import '../Admin/EventForm.css';
import './ResourceManager.css';

export default function ResourceManager() {
  const { getSubjects, addSubject, editSubject, deleteSubject, addItem, editItem, deleteItem } = useResources();
  const { admin, canAccessGroup } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);

  const visibleSections = SECTIONS.filter((s) =>
    SECTION_GROUPS[s].some((g) => canAccessGroup(g)),
  );

  const [activeSection, setActiveSection] = useState(() => visibleSections[0] || SECTIONS[0]);
  const [activeTab, setActiveTab] = useState('pdf');

  const subjects = getSubjects(activeSection, activeTab);
  const totalItems = subjects.reduce((sum, s) => sum + (s.items?.length || 0), 0);

  const [subjectModal, setSubjectModal] = useState(null);
  const [subjectTarget, setSubjectTarget] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ nameAr: '' });
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectError, setSubjectError] = useState(false);

  const [itemModal, setItemModal] = useState(null);
  const [itemSubjectId, setItemSubjectId] = useState(null);
  const [itemTarget, setItemTarget] = useState(null);
  const [itemForm, setItemForm] = useState({ titleAr: '', notes: '', url: '' });
  const [itemSaving, setItemSaving] = useState(false);
  const [itemError, setItemError] = useState(false);

  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const [expanded, setExpanded] = useState(null);

  const openAddSubject = () => {
    setSubjectForm({ nameAr: '' });
    setSubjectTarget(null);
    setSubjectError(false);
    setSubjectModal('add');
  };
  const openEditSubject = (sub) => {
    setSubjectForm({ nameAr: sub.nameAr || sub.name || '' });
    setSubjectTarget(sub);
    setSubjectError(false);
    setSubjectModal('edit');
  };
  const closeSubjectModal = () => {
    setSubjectModal(null);
    setSubjectTarget(null);
    setSubjectSaving(false);
  };
  const handleSubjectSave = async () => {
    const nameAr = subjectForm.nameAr.trim();
    if (!nameAr) {
      setSubjectError(true);
      return;
    }
    setSubjectSaving(true);
    try {
      const name = await translateArToEn(nameAr);
      if (subjectModal === 'add') {
        addSubject(activeSection, { name: name || nameAr, nameAr, type: activeTab });
        showToast(t('resources.subjectAdded'));
      } else {
        editSubject(activeSection, subjectTarget.id, { name: name || nameAr, nameAr });
        showToast(t('resources.subjectUpdated'));
      }
      closeSubjectModal();
    } finally {
      setSubjectSaving(false);
    }
  };
  const handleSubjectDelete = (sub) => {
    if (!window.confirm(t('resources.confirmDeleteSubject'))) return;
    deleteSubject(activeSection, sub.id);
    if (expanded === sub.id) setExpanded(null);
    showToast(t('resources.subjectDeleted'));
  };

  const openAddItem = (subjectId) => {
    setItemForm({ titleAr: '', notes: '', url: '' });
    setItemSubjectId(subjectId);
    setItemTarget(null);
    setItemError(false);
    setItemModal('add');
  };
  const openEditItem = (subjectId, item) => {
    setItemForm({
      titleAr: item.titleAr || item.title || '',
      notes: item.notes || '',
      url: item.url || '',
    });
    setItemSubjectId(subjectId);
    setItemTarget(item);
    setItemError(false);
    setItemModal('edit');
  };
  const closeItemModal = () => {
    setItemModal(null);
    setItemTarget(null);
    setItemSubjectId(null);
    setItemSaving(false);
  };
  const handleItemSave = async () => {
    const titleAr = itemForm.titleAr.trim();
    const url = itemForm.url.trim();
    if (!titleAr || !url) {
      setItemError(true);
      return;
    }
    setItemSaving(true);
    try {
      const title = await translateArToEn(titleAr);
      const payload = {
        title: title || titleAr,
        titleAr,
        notes: itemForm.notes.trim(),
        url,
      };
      if (itemModal === 'add') {
        addItem(activeSection, itemSubjectId, {
          ...payload,
          addedByName: admin?.displayName || '',
        });
        showToast(t('resources.itemAdded'));
      } else {
        editItem(activeSection, itemSubjectId, itemTarget.id, payload);
        showToast(t('resources.itemUpdated'));
      }
      closeItemModal();
    } finally {
      setItemSaving(false);
    }
  };
  const handleItemDelete = () => {
    if (!itemTarget) return;
    deleteItem(activeSection, itemSubjectId, itemTarget.id);
    closeItemModal();
    showToast(t('resources.itemDeleted'));
  };

  const typeIndex = activeTab === 'pdf' ? 0 : 1;

  return (
    <div className="admin-page rman-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">{t('resources.manageTitle')}</h1>
        <p className="admin-page-sub">
          {t('admin.loggedInAs')} <strong>{admin?.displayName}</strong>
        </p>
      </header>

      <div className="admin-controls">
        <div
          className="section-tabs section-tabs--shift"
          role="radiogroup"
          dir="ltr"
          aria-label={`${t('sections.evening')} / ${t('sections.morning')}`}
          style={{ '--section-count': Math.max(visibleSections.length, 1) }}
        >
          <span
            className="section-tabs-thumb"
            aria-hidden
            style={{
              transform: `translateX(${Math.max(0, visibleSections.indexOf(activeSection)) * 100}%)`,
            }}
          />
          {visibleSections.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={activeSection === s}
              className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
              onClick={() => { setActiveSection(s); setExpanded(null); }}
            >
              {t(`sections.${s}`)}
            </button>
          ))}
        </div>

        <div
          className="rman-type-tabs"
          role="radiogroup"
          dir="ltr"
          aria-label={t('resources.title')}
        >
          <span
            className={`rman-type-thumb ${activeTab === 'pdf' ? 'is-pdf' : 'is-yt'}`}
            aria-hidden
            style={{ transform: `translateX(${typeIndex * 100}%)` }}
          />
          <button
            type="button"
            role="radio"
            aria-checked={activeTab === 'pdf'}
            className={`rman-type-tab ${activeTab === 'pdf' ? 'is-active' : ''}`}
            onClick={() => { setActiveTab('pdf'); setExpanded(null); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span>{t('resources.pdfResources')}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={activeTab === 'youtube'}
            className={`rman-type-tab ${activeTab === 'youtube' ? 'is-active' : ''}`}
            onClick={() => { setActiveTab('youtube'); setExpanded(null); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor" />
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none" />
            </svg>
            <span>{t('resources.youtubeResources')}</span>
          </button>
        </div>
      </div>

      <div className="admin-panel admin-panel--wide rman-panel">
        <div className="rman-toolbar">
          <div className="rman-stats" aria-live="polite">
            <span className="rman-stat">
              <strong>{subjects.length}</strong>
              {' '}
              {lang === 'ar' ? 'مواد' : 'subjects'}
            </span>
            <span className="rman-stat-sep" aria-hidden>·</span>
            <span className="rman-stat">
              <strong>{totalItems}</strong>
              {' '}
              {activeTab === 'pdf' ? t('resources.files') : t('resources.videos')}
            </span>
          </div>
          <button type="button" className="rman-add-subject admin-action-btn" onClick={openAddSubject}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {t('resources.addSubject')}
          </button>
        </div>

        <div className="rman-subjects">
          {subjects.length === 0 ? (
            <div className="rman-empty glass">
              <div className={`rman-empty__icon ${activeTab === 'pdf' ? 'is-pdf' : 'is-yt'}`} aria-hidden>
                {activeTab === 'pdf' ? (
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                    <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor" />
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                )}
              </div>
              <p className="rman-empty__title">{t('resources.noSubjects')}</p>
              <p className="rman-empty__hint">{t('resources.emptyHint')}</p>
              <button type="button" className="admin-action-btn" onClick={openAddSubject}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {t('resources.addSubject')}
              </button>
            </div>
          ) : (
            subjects.map((sub) => {
              const isOpen = expanded === sub.id;
              const label = lang === 'ar' && sub.nameAr ? sub.nameAr : (sub.nameAr || sub.name);
              return (
                <div key={sub.id} className={`rman-subject glass ${isOpen ? 'rman-subject--open' : ''}`}>
                  <div className="rman-subject__head">
                    <button
                      type="button"
                      className="rman-subject__toggle"
                      onClick={() => setExpanded(isOpen ? null : sub.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={`rman-subject__badge ${activeTab === 'pdf' ? 'is-pdf' : 'is-yt'}`} aria-hidden>
                        {activeTab === 'pdf' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor" />
                            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                          </svg>
                        )}
                      </span>
                      <span className="rman-subject__name">{label}</span>
                      <span className="rman-subject__count">{sub.items.length}</span>
                      <svg className={`rman-chevron ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="rman-subject__actions">
                      <button type="button" className="rman-icon-btn" onClick={() => openEditSubject(sub)} title={t('resources.editSubject')} aria-label={t('resources.editSubject')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button type="button" className="rman-icon-btn rman-icon-btn--danger" onClick={() => handleSubjectDelete(sub)} title={t('resources.deleteSubject')} aria-label={t('resources.deleteSubject')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5M4 4l1 9h6l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="rman-items">
                      <button type="button" className="rman-add-item" onClick={() => openAddItem(sub.id)}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {activeTab === 'pdf' ? t('resources.addPdf') : t('resources.addVideo')}
                      </button>
                      {sub.items.length === 0 ? (
                        <p className="rman-items__empty">{t('resources.noItems')}</p>
                      ) : (
                        sub.items.map((item, idx) => {
                          const itemLabel = lang === 'ar' && item.titleAr
                            ? item.titleAr
                            : (item.titleAr || item.title);
                          return (
                            <div key={item.id} className="rman-item">
                              <span className="rman-item__num">{idx + 1}</span>
                              <div className="rman-item__info">
                                <p className="rman-item__title">{itemLabel}</p>
                                {item.notes && <p className="rman-item__notes">{item.notes}</p>}
                                {item.url && (
                                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="rman-item__url" dir="ltr">
                                    {item.url.length > 50 ? `${item.url.slice(0, 50)}…` : item.url}
                                  </a>
                                )}
                              </div>
                              <div className="rman-item__actions">
                                <button type="button" className="rman-icon-btn" onClick={() => openEditItem(sub.id, item)} aria-label={t('admin.editEvent')}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={!!subjectModal}
        onClose={closeSubjectModal}
        title={subjectModal === 'add' ? t('resources.addSubject') : t('resources.editSubject')}
      >
        <div className="rman-form event-form">
          <div className="ef-group">
            <label className="ef-label" htmlFor="rman-subject-ar">{t('resources.subjectNameAr')}</label>
            <div className={`ef-field ${subjectError ? 'ef-field--error' : ''}`}>
              <input
                id="rman-subject-ar"
                className="ef-input"
                value={subjectForm.nameAr}
                onChange={(e) => {
                  setSubjectForm({ nameAr: e.target.value });
                  if (e.target.value.trim()) setSubjectError(false);
                }}
                placeholder="مثال: أمن الشبكات"
                dir="rtl"
                style={{ fontFamily: 'var(--font-ar)', paddingInlineStart: '14px' }}
                disabled={subjectSaving}
              />
            </div>
            <p className="ef-hint">{t('resources.subjectNameHint')}</p>
          </div>
          <div className="ef-actions">
            <div className="ef-actions-right">
              <button type="button" className="ef-btn ef-btn--ghost" onClick={closeSubjectModal} disabled={subjectSaving}>
                {t('admin.cancel')}
              </button>
              <button type="button" className="ef-btn ef-btn--primary" onClick={handleSubjectSave} disabled={subjectSaving}>
                {subjectSaving ? t('resources.savingTranslate') : t('admin.save')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!itemModal}
        onClose={closeItemModal}
        title={itemModal === 'add'
          ? (activeTab === 'pdf' ? t('resources.addPdf') : t('resources.addVideo'))
          : (activeTab === 'pdf' ? t('resources.editPdf') : t('resources.editVideo'))}
      >
        <div className="rman-form event-form">
          <div className="ef-group">
            <label className="ef-label" htmlFor="rman-item-ar">{t('resources.itemTitleAr')}</label>
            <div className={`ef-field ${itemError && !itemForm.titleAr.trim() ? 'ef-field--error' : ''}`}>
              <input
                id="rman-item-ar"
                className="ef-input"
                value={itemForm.titleAr}
                onChange={(e) => {
                  setItemForm((f) => ({ ...f, titleAr: e.target.value }));
                  if (e.target.value.trim()) setItemError(false);
                }}
                placeholder="مثال: المحاضرة 1 - مقدمة"
                dir="rtl"
                style={{ fontFamily: 'var(--font-ar)', paddingInlineStart: '14px' }}
                disabled={itemSaving}
              />
            </div>
            <p className="ef-hint">{t('resources.itemTitleHint')}</p>
          </div>
          <div className="ef-group">
            <label className="ef-label" htmlFor="rman-item-url">
              {activeTab === 'pdf' ? t('resources.pdfLink') : t('resources.youtubeLink')}
            </label>
            <div className={`ef-field ${itemError && !itemForm.url.trim() ? 'ef-field--error' : ''}`}>
              <input
                id="rman-item-url"
                className="ef-input"
                value={itemForm.url}
                onChange={(e) => {
                  setItemForm((f) => ({ ...f, url: e.target.value }));
                  if (e.target.value.trim()) setItemError(false);
                }}
                placeholder={activeTab === 'pdf' ? 'https://drive.google.com/...' : 'https://youtube.com/watch?v=...'}
                dir="ltr"
                style={{ paddingInlineStart: '14px' }}
                disabled={itemSaving}
              />
            </div>
          </div>
          <div className="ef-group">
            <label className="ef-label" htmlFor="rman-item-notes">{t('resources.itemNotes')}</label>
            <textarea
              id="rman-item-notes"
              className="ef-input ef-textarea"
              value={itemForm.notes}
              onChange={(e) => setItemForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t('resources.notesPlaceholder')}
              rows={2}
              disabled={itemSaving}
            />
          </div>
          <div className="ef-actions">
            {itemModal === 'edit' && (
              <button type="button" className="ef-btn ef-btn--danger" onClick={handleItemDelete} disabled={itemSaving}>
                {t('admin.delete')}
              </button>
            )}
            <div className="ef-actions-right">
              <button type="button" className="ef-btn ef-btn--ghost" onClick={closeItemModal} disabled={itemSaving}>
                {t('admin.cancel')}
              </button>
              <button type="button" className="ef-btn ef-btn--primary" onClick={handleItemSave} disabled={itemSaving}>
                {itemSaving ? t('resources.savingTranslate') : t('admin.save')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
