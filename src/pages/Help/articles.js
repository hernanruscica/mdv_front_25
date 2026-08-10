import tutorialMd from '../../../docs/tutorial-operario.md?raw';

const stripEditorNote = (raw) => {
  return raw.replace(/^> \*\*Nota sobre las imágenes:\*\*.*\n?/, '').trim();
};

export const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export const extractSections = (md) => {
  const sections = [];
  for (const line of md.split('\n')) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      const title = match[1].trim();
      sections.push({ id: slugify(title), title });
    }
  }
  return sections;
};

const tutorialMdContent = stripEditorNote(tutorialMd);

export const helpArticles = [
  {
    slug: 'tutorial-operario',
    title: 'Tutorial Usuario Operario',
    description:
      'Guía completa del rol Operario: activación de cuenta, inicio de sesión, navegación y consulta de ubicaciones, dataloggers, canales y alarmas.',
    iconSrc: '/icons/circle-question.svg',
    md: tutorialMdContent,
    sections: extractSections(tutorialMdContent),
  },
];

export const getArticleBySlug = (slug) =>
  helpArticles.find((article) => article.slug === slug) || null;
