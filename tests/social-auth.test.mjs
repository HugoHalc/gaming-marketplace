import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadTypescript(relativePath, mocks = {}) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, {
    module: loadedModule,
    exports: loadedModule.exports,
    URL,
    Headers,
    Response,
    require(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      return require(specifier);
    },
  }, { filename });
  return loadedModule.exports;
}

const safeNextPath = loadTypescript("src/features/auth/safe-next.ts").safeNextPath;

function loadOAuth() {
  return loadTypescript("src/features/auth/oauth.ts", {
    "@/config/site": { officialSiteUrl: "https://boostingpedia.com" },
    "@/features/auth/safe-next": { safeNextPath },
  });
}

function redirectResponse(url) {
  return {
    status: 307,
    headers: new Headers({ location: String(url) }),
  };
}

function callbackRequest(pathname) {
  const url = new URL(pathname, "https://boostingpedia.com");
  return { url: url.toString(), nextUrl: url };
}

function loadCallback(exchangeCodeForSession) {
  return loadTypescript("src/app/auth/callback/route.ts", {
    "next/server": {
      NextResponse: { redirect: redirectResponse },
    },
    "@/features/auth/safe-next": { safeNextPath },
    "@/lib/supabase/auth": {
      createAuthServerClient: async () => ({
        auth: { exchangeCodeForSession },
      }),
    },
  });
}

test("Google and Discord use signInWithOAuth with the canonical callback", async () => {
  const { startSocialOAuth } = loadOAuth();
  const calls = [];
  const client = {
    auth: {
      async signInWithOAuth(options) {
        calls.push(options);
        return { error: null };
      },
    },
  };

  await startSocialOAuth(client, "google", "https://preview-123.vercel.app", "/dashboard/orders?from=checkout");
  await startSocialOAuth(client, "discord", "https://boostingpedia.com", "/games/dota-2");

  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    {
      provider: "google",
      options: {
        redirectTo: "https://boostingpedia.com/auth/callback?next=%2Fdashboard%2Forders%3Ffrom%3Dcheckout",
      },
    },
    {
      provider: "discord",
      options: {
        redirectTo: "https://boostingpedia.com/auth/callback?next=%2Fgames%2Fdota-2",
      },
    },
  ]);
});

test("OAuth callback URL preserves localhost and rejects an external next destination", () => {
  const { createOAuthCallbackUrl } = loadOAuth();
  assert.equal(
    createOAuthCallbackUrl("http://localhost:3000", "/checkout?step=account"),
    "http://localhost:3000/auth/callback?next=%2Fcheckout%3Fstep%3Daccount",
  );
  assert.equal(
    createOAuthCallbackUrl("https://boostingpedia.com", "https://evil.example/steal"),
    "https://boostingpedia.com/auth/callback?next=%2Fdashboard",
  );
});

test("callback exchanges the PKCE code and preserves a safe internal destination", async () => {
  const codes = [];
  const callback = loadCallback(async (code) => {
    codes.push(code);
    return { error: null };
  });
  const response = await callback.GET(
    callbackRequest("/auth/callback?code=oauth-code&next=%2Fdashboard%2Forders%3Ffrom%3Dcheckout"),
  );

  assert.deepEqual(codes, ["oauth-code"]);
  assert.equal(response.headers.get("location"), "https://boostingpedia.com/dashboard/orders?from=checkout");
});

test("callback rejects external redirects after a successful exchange", async () => {
  const callback = loadCallback(async () => ({ error: null }));
  const response = await callback.GET(
    callbackRequest("/auth/callback?code=oauth-code&next=https%3A%2F%2Fevil.example%2Fsteal"),
  );
  assert.equal(response.headers.get("location"), "https://boostingpedia.com/dashboard");
});

test("callback handles a missing code, cancellation, and failed exchange safely", async () => {
  let exchanges = 0;
  const successCallback = loadCallback(async () => {
    exchanges += 1;
    return { error: null };
  });
  const missing = await successCallback.GET(
    callbackRequest("/auth/callback?next=%2Fgames"),
  );
  const cancelled = await successCallback.GET(
    callbackRequest("/auth/callback?error=access_denied&error_description=private-data&next=%2Fgames"),
  );
  assert.equal(exchanges, 0);
  assert.equal(
    missing.headers.get("location"),
    "https://boostingpedia.com/login?oauthError=missing&next=%2Fgames",
  );
  assert.equal(
    cancelled.headers.get("location"),
    "https://boostingpedia.com/login?oauthError=cancelled&next=%2Fgames",
  );
  assert.doesNotMatch(cancelled.headers.get("location"), /private-data/);

  const failedCallback = loadCallback(async () => ({ error: new Error("sensitive") }));
  const failed = await failedCallback.GET(
    callbackRequest("/auth/callback?code=bad-code&next=%2Fgames"),
  );
  assert.equal(
    failed.headers.get("location"),
    "https://boostingpedia.com/login?oauthError=failed&next=%2Fgames",
  );
  assert.doesNotMatch(failed.headers.get("location"), /sensitive|bad-code/);
});

test("email/password remains intact and both auth pages expose accessible OAuth UI", () => {
  const loginAction = readFileSync(path.join(root, "src/app/login/actions.ts"), "utf8");
  const registerAction = readFileSync(path.join(root, "src/app/register/actions.ts"), "utf8");
  const loginPage = readFileSync(path.join(root, "src/app/login/page.tsx"), "utf8");
  const registerPage = readFileSync(path.join(root, "src/app/register/page.tsx"), "utf8");
  const buttons = readFileSync(path.join(root, "src/components/auth/social-sign-in-buttons.tsx"), "utf8");

  assert.match(loginAction, /signInWithPassword/);
  assert.match(registerAction, /auth\.signUp/);
  assert.match(loginPage, /<SocialSignInButtons/);
  assert.match(registerPage, /<SocialSignInButtons/);
  assert.match(loginPage, /Or continue with/i);
  assert.match(registerPage, /Or continue with/i);
  assert.match(buttons, /aria-label="Continue with Google"/);
  assert.match(buttons, /aria-label="Continue with Discord"/);
  assert.match(buttons, /sm:grid-cols-2/);
  assert.match(buttons, /inFlightRef\.current/);
  assert.match(buttons, /disabled=\{Boolean\(loadingProvider\)\}/);
  assert.match(buttons, /role="alert"/);
});

test("OAuth cannot assign roles and existing privileged roles remain database-authorized", () => {
  const oauthSource = readFileSync(path.join(root, "src/features/auth/oauth.ts"), "utf8");
  const callbackSource = readFileSync(path.join(root, "src/app/auth/callback/route.ts"), "utf8");
  for (const source of [oauthSource, callbackSource]) {
    assert.doesNotMatch(source, /user_metadata|app_metadata|booster_profiles|from\(["']profiles["']\)|role\s*:/);
  }

  const auth = loadTypescript("src/features/auth/server/auth.ts", {
    "next/navigation": { redirect() {} },
    "@/lib/supabase/auth": {},
    "@/lib/supabase/env": {},
  });
  assert.equal(auth.resolveEffectiveRole(undefined, false), "customer");
  assert.equal(auth.resolveEffectiveRole("customer", false), "customer");
  assert.equal(auth.resolveEffectiveRole("booster", true), "booster");
  assert.equal(auth.resolveEffectiveRole("admin", false), "admin");
  assert.equal(auth.resolveEffectiveRole("admin", true), "admin");
});
