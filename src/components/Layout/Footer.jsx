import { useLanguage } from '../../contexts/LanguageContext';
import { useT } from '../../utils/i18n';
import './Footer.css';

const STUDIO_URL = 'https://afterain.dev';
const KASHIDA = '\u0640';

/** Insert tatweel (كشيدة) before the last letter of each word */
function withKashida(text) {
  return text
    .split(/\s+/)
    .map((word) => (word.length < 2 ? word : `${word.slice(0, -1)}${KASHIDA}${word.slice(-1)}`))
    .join(' ');
}

export default function Footer() {
  const { lang } = useLanguage();
  const t = useT(lang);
  const designerRaw = t('footer.designer');
  const designerDisplay = lang === 'ar' ? withKashida(designerRaw) : designerRaw;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <a
          className="footer-brand"
          href={STUDIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('footer.studio')}
        >
          <span className="footer-brand-mark" aria-hidden="true" />
        </a>
        <p className="footer-credit">
          <span className="footer-credit-main">
            <a className="footer-team" href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              {t('footer.studio')}
            </a>
          </span>
          <span className="footer-designer" aria-label={designerRaw}>
            {designerDisplay}
          </span>
        </p>
      </div>
    </footer>
  );
}
