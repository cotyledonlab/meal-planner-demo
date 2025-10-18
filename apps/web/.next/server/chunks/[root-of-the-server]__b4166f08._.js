module.exports = [
"[project]/apps/web/.next-internal/server/app/api/trpc/[trpc]/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/web/src/env.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$t3$2d$oss$2b$env$2d$nextjs$40$0$2e$12$2e$0_typescript$40$5$2e$9$2e$3_zod$40$3$2e$25$2e$76$2f$node_modules$2f40$t3$2d$oss$2f$env$2d$nextjs$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@t3-oss+env-nextjs@0.12.0_typescript@5.9.3_zod@3.25.76/node_modules/@t3-oss/env-nextjs/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
;
const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$t3$2d$oss$2b$env$2d$nextjs$40$0$2e$12$2e$0_typescript$40$5$2e$9$2e$3_zod$40$3$2e$25$2e$76$2f$node_modules$2f40$t3$2d$oss$2f$env$2d$nextjs$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEnv"])({
    /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */ server: {
        AUTH_SECRET: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        AUTH_DISCORD_ID: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        AUTH_DISCORD_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        DATABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
        NODE_ENV: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'development',
            'test',
            'production'
        ]).default('development')
    },
    /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */ client: {
    },
    /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */ runtimeEnv: {
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
        AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: ("TURBOPACK compile-time value", "development")
    },
    /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */ skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */ emptyStringAsUndefined: true
});
// Validate that Discord auth credentials are provided together
if (!process.env.SKIP_ENV_VALIDATION && (env.AUTH_DISCORD_ID && !env.AUTH_DISCORD_SECRET || !env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET)) {
    throw new Error('Invalid Discord auth configuration: set both AUTH_DISCORD_ID and AUTH_DISCORD_SECRET, or remove both.');
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs) <export randomFillSync as default>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomFillSync"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@node-rs/argon2 [external] (@node-rs/argon2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@node-rs/argon2", () => require("@node-rs/argon2"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/apps/web/src/server/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/env.js [app-route] (ecmascript)");
;
;
const createPrismaClient = ()=>new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
        log: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NODE_ENV === 'development' ? [
            'query',
            'error',
            'warn'
        ] : [
            'error'
        ]
    });
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? createPrismaClient();
if (__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NODE_ENV !== 'production') globalForPrisma.prisma = db;
}),
"[project]/apps/web/src/server/auth/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authConfig",
    ()=>authConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$prisma$2d$adapter$40$2$2e$11$2e$0_$40$prisma$2b$client$40$6$2e$17$2e$1_prisma$40$6$2e$17$2e$1_magicast$40$0$2e$3$2e$5_typescript$40$5$2e$9$2e$3_$5f$typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@auth+prisma-adapter@2.11.0_@prisma+client@6.17.1_prisma@6.17.1_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3_/node_modules/@auth/prisma-adapter/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$5$2e$0$2e$0$2d$beta$2e$25_next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@5.0.0-beta.25_next@15.5.5_@babel+core@7.28.4_react-dom@19.2.0_react@19.2.0__react@19.2.0__react@19.2.0/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$core$40$0$2e$37$2e$2$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@auth+core@0.37.2/node_modules/@auth/core/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$5$2e$0$2e$0$2d$beta$2e$25_next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2d$auth$2f$providers$2f$discord$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@5.0.0-beta.25_next@15.5.5_@babel+core@7.28.4_react-dom@19.2.0_react@19.2.0__react@19.2.0__react@19.2.0/node_modules/next-auth/providers/discord.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$core$40$0$2e$37$2e$2$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$discord$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@auth+core@0.37.2/node_modules/@auth/core/providers/discord.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$node$2d$rs$2f$argon2__$5b$external$5d$__$2840$node$2d$rs$2f$argon2$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@node-rs/argon2 [external] (@node-rs/argon2, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/db.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const signInSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const authConfig = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$core$40$0$2e$37$2e$2$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: 'Email & Password',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                const parsed = signInSchema.safeParse(credentials);
                if (!parsed.success) {
                    return null;
                }
                const { email, password } = parsed.data;
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
                    where: {
                        email
                    },
                    include: {
                        password: true
                    }
                });
                if (!user?.password?.hash) {
                    return null;
                }
                const isValid = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$node$2d$rs$2f$argon2__$5b$external$5d$__$2840$node$2d$rs$2f$argon2$2c$__cjs$29$__["verify"])(user.password.hash, password, {
                    memoryCost: 19456,
                    timeCost: 2,
                    outputLen: 32,
                    parallelism: 1
                });
                if (!isValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image
                };
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$core$40$0$2e$37$2e$2$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$discord$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]
    ],
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$auth$2b$prisma$2d$adapter$40$2$2e$11$2e$0_$40$prisma$2b$client$40$6$2e$17$2e$1_prisma$40$6$2e$17$2e$1_magicast$40$0$2e$3$2e$5_typescript$40$5$2e$9$2e$3_$5f$typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"]),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/signin'
    },
    callbacks: {
        jwt: ({ token, user })=>{
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session: ({ session, token })=>({
                ...session,
                user: {
                    ...session.user,
                    id: token.id
                }
            })
    }
};
}),
"[project]/apps/web/src/server/auth/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$5$2e$0$2e$0$2d$beta$2e$25_next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@5.0.0-beta.25_next@15.5.5_@babel+core@7.28.4_react-dom@19.2.0_react@19.2.0__react@19.2.0__react@19.2.0/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.5_@babel+core@7.28.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/config.ts [app-route] (ecmascript)");
;
;
;
const { auth: uncachedAuth, handlers, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$5$2e$0$2e$0$2d$beta$2e$25_next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authConfig"]);
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$5_$40$babel$2b$core$40$7$2e$28$2e$4_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cache"])(uncachedAuth);
;
}),
"[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */ __turbopack_context__.s([
    "createCallerFactory",
    ()=>createCallerFactory,
    "createTRPCContext",
    ()=>createTRPCContext,
    "createTRPCRouter",
    ()=>createTRPCRouter,
    "protectedProcedure",
    ()=>protectedProcedure,
    "publicProcedure",
    ()=>publicProcedure
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$CB9uBez5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.6.0_typescript@5.9.3/node_modules/@trpc/server/dist/initTRPC-CB9uBez5.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.6.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$superjson$40$2$2e$2$2e$2$2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/auth/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/db.ts [app-route] (ecmascript)");
;
;
;
;
;
const createTRPCContext = async (opts)=>{
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    return {
        db: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"],
        session,
        ...opts
    };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */ const t = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$CB9uBez5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initTRPC"].context().create({
    transformer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$superjson$40$2$2e$2$2e$2$2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"],
    errorFormatter ({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"] ? error.cause.flatten() : null
            }
        };
    }
});
const createCallerFactory = t.createCallerFactory;
const createTRPCRouter = t.router;
/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */ const timingMiddleware = t.middleware(async ({ next, path })=>{
    const start = Date.now();
    if (t._config.isDev) {
        // artificial delay in dev
        const waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve)=>setTimeout(resolve, waitMs));
    }
    const result = await next();
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
    return result;
});
const publicProcedure = t.procedure.use(timingMiddleware);
const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next })=>{
    if (!ctx.session?.user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: 'UNAUTHORIZED'
        });
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: {
                ...ctx.session,
                user: ctx.session.user
            }
        }
    });
});
}),
"[project]/apps/web/src/server/api/routers/post.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "postRouter",
    ()=>postRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
;
;
const postRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    hello: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(({ input })=>{
        return {
            greeting: `Hello ${input.text}`
        };
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        return ctx.db.post.create({
            data: {
                name: input.name,
                createdBy: {
                    connect: {
                        id: ctx.session.user.id
                    }
                }
            }
        });
    }),
    getLatest: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const post = await ctx.db.post.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                createdBy: {
                    id: ctx.session.user.id
                }
            }
        });
        return post ?? null;
    }),
    getSecretMessage: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(()=>{
        return 'you can now see this secret message!';
    })
});
}),
"[project]/apps/web/src/server/api/routers/preferences.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "preferencesRouter",
    ()=>preferencesRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
;
;
const preferencesRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    // Get user preferences
    get: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const preferences = await ctx.db.userPreferences.findUnique({
            where: {
                userId: ctx.session.user.id
            }
        });
        // Return default preferences if none exist
        if (!preferences) {
            return {
                householdSize: 2,
                mealsPerDay: 1,
                days: 7,
                isVegetarian: false,
                isDairyFree: false,
                dislikes: ''
            };
        }
        return preferences;
    }),
    // Update user preferences
    update: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        householdSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(10),
        mealsPerDay: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(3),
        days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(3).max(7),
        isVegetarian: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        isDairyFree: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        dislikes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })).mutation(async ({ ctx, input })=>{
        const preferences = await ctx.db.userPreferences.upsert({
            where: {
                userId: ctx.session.user.id
            },
            create: {
                userId: ctx.session.user.id,
                ...input
            },
            update: input
        });
        return preferences;
    })
});
}),
"[project]/apps/web/src/server/api/routers/mealPlan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mealPlanRouter",
    ()=>mealPlanRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
;
;
/**
 * Rule-based meal plan generator
 * Filters recipes based on user preferences and creates a balanced plan
 */ async function generateMealPlan(ctx, preferences) {
    const dislikeList = preferences.dislikes ? preferences.dislikes.split(',').map((d)=>d.trim().toLowerCase()) : [];
    // Fetch recipes that match dietary preferences
    const allRecipes = await ctx.db.recipe.findMany({
        where: {
            AND: [
                preferences.isVegetarian ? {
                    isVegetarian: true
                } : {},
                preferences.isDairyFree ? {
                    isDairyFree: true
                } : {}
            ]
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true
                }
            }
        }
    });
    // Filter out recipes with disliked ingredients
    const filteredRecipes = allRecipes.filter((recipe)=>{
        if (dislikeList.length === 0) return true;
        const recipeIngredients = recipe.ingredients.map((ri)=>ri.ingredient.name.toLowerCase());
        return !dislikeList.some((dislike)=>recipeIngredients.some((ing)=>ing.includes(dislike)));
    });
    if (filteredRecipes.length === 0) {
        throw new Error('No recipes match your preferences. Please adjust your settings.');
    }
    // Generate meal plan items
    const selectedRecipes = [];
    // Simple round-robin selection to ensure variety
    let recipeIndex = 0;
    for(let day = 0; day < preferences.days; day++){
        for(let meal = 0; meal < preferences.mealsPerDay; meal++){
            const recipe = filteredRecipes[recipeIndex % filteredRecipes.length];
            if (!recipe) continue;
            // Determine meal type
            let mealType = 'dinner';
            if (preferences.mealsPerDay === 2) {
                mealType = meal === 0 ? 'lunch' : 'dinner';
            } else if (preferences.mealsPerDay === 3) {
                mealType = meal === 0 ? 'breakfast' : meal === 1 ? 'lunch' : 'dinner';
            }
            selectedRecipes.push({
                recipe,
                dayIndex: day,
                mealType
            });
            recipeIndex++;
        }
    }
    return selectedRecipes;
}
const mealPlanRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    // Get current or latest meal plan for user
    getCurrent: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const latestPlan = await ctx.db.mealPlan.findFirst({
            where: {
                userId: ctx.session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                items: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: {
                                    include: {
                                        ingredient: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: [
                        {
                            dayIndex: 'asc'
                        },
                        {
                            mealType: 'asc'
                        }
                    ]
                }
            }
        });
        return latestPlan;
    }),
    // Generate a new meal plan
    generate: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        householdSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(10).optional(),
        mealsPerDay: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(3).optional(),
        days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(3).max(7).optional(),
        isVegetarian: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        isDairyFree: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        dislikes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })).mutation(async ({ ctx, input })=>{
        // Get user preferences or use input
        let preferences = await ctx.db.userPreferences.findUnique({
            where: {
                userId: ctx.session.user.id
            }
        });
        // If no preferences exist, create them from input or defaults
        if (!preferences) {
            preferences = await ctx.db.userPreferences.create({
                data: {
                    userId: ctx.session.user.id,
                    householdSize: input.householdSize ?? 2,
                    mealsPerDay: input.mealsPerDay ?? 1,
                    days: input.days ?? 7,
                    isVegetarian: input.isVegetarian ?? false,
                    isDairyFree: input.isDairyFree ?? false,
                    dislikes: input.dislikes ?? ''
                }
            });
        } else if (Object.keys(input).length > 0) {
            // Update preferences if input provided
            preferences = await ctx.db.userPreferences.update({
                where: {
                    userId: ctx.session.user.id
                },
                data: {
                    ...input
                }
            });
        }
        // Generate meal plan
        const selectedRecipes = await generateMealPlan(ctx, preferences);
        // Create meal plan in database
        const mealPlan = await ctx.db.mealPlan.create({
            data: {
                userId: ctx.session.user.id,
                startDate: new Date(),
                days: preferences.days,
                items: {
                    create: selectedRecipes.map((item)=>({
                            dayIndex: item.dayIndex,
                            mealType: item.mealType,
                            recipeId: item.recipe.id,
                            servings: preferences.householdSize
                        }))
                }
            },
            include: {
                items: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: {
                                    include: {
                                        ingredient: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: [
                        {
                            dayIndex: 'asc'
                        },
                        {
                            mealType: 'asc'
                        }
                    ]
                }
            }
        });
        return mealPlan;
    }),
    // Delete a meal plan
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).mutation(async ({ ctx, input })=>{
        // Verify ownership
        const plan = await ctx.db.mealPlan.findUnique({
            where: {
                id: input.id
            }
        });
        if (!plan || plan.userId !== ctx.session.user.id) {
            throw new Error('Meal plan not found or access denied');
        }
        await ctx.db.mealPlan.delete({
            where: {
                id: input.id
            }
        });
        return {
            success: true
        };
    })
});
}),
"[project]/apps/web/src/lib/unitConverter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Unit converter utilities for recipe measurements
 * Converts common cooking measurements to normalized units (g, ml, pcs)
 */ __turbopack_context__.s([
    "aggregateIngredients",
    ()=>aggregateIngredients,
    "convertToNormalizedUnit",
    ()=>convertToNormalizedUnit,
    "formatQuantity",
    ()=>formatQuantity
]);
const conversionRules = {
    // Weight conversions to grams
    'g': {
        toUnit: 'g',
        multiplier: 1
    },
    'kg': {
        toUnit: 'g',
        multiplier: 1000
    },
    'oz': {
        toUnit: 'g',
        multiplier: 28.35
    },
    'lb': {
        toUnit: 'g',
        multiplier: 453.592
    },
    // Volume conversions to milliliters
    'ml': {
        toUnit: 'ml',
        multiplier: 1
    },
    'l': {
        toUnit: 'ml',
        multiplier: 1000
    },
    'tsp': {
        toUnit: 'ml',
        multiplier: 5
    },
    'tbsp': {
        toUnit: 'ml',
        multiplier: 15
    },
    'cup': {
        toUnit: 'ml',
        multiplier: 240
    },
    'fl oz': {
        toUnit: 'ml',
        multiplier: 29.5735
    },
    // Pieces/count (no conversion)
    'pcs': {
        toUnit: 'pcs',
        multiplier: 1
    },
    'pieces': {
        toUnit: 'pcs',
        multiplier: 1
    },
    'count': {
        toUnit: 'pcs',
        multiplier: 1
    },
    'whole': {
        toUnit: 'pcs',
        multiplier: 1
    }
};
function convertToNormalizedUnit(quantity, unit) {
    const normalizedInputUnit = unit.toLowerCase().trim();
    const rule = conversionRules[normalizedInputUnit];
    if (!rule) {
        throw new Error(`Unknown unit: ${unit}. Cannot convert to normalized unit.`);
    }
    return {
        quantity: quantity * rule.multiplier,
        unit: rule.toUnit
    };
}
function aggregateIngredients(ingredients) {
    const aggregated = new Map();
    for (const ing of ingredients){
        const normalized = convertToNormalizedUnit(ing.quantity, ing.unit);
        const existing = aggregated.get(ing.ingredientId);
        if (existing) {
            if (existing.unit !== normalized.unit) {
                throw new Error(`Cannot aggregate ingredients with different unit types: ${existing.unit} vs ${normalized.unit}`);
            }
            existing.quantity += normalized.quantity;
        } else {
            aggregated.set(ing.ingredientId, {
                ...normalized
            });
        }
    }
    return aggregated;
}
function formatQuantity(quantity, unit) {
    const rounded = Math.round(quantity * 10) / 10; // Round to 1 decimal place
    if (unit === 'pcs') {
        return `${Math.round(quantity)} pcs`;
    }
    // Convert large quantities to larger units for readability
    if (unit === 'g' && quantity >= 1000) {
        return `${(rounded / 1000).toFixed(1)}kg`;
    }
    if (unit === 'ml' && quantity >= 1000) {
        return `${(rounded / 1000).toFixed(1)}L`;
    }
    return `${rounded}${unit}`;
}
}),
"[project]/apps/web/src/server/api/routers/shoppingList.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shoppingListRouter",
    ()=>shoppingListRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$unitConverter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/unitConverter.ts [app-route] (ecmascript)");
;
;
;
const shoppingListRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    // Generate shopping list for a meal plan
    getForMealPlan: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mealPlanId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        // Verify ownership and get meal plan with all recipes
        const mealPlan = await ctx.db.mealPlan.findUnique({
            where: {
                id: input.mealPlanId
            },
            include: {
                items: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: {
                                    include: {
                                        ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!mealPlan || mealPlan.userId !== ctx.session.user.id) {
            throw new Error('Meal plan not found or access denied');
        }
        // Collect all ingredients from all recipes, scaled by servings
        const allIngredients = [];
        for (const item of mealPlan.items){
            const servingMultiplier = item.servings / item.recipe.servingsDefault;
            for (const recipeIng of item.recipe.ingredients){
                allIngredients.push({
                    ingredientId: recipeIng.ingredientId,
                    quantity: recipeIng.quantity * servingMultiplier,
                    unit: recipeIng.unit
                });
            }
        }
        // Aggregate ingredients
        const aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$unitConverter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggregateIngredients"])(allIngredients);
        // Get pantry items to subtract
        const pantryItems = await ctx.db.pantryItem.findMany({
            where: {
                userId: ctx.session.user.id
            }
        });
        const pantryMap = new Map(pantryItems.map((item)=>[
                item.ingredientId,
                {
                    quantity: item.quantity,
                    unit: item.unit
                }
            ]));
        // Build shopping list with ingredient details
        const shoppingListItems = [];
        for (const [ingredientId, aggData] of aggregated.entries()){
            const ingredient = await ctx.db.ingredient.findUnique({
                where: {
                    id: ingredientId
                }
            });
            if (!ingredient) continue;
            // Subtract pantry items
            let finalQuantity = aggData.quantity;
            const pantryItem = pantryMap.get(ingredientId);
            if (pantryItem && pantryItem.unit === aggData.unit) {
                finalQuantity = Math.max(0, aggData.quantity - pantryItem.quantity);
            }
            if (finalQuantity > 0) {
                shoppingListItems.push({
                    ingredientId: ingredient.id,
                    ingredientName: ingredient.name,
                    category: ingredient.category,
                    quantity: finalQuantity,
                    unit: aggData.unit,
                    formattedQuantity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$unitConverter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatQuantity"])(finalQuantity, aggData.unit)
                });
            }
        }
        // Group by category
        const grouped = shoppingListItems.reduce((acc, item)=>{
            acc[item.category] ??= [];
            acc[item.category].push(item);
            return acc;
        }, {});
        // Calculate price estimates per store
        const priceBaselines = await ctx.db.priceBaseline.findMany();
        const pricesByStore = new Map();
        for (const item of shoppingListItems){
            const categoryBaselines = priceBaselines.filter((pb)=>pb.ingredientCategory === item.category);
            for (const baseline of categoryBaselines){
                // Convert to baseline unit for price calculation
                if (baseline.unit !== item.unit) {
                    continue;
                }
                const itemCost = item.quantity * baseline.pricePerUnit;
                const currentTotal = pricesByStore.get(baseline.store) ?? 0;
                pricesByStore.set(baseline.store, currentTotal + itemCost);
            }
        }
        // Convert to array and sort by price
        const storePrices = Array.from(pricesByStore.entries()).map(([store, totalPrice])=>({
                store,
                totalPrice: Math.round(totalPrice * 100) / 100
            })).sort((a, b)=>a.totalPrice - b.totalPrice);
        const cheapestStore = storePrices[0];
        return {
            mealPlanId: input.mealPlanId,
            items: shoppingListItems,
            grouped,
            storePrices,
            cheapestStore,
            totalItems: shoppingListItems.length
        };
    }),
    // Export shopping list as CSV
    exportCSV: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mealPlanId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        // Get shopping list data
        const shoppingList = await ctx.db.mealPlan.findUnique({
            where: {
                id: input.mealPlanId
            },
            include: {
                items: {
                    include: {
                        recipe: {
                            include: {
                                ingredients: {
                                    include: {
                                        ingredient: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!shoppingList || shoppingList.userId !== ctx.session.user.id) {
            throw new Error('Meal plan not found or access denied');
        }
        // Collect and aggregate ingredients
        const allIngredients = [];
        for (const item of shoppingList.items){
            const servingMultiplier = item.servings / item.recipe.servingsDefault;
            for (const recipeIng of item.recipe.ingredients){
                allIngredients.push({
                    ingredientId: recipeIng.ingredientId,
                    quantity: recipeIng.quantity * servingMultiplier,
                    unit: recipeIng.unit
                });
            }
        }
        const aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$unitConverter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["aggregateIngredients"])(allIngredients);
        // Build CSV content
        let csv = 'Category,Ingredient,Quantity,Unit\n';
        for (const [ingredientId, aggData] of aggregated.entries()){
            const ingredient = await ctx.db.ingredient.findUnique({
                where: {
                    id: ingredientId
                }
            });
            if (!ingredient) continue;
            csv += `${ingredient.category},${ingredient.name},${aggData.quantity},${aggData.unit}\n`;
        }
        return {
            csv
        };
    })
});
}),
"[project]/apps/web/src/server/api/root.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appRouter",
    ()=>appRouter,
    "createCaller",
    ()=>createCaller
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$post$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/routers/post.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$preferences$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/routers/preferences.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$mealPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/routers/mealPlan.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$shoppingList$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/routers/shoppingList.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
;
;
;
;
;
const appRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    post: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$post$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["postRouter"],
    preferences: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$preferences$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preferencesRouter"],
    mealPlan: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$mealPlan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mealPlanRouter"],
    shoppingList: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$routers$2f$shoppingList$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shoppingListRouter"]
});
const createCaller = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCallerFactory"])(appRouter);
}),
"[project]/apps/web/src/app/api/trpc/[trpc]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.6.0_typescript@5.9.3/node_modules/@trpc/server/dist/adapters/fetch/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/env.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$root$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/root.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/server/api/trpc.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */ const createContext = async (req)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCContext"])({
        headers: req.headers
    });
};
const handler = (req)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$6$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchRequestHandler"])({
        endpoint: '/api/trpc',
        req,
        router: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$server$2f$api$2f$root$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appRouter"],
        createContext: ()=>createContext(req),
        onError: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NODE_ENV === 'development' ? ({ path, error })=>{
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        } : undefined
    });
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b4166f08._.js.map