import { describe, expect, it } from "vitest";
import { isBotOwner, stripHtml, toSearchText } from "./sanitize.js";

describe("isBotOwner — anti-gaming bot repo detection", () => {
  it("flags owner type Bot", () => {
    expect(isBotOwner({ type: "Bot", login: "dependabot" })).toBe(true);
  });

  it("flags common bot logins even without the type", () => {
    expect(isBotOwner({ type: "User", login: "dependabot" })).toBe(false);
    expect(isBotOwner({ type: null, login: "renovate[bot]" })).toBe(true);
    expect(isBotOwner({ type: null, login: "some-org" })).toBe(false);
  });

  it("does not flag ordinary users/organizations", () => {
    expect(isBotOwner({ type: "User", login: "facebook" })).toBe(false);
    expect(isBotOwner({ type: "Organization", login: "vercel" })).toBe(false);
    expect(isBotOwner({ type: "User", login: null })).toBe(false);
  });
});

describe("sanitize helpers", () => {
  it("strips HTML and keeps plaintext", () => {
    expect(stripHtml("<p>hello <b>world</b></p>")).toBe("hello world");
  });

  it("builds lowercased search text", () => {
    expect(toSearchText("Add <b>API</b> endpoint")).toBe("add api endpoint");
  });
});