import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import CardInfo from '../../components/CardInfo/CardInfo';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import styles from './Help.module.css';
import { HELP_INFO } from '../../utils/infoContent';
import { helpArticles } from './articles';

const Help = () => {
  return (
    <>
      <Title1 type="ayuda" text="Centro de Ayuda" />

      <InfoAccordion data={HELP_INFO} />

      <BreadcrumbAuto />

      <Title2 text="Artículos de ayuda" type="ayuda" />

      <div className={styles.cardsContainer}>
        {helpArticles.map((article) => (
          <CardInfo
            key={article.slug}
            iconSrc={article.iconSrc}
            title={article.title}
            url={`/ayuda/${article.slug}`}
          >
            <p className={styles.description}>{article.description}</p>
          </CardInfo>
        ))}
      </div>
    </>
  );
};

export default Help;
