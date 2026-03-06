import { useState } from 'react';
import { useResources } from '../../contexts/ResourcesContext';
import { useGroup } from '../../contexts/GroupContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { SECTIONS } from '../../utils/helpers';
import './ResourcesPage.css';

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
  } catch { /* ignore */ }
  return null;
}

export default function ResourcesPage() {
  const { getSubjects } = useResources();
  const { activeSection, setActiveSection } = useGroup();
  const { lang } = useLanguage();
  const t = useT(lang);

  const [activeTab, setActiveTab] = useState('pdf');
  const [openSubject, setOpenSubject] = useState(null);

  const subjects = getSubjects(activeSection, activeTab);

  const toggleSubject = (id) => setOpenSubject((prev) => (prev === id ? null : id));

  return (
    <div className="resources-page">
      <div className="resources-header">
        <div>
          <h1 className="resources-title">{t('resources.title')}</h1>
          <p className="resources-sub">{t('resources.subtitle')}</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="section-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
            onClick={() => setActiveSection(s)}
          >
            {t(`sections.${s}`)}
          </button>
        ))}
      </div>

      {/* PDF / YouTube type tabs */}
      <div className="res-type-tabs">
        <button
          className={`res-type-tab ${activeTab === 'pdf' ? 'res-type-tab--active res-type-tab--pdf' : ''}`}
          onClick={() => { setActiveTab('pdf'); setOpenSubject(null); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          {t('resources.pdfResources')}
        </button>
        <button
          className={`res-type-tab ${activeTab === 'youtube' ? 'res-type-tab--active res-type-tab--yt' : ''}`}
          onClick={() => { setActiveTab('youtube'); setOpenSubject(null); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor"/>
            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          </svg>
          {t('resources.youtubeResources')}
        </button>
      </div>

      {/* Subject cards */}
      {subjects.length === 0 ? (
        <div className="res-empty glass">
          <p>{t('resources.noSubjects')}</p>
        </div>
      ) : (
        <div className="res-subjects">
          {subjects.map((subject) => {
            const isOpen = openSubject === subject.id;
            const label = subject.nameAr ? subject.nameAr : subject.name;
            return (
              <div key={subject.id} className={`res-subject glass ${isOpen ? 'res-subject--open' : ''}`}>
                <button className="res-subject__header" onClick={() => toggleSubject(subject.id)}>
                  <div className="res-subject__info">
                    <span className={`res-subject__icon ${activeTab === 'pdf' ? 'icon--pdf' : 'icon--yt'}`}>
                      {activeTab === 'pdf' ? (
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                          <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                          <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor"/>
                          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                        </svg>
                      )}
                    </span>
                    <span className="res-subject__name">{label}</span>
                    <span className="res-subject__count">
                      {subject.items.length} {activeTab === 'pdf' ? t('resources.files') : t('resources.videos')}
                    </span>
                  </div>
                  <svg
                    className={`res-subject__chevron ${isOpen ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isOpen && (
                  <div className="res-items">
                    {subject.items.length === 0 ? (
                      <p className="res-items__empty">{t('resources.noItems')}</p>
                    ) : (
                      subject.items.map((item, idx) => {
                        const itemLabel = item.titleAr ? item.titleAr : item.title;
                        const embedUrl = activeTab === 'youtube' ? getYoutubeEmbedUrl(item.url) : null;
                        return (
                          <div key={item.id} className="res-item">
                            <div className="res-item__num">{idx + 1}</div>
                            <div className="res-item__body">
                              <p className="res-item__title">{itemLabel}</p>
                              {item.notes && <p className="res-item__notes">{item.notes}</p>}
                              {activeTab === 'pdf' && item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="res-item__link res-item__link--pdf"
                                >
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                    <path d="M4 1h5l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3"/>
                                    <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.3"/>
                                  </svg>
                                  {t('resources.openPdf')}
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                    <path d="M5 3h8v8M13 3L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </a>
                              )}
                              {activeTab === 'youtube' && embedUrl && (
                                <div className="res-item__video">
                                  <iframe
                                    src={embedUrl}
                                    title={itemLabel}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              )}
                              {activeTab === 'youtube' && item.url && !embedUrl && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="res-item__link res-item__link--yt"
                                >
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                    <path d="M6.5 4.5l5 3.5-5 3.5V4.5z" fill="currentColor"/>
                                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                                  </svg>
                                  {t('resources.openVideo')}
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                    <path d="M5 3h8v8M13 3L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
