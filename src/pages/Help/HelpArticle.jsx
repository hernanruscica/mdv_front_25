import { useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Title1 } from '../../components/Title1/Title1';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import styles from './HelpArticle.module.css';
import { getArticleBySlug, slugify } from './articles';

const helpImages = import.meta.glob('../../../docs/imagenes/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

const helpImagesByBasename = Object.fromEntries(
  Object.entries(helpImages).map(([key, url]) => [key.split('/').pop(), url])
);

const imageBasename = (src) => {
  if (!src) return null;
  return src.split('/').pop();
};

const headingSlug = (children) => {
  const text = Array.isArray(children) ? children.join('') : children;
  return slugify(String(text));
};

const HelpArticle = () => {
  const { articleSlug } = useParams();
  const article = getArticleBySlug(articleSlug);

  if (!article) {
    return <Navigate to="/ayuda" replace />;
  }

  const renderImage = ({ src, alt }) => {
    const resolved = helpImagesByBasename[imageBasename(src)];
    return (
      <img
        src={resolved || src}
        alt={alt || ''}
        className={styles.articleImage}
      />
    );
  };

  return (
    <>
      <Title1 type="ayuda" text={article.title} />

      <BreadcrumbAuto />

      <div className={styles.articleContent}>
        {article.sections?.length > 0 && (
          <div className={`${cardInfoStyles.cardBase} ${styles.summaryCard}`}>
            <div className={cardInfoStyles.headerWrapper}>
              <div className={cardInfoStyles.title}>
                <img
                  src={article.iconSrc}
                  alt="Resumen"
                  className={cardInfoStyles.icon}
                />
                <span className={cardInfoStyles.text}>Resumen del tutorial</span>
              </div>
            </div>
            <div className={cardInfoStyles.bodyContent}>
              <p className={styles.summaryLead}>
                Índice de secciones: haga clic en cada título para ir
                directamente a esa parte del tutorial.
              </p>
              <ol className={styles.summaryList}>
                {article.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={styles.summaryLink}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: renderImage,
            h2: ({ children }) => (
              <h2 id={headingSlug(children)}>{children}</h2>
            ),
          }}
        >
          {article.md}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default HelpArticle;
