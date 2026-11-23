// Checks a Veganuary week before it's sent, as the app reads it
// (flutter_app/lib/models/veganuary/veganuary_content.dart): what the app
// can't read would be left out, or the whole week ignored. Keep the kinds
// below in sync with the app's.

export const STEP_TYPES = ["info", "myth", "recipe", "quiz"];
export const BLOCK_TYPES = [
  "text",
  "bullets",
  "image",
  "callout",
  "app_link",
  "grid",
];
export const APP_LINK_TARGETS = [
  "b12_info",
  "b12_reminder",
  "restaurants_map",
  "products_map",
  "partners",
  "download_answers",
  "download_recipes",
  "scanner",
  "search_cosmetics",
  "search_additives",
  "vegandex",
];
export const QUIZ_RESULTS = ["right", "partial", "wrong"];

const isString = (value) => typeof value === "string" && value.trim() !== "";
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Returns the errors found, each with where it is ("Jour 3 › Page 2 ›
// Bloc 1"): none when the week can be sent.
export function validateWeek(week, { number } = {}) {
  const errors = [];
  const fail = (path, message) =>
    errors.push({ path: path.join(" › "), message });

  const requireString = (object, key, path) => {
    if (!isString(object?.[key])) fail(path, `« ${key} » manquant ou vide`);
  };

  const checkStrings = (list, key, path) => {
    if (!Array.isArray(list) || list.some((item) => typeof item !== "string"))
      fail(path, `« ${key} » doit être une liste de textes`);
  };

  // A page of text: blocks, then its sources ([1] in the text is the first)
  const checkInfo = (info, path, { needsTitle = true } = {}) => {
    if (needsTitle) requireString(info, "title", path);
    const blocks = info.blocks ?? [];
    if (!Array.isArray(blocks)) {
      fail(path, "« blocks » doit être une liste");
      return;
    }
    blocks.forEach((block, i) => checkBlock(block, [...path, `Bloc ${i + 1}`]));
    const sources = info.sources ?? [];
    if (!Array.isArray(sources)) {
      fail(path, "« sources » doit être une liste");
      return;
    }
    sources.forEach((source, i) => {
      requireString(source, "label", [...path, `Source ${i + 1}`]);
      requireString(source, "url", [...path, `Source ${i + 1}`]);
    });
    // A grid card's details have their own sources
    const text = JSON.stringify(blocks, (key, value) =>
      key === "details" ? undefined : value,
    );
    for (const [, n] of text.matchAll(/\[(\d+)\]/g)) {
      if (Number(n) < 1 || Number(n) > sources.length)
        fail(path, `[${n}] n'a pas de source sur la page`);
    }
  };

  const checkBlock = (block, path) => {
    if (!isObject(block)) return fail(path, "Bloc invalide");
    switch (block.type) {
      case "text":
      case "callout":
        return requireString(block, "text", path);
      case "bullets":
        return checkStrings(block.items, "items", path);
      case "image":
        return requireString(block, "src", path);
      case "app_link":
        requireString(block, "label", path);
        if (!APP_LINK_TARGETS.includes(block.target))
          fail(path, `Lien vers l'app inconnu : « ${block.target} »`);
        return;
      case "grid":
        if (!Array.isArray(block.items) || block.items.length === 0)
          return fail(path, "Une grille a besoin de cartes (« items »)");
        block.items.forEach((item, i) => {
          const itemPath = [...path, `Carte ${i + 1}`];
          requireString(item, "label", itemPath);
          if (item.details !== undefined) {
            if (!isObject(item.details))
              fail(itemPath, "« details » doit être un objet");
            else checkInfo(item.details, itemPath, { needsTitle: false });
          }
          (item.links ?? []).forEach((link, j) => {
            if (!isString(link) && !isString(link?.url))
              fail([...itemPath, `Lien ${j + 1}`], "Lien sans URL");
          });
        });
        return;
      default:
        fail(path, `Type de bloc inconnu : « ${block.type} »`);
    }
  };

  const checkStep = (step, path) => {
    if (!isObject(step)) return fail(path, "Page invalide");
    switch (step.type) {
      case "info":
        return checkInfo(step, path);
      case "myth":
        return;
      case "recipe":
        requireString(step, "title", path);
        if (!Array.isArray(step.ingredients))
          fail(path, "« ingredients » doit être une liste");
        else
          step.ingredients.forEach((entry, i) => {
            if (typeof entry === "string") return;
            const groupPath = [...path, `Ingrédients ${i + 1}`];
            if (!isObject(entry))
              return fail(groupPath, "Ingrédient invalide");
            checkStrings(entry.items, "items", groupPath);
          });
        return checkStrings(step.steps, "steps", path);
      case "quiz":
        requireString(step, "question", path);
        requireString(step, "explanation", path);
        if (!Array.isArray(step.choices) || step.choices.length < 2)
          return fail(path, "Un quiz a besoin d'au moins deux choix");
        step.choices.forEach((choice, i) => {
          requireString(choice, "text", [...path, `Choix ${i + 1}`]);
          if (
            choice?.result !== undefined &&
            !QUIZ_RESULTS.includes(choice.result)
          )
            fail(
              [...path, `Choix ${i + 1}`],
              `Résultat inconnu : « ${choice.result} »`,
            );
        });
        if (!step.choices.some((choice) => choice?.result === "right"))
          fail(path, "Aucun choix n'est la bonne réponse (« right »)");
        return;
      default:
        fail(path, `Type de page inconnu : « ${step.type} »`);
    }
  };

  if (!isObject(week)) {
    fail(["Semaine"], "Le fichier doit contenir un objet JSON");
    return errors;
  }
  if (!Number.isInteger(week.number))
    fail(["Semaine"], "« number » doit être un nombre entier");
  else if (number !== undefined && week.number !== number)
    fail(["Semaine"], `Ce JSON est celui de la semaine ${week.number}`);
  requireString(week, "title", ["Semaine"]);

  (week.myths ?? []).forEach((myth, i) => {
    const path = [`Idée reçue ${i + 1}`];
    requireString(myth, "id", path);
    requireString(myth, "label", path);
    if (!isObject(myth?.answer)) fail(path, "« answer » manquant");
    else checkInfo(myth.answer, [...path, "Réponse"]);
  });

  if (!Array.isArray(week.days) || week.days.length === 0) {
    fail(["Semaine"], "Une semaine a besoin de jours (« days »)");
    return errors;
  }
  week.days.forEach((day, i) => {
    const path = [`Jour ${day?.number ?? `#${i + 1}`}`];
    if (!Number.isInteger(day?.number))
      fail(path, "« number » doit être un nombre entier");
    if (!Array.isArray(day?.steps) || day.steps.length === 0)
      return fail(path, "Un jour a besoin de pages (« steps »)");
    day.steps.forEach((step, j) => checkStep(step, [...path, `Page ${j + 1}`]));
    (day.recap ?? []).forEach((card, j) => {
      requireString(card, "title", [...path, `Récap ${j + 1}`]);
    });
  });

  return errors;
}
