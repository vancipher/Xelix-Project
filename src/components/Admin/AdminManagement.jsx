import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import { GROUPS, SECTIONS, SECTION_GROUPS } from '../../utils/helpers';
import Modal from '../UI/Modal';
import './AdminManagement.css';

export default function AdminManagement() {
  const { accounts, admin, addAdmin, removeAdmin, editAdmin, isSuperAdmin } = useAuth();
  const { lang } = useLanguage();
  const t = useT(lang);

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({
    username: '', password: '', displayName: '', allowedGroups: [...GROUPS], canManageUsers: false,
  });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  if (!isSuperAdmin) {
    return (
      <div className="amp-page">
        <div className="amp-forbidden glass">
          <p>{lang === 'ar' ? 'وصول مقيّد للمسؤول الرئيسي فقط.' : 'Access restricted to Super Admin only.'}</p>
        </div>
      </div>
    );
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => {
    setForm({ username: '', password: '', displayName: '', allowedGroups: [...GROUPS], canManageUsers: false });
    setError('');
    setTarget(null);
    setModalMode('add');
  };

  const openEdit = (acc) => {
    setForm({
      username: acc.username,
      password: '',
      displayName: acc.displayName,
      allowedGroups: acc.allowedGroups ?? [...GROUPS],
      canManageUsers: acc.canManageUsers ?? false,
    });
    setError('');
    setTarget(acc);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setTarget(null); setError(''); };

  const handleSave = () => {
    if (!form.displayName.trim() || !form.username.trim()) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
      return;
    }
    if (modalMode === 'add') {
      if (!form.password.trim()) {
        setError(lang === 'ar' ? 'كلمة المرور مطلوبة.' : 'Password is required.');
        return;
      }
      const result = addAdmin({
          username: form.username.trim(),
          password: form.password,
          displayName: form.displayName.trim(),
          allowedGroups: form.allowedGroups,
          canManageUsers: form.canManageUsers,
        });
      if (result === 'duplicate') { setError(t('admin.duplicateUser')); return; }
      showToast(t('admin.adminAdded'));
    } else {
      editAdmin(target.id, {
        username:       form.username.trim(),
        displayName:    form.displayName.trim(),
        password:       form.password ? form.password : undefined,
        allowedGroups:  form.allowedGroups,
        canManageUsers: form.canManageUsers,
      });
      showToast(t('admin.adminUpdated'));
    }
    closeModal();
  };

  const handleRemove = (acc) => {
    if (acc.id === admin.id) { showToast(t('admin.cantRemoveSelf')); return; }
    if (!window.confirm(t('admin.confirmRemove'))) return;
    removeAdmin(acc.id);
    showToast(t('admin.adminRemoved'));
  };

  const roleLabel = (role) =>
    role === 'superadmin' ? t('admin.superadmin') : t('admin.adminLabel');

  return (
    <div className="amp-page">
      <div className="amp-header">
        <div>
          <h1 className="amp-title">{t('admin.manageAdmins')}</h1>
          <p className="amp-sub">
            {lang === 'ar' ? `${accounts.length} حسابات مسجّلة` : `${accounts.length} registered accounts`}
          </p>
        </div>
        <button className="amp-add-btn" onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {t('admin.addAdmin')}
        </button>
      </div>

      <div className="amp-list">
        {accounts.map((acc) => (
          <div key={acc.id} className={`amp-row glass ${acc.id === admin.id ? 'amp-row--self' : ''}`}>
            <div className="amp-row__avatar">
              {acc.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="amp-row__info">
              <span className="amp-row__name">{acc.displayName}</span>
              <span className="amp-row__username">@{acc.username}</span>
              <span className="amp-row__groups">
                {(acc.allowedGroups ?? GROUPS).join(', ')}
              </span>
            </div>
            <div className="amp-row__badges">
              <span className={`amp-row__role ${acc.role === 'superadmin' ? 'role--super' : 'role--admin'}`}>
                {roleLabel(acc.role)}
              </span>
              {acc.canManageUsers && acc.role !== 'superadmin' && (
                <span className="amp-row__role role--users">
                  {lang === 'ar' ? 'يدير المستخدمين' : 'Users'}
                </span>
              )}
            </div>
            {acc.id === admin.id && (
              <span className="amp-row__you">{lang === 'ar' ? 'أنت' : 'You'}</span>
            )}
            <div className="amp-row__actions">
              <button className="amp-btn amp-btn--edit" onClick={() => openEdit(acc)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
                {t('admin.editAdmin')}
              </button>
              {acc.role !== 'superadmin' && (
                <button className="amp-btn amp-btn--remove" onClick={() => handleRemove(acc)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5M4 4l1 9h6l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('admin.removeAdmin')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === 'add' ? t('admin.addAdmin') : t('admin.editAdmin')}
      >
        <div className="amp-form">
          <div className="amp-group">
            <label className="amp-label">{t('admin.adminName')} *</label>
            <input
              className="amp-input"
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder={lang === 'ar' ? 'الاسم الظاهر' : 'Display name'}
            />
          </div>
          <div className="amp-group">
            <label className="amp-label">{t('admin.adminUsername')} *</label>
            <input
              className="amp-input"
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
              dir="ltr"
            />
          </div>
          <div className="amp-group">
            <label className="amp-label">
              {modalMode === 'add' ? t('admin.adminPassword') : t('admin.newPassword')}
              {modalMode === 'add' ? ' *' : ''}
            </label>
            <input
              className="amp-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={modalMode === 'add' ? '••••••••' : lang === 'ar' ? 'اتركه فارغاً للإبقاء' : 'Leave blank to keep'}
              dir="ltr"
            />
          </div>
          <div className="amp-group">
            <label className="amp-check-row">
              <input
                type="checkbox"
                checked={form.canManageUsers}
                onChange={(e) => setForm((f) => ({ ...f, canManageUsers: e.target.checked }))}
              />
              {lang === 'ar' ? 'صلاحية إدارة المستخدمين' : 'Can manage users'}
            </label>
          </div>
          <div className="amp-group">
            <label className="amp-label">{t('admin.groupAccess')}</label>
            {SECTIONS.map((section) => (
              <div key={section} className="amp-section-block">
                <p className="amp-section-label">{t(`sections.${section}`)}</p>
                <div className="amp-groups-row">
                  {SECTION_GROUPS[section].map((g) => (
                    <label key={g} className="amp-group-check">
                      <input
                        type="checkbox"
                        checked={(form.allowedGroups ?? []).includes(g)}
                        onChange={(e) => {
                          const prev = form.allowedGroups ?? [];
                          setForm((f) => ({
                            ...f,
                            allowedGroups: e.target.checked
                              ? [...prev, g]
                              : prev.filter((x) => x !== g),
                          }));
                        }}
                      />
                      {t(`groups.${g}`)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="amp-error">{error}</p>}
          <div className="amp-actions">
            <button className="amp-btn amp-btn--ghost" onClick={closeModal}>{t('admin.cancel')}</button>
            <button className="amp-btn amp-btn--primary" onClick={handleSave}>{t('admin.save')}</button>
          </div>
        </div>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
