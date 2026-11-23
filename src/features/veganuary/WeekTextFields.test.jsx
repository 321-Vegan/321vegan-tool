import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WeekTextFields from "./WeekTextFields";

const week = {
  number: 1,
  title: "Les bases",
  days: [
    {
      number: 1,
      icon: "info",
      steps: [
        {
          type: "info",
          title: "Le véganisme",
          blocks: [
            { type: "text", text: "Un mode de vie" },
            { type: "bullets", items: ["Alimentation", "Vêtements"] },
          ],
        },
        { type: "myth" },
      ],
    },
  ],
};

describe("WeekTextFields", () => {
  it("opens a day, then a page, and edits its texts by path", () => {
    const onChange = vi.fn();
    render(<WeekTextFields week={week} onChange={onChange} />);

    expect(screen.getByDisplayValue("Les bases")).toBeInTheDocument();
    // Closed until opened: only drawn on demand
    expect(screen.queryByDisplayValue("Un mode de vie")).toBeNull();

    fireEvent.click(screen.getByText("Jour 1"));
    fireEvent.click(screen.getByText("Page · Le véganisme"));
    // A day's structure (its icon, the idée reçue step) isn't a text
    expect(screen.queryByDisplayValue("info")).toBeNull();

    fireEvent.change(screen.getByDisplayValue("Un mode de vie"), {
      target: { value: "Une philosophie" },
    });
    expect(onChange).toHaveBeenCalledWith(
      ["days", 0, "steps", 0, "blocks", 0, "text"],
      "Une philosophie",
    );

    fireEvent.change(screen.getByDisplayValue("Vêtements"), {
      target: { value: "Habits" },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      ["days", 0, "steps", 0, "blocks", 1, "items", 1],
      "Habits",
    );
  });

  const appWeek = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../321vegan-app/flutter_app/lib/assets/veganuary/week1.json",
  );

  it.skipIf(!existsSync(appWeek))("draws the app's week 1", () => {
    const content = JSON.parse(readFileSync(appWeek, "utf8"));
    render(<WeekTextFields week={content} onChange={() => {}} />);
    for (const day of content.days)
      fireEvent.click(screen.getByText(`Jour ${day.number}`));
    expect(screen.getAllByRole("button").length).toBeGreaterThan(20);
  });
});
