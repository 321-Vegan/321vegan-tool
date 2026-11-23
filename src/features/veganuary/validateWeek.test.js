import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { validateWeek } from "./validateWeek";

const week = (days) => ({ number: 1, title: "Les bases", days });
const info = (blocks, sources = []) => ({
  type: "info",
  title: "Page",
  blocks,
  sources,
});

describe("validateWeek", () => {
  it("accepts a valid week", () => {
    expect(
      validateWeek(
        week([
          {
            number: 1,
            steps: [
              info(
                [{ type: "text", text: "Une étude [1]" }],
                [{ label: "Étude", url: "https://example.org" }],
              ),
              { type: "myth" },
            ],
          },
        ]),
        { number: 1 },
      ),
    ).toEqual([]);
  });

  it("refuses what the app doesn't know", () => {
    const errors = validateWeek(
      week([
        {
          number: 1,
          steps: [
            info([
              { type: "video", src: "x" },
              { type: "app_link", label: "Go", target: "nowhere" },
            ]),
            { type: "game" },
          ],
        },
      ]),
    );
    expect(errors.map((error) => error.message)).toEqual([
      "Type de bloc inconnu : « video »",
      "Lien vers l'app inconnu : « nowhere »",
      "Type de page inconnu : « game »",
    ]);
    expect(errors[0].path).toBe("Jour 1 › Page 1 › Bloc 1");
  });

  it("checks the sources, the quiz answers and the week number", () => {
    const errors = validateWeek(
      week([
        {
          number: 1,
          steps: [
            info([{ type: "text", text: "Sans source [2]" }]),
            {
              type: "quiz",
              question: "?",
              explanation: "Parce que.",
              choices: [{ text: "A" }, { text: "B" }],
            },
          ],
        },
      ]),
      { number: 2 },
    );
    expect(errors.map((error) => error.message)).toEqual([
      "Ce JSON est celui de la semaine 1",
      "[2] n'a pas de source sur la page",
      "Aucun choix n'est la bonne réponse (« right »)",
    ]);
  });
});

// The app's own weeks, when its repository is next to this one: they must
// all pass, or the checks are stricter than the app
const appWeeks = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../321vegan-app/flutter_app/lib/assets/veganuary",
);

describe.skipIf(!existsSync(appWeeks))("the app's weeks", () => {
  for (const n of [1, 2, 3, 4, 5]) {
    it(`week ${n} is valid`, () => {
      const file = path.join(appWeeks, `week${n}.json`);
      const content = JSON.parse(readFileSync(file, "utf8"));
      expect(validateWeek(content, { number: n })).toEqual([]);
    });
  }
});
