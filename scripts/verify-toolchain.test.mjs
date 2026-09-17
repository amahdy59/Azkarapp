import { describe, expect, it } from "vitest";
import { inspectToolchain } from "./verify-toolchain.mjs";

const validToolchain = {
  nodeVersion: "24.19.0",
  pnpmUserAgent: "pnpm/11.19.0 npm/? node/v24.19.0 win32 x64",
  packageManager: "pnpm@11.19.0",
  nvmVersion: "24.15.0",
};

describe("toolchain verification", () => {
  it("accepts the pinned pnpm release and a compatible Node major", () => {
    expect(inspectToolchain(validToolchain).errors).toEqual([]);
  });

  it("rejects a different pnpm release", () => {
    const result = inspectToolchain({
      ...validToolchain,
      pnpmUserAgent: "pnpm/11.21.0 npm/? node/v24.19.0 win32 x64",
    });

    expect(result.errors).toContain("pnpm 11.19.0 is required; current pnpm is 11.21.0.");
  });

  it("rejects a different Node major", () => {
    const result = inspectToolchain({ ...validToolchain, nodeVersion: "22.22.0" });

    expect(result.errors).toContain("Node 24.x is required; current Node is 22.22.0.");
  });

  it("requires invocation through pnpm", () => {
    const result = inspectToolchain({ ...validToolchain, pnpmUserAgent: undefined });

    expect(result.errors).toContain("Run this check through pnpm so its exact version can be verified.");
  });
});
