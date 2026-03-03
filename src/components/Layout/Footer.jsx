import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import './Footer.css';

export default function Footer() {
  const { lang } = useLanguage();
  const t = useT(lang);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">
          <span className="foot-x">X</span>elix
        </span>
        <span className="footer-sep">·</span>
        <span className="footer-credit">
          {t('footer.poweredBy')}{' '}
          <strong>{t('footer.designer')}</strong>
          {' '}&mdash;{' '}
          <span className="footer-team">{t('footer.team')}</span>
        </span>
      </div>
    </footer>
  );
}
