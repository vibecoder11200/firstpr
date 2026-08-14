// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import ScoreChip from "./ScoreChip";

describe("ScoreChip", () => {
  it("renders the score value as a text node (no HTML injection)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      createRoot(container).render(<ScoreChip score={82} onClick={() => {}} />);
    });
    expect(container.textContent).toContain("82");
    document.body.removeChild(container);
  });
});
