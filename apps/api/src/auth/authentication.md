OK、ここは一度「壊れない構成」に寄せます。
結論から言うと、**openid-clientは捨ててOK**です（今の型変動に巻き込まれやすい）。

代わりに **Auth0 公式SDK + セッション方式 + Hono** で固定すると安定します。

---

# 全体構成（安定版）

```txt
React
  ↓
Hono (BFF)
  ↓
Auth0 (OIDC)
  ↓
Cookie Session
  ↓
API
```

---

# install（これだけ）

```bash
pnpm add hono @auth0/auth0-spa-js
pnpm add -D @types/node
```

※Node側は「トークン検証しない構成」にする（重要）

---

# ① 環境変数

```env
AUTH0_DOMAIN=xxxx.jp.auth0.com
AUTH0_CLIENT_ID=xxxx
AUTH0_CLIENT_SECRET=xxxx
AUTH0_CALLBACK_URL=http://localhost:3000/auth/callback
AUTH0_AUDIENCE=https://your-api
```

---

# ② セッションストア（最小）

```ts
// session.ts
export type User = {
  id: string;
  email?: string;
  name?: string;
};

const store = new Map<string, User>();

export const sessionStore = {
  set(id: string, user: User) {
    store.set(id, user);
  },
  get(id: string) {
    return store.get(id);
  },
  delete(id: string) {
    store.delete(id);
  },
};
```

---

# ③ Hono本体

```ts
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import crypto from 'node:crypto';
import { sessionStore } from './session';

const app = new Hono();
```

---

# ④ login（Auth0へリダイレクト）

```ts
app.get('/auth/login', (c) => {
  const domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;
  const redirectUri = process.env.AUTH0_CALLBACK_URL!;

  const url =
    `https://${domain}/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid profile email`;

  return c.redirect(url);
});
```

---

# ⑤ callback（トークン交換）

```ts
app.get('/auth/callback', async (c) => {
  const code = c.req.query('code');

  const tokenRes = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: process.env.AUTH0_CALLBACK_URL,
      }),
    },
  );

  const token = await tokenRes.json();

  const userRes = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );

  const user = await userRes.json();

  const sessionId = crypto.randomUUID();

  sessionStore.set(sessionId, {
    id: user.sub,
    email: user.email,
    name: user.name,
  });

  c.cookie('session', sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false, // prodでtrue
  });

  return c.redirect('/');
});
```

---

# ⑥ auth middleware（あなたの既存設計と接続）

```ts
const authMiddleware = createMiddleware(async (c, next) => {
  const sessionId = c.req.cookie('session');

  if (!sessionId) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const user = sessionStore.get(sessionId);

  if (!user) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  c.set('user', user);

  await next();
});
```

---

# ⑦ 保護API

```ts
app.get('/api/me', authMiddleware, (c) => {
  return c.json({
    user: c.get('user'),
  });
});
```

---

# ⑧ export

```ts
export default app;
```

---

# React側（超最小）

```ts
// login
window.location.href = '/auth/login';
```

```ts
// API
fetch('/api/me', {
  credentials: 'include',
});
```

---

# この構成のポイント（重要）

## ① Auth0は完全外部化

→ Honoはトークン検証しない

---

## ② セッション方式

→ ブラウザはCookieだけ持つ

---

## ③ TS的に安定

→ openid-client不要

---

## ④ CloudFrontと相性良い

→ 同一ドメイン構成が自然

---

# これが「安定テンプレ」である理由

### ❌ 不安定構成

* openid-client（型が頻繁に壊れる）
* JWT手動管理
* Reactに認証責務

---

### ✔ 安定構成

* Auth0は外部IdPとして固定
* HonoはBFFとして固定
* セッションは単純Map/Redis
* Reactは完全UI

---

# 本番での拡張（次のステップ）

必要になったらこれだけ追加：

* Redis session store
* CSRF対策（state検証）
* refresh token
* multi-device session

---

# 一言まとめ

**Hono + Auth0の最も安定な構成は「OIDCライブラリを捨てて、Auth0を外部IdPとして扱い、HonoはセッションBFFに徹する設計」です。**

---

必要なら次は：

* CloudFront + S3 + Honoの完全構成図
* Redisセッション版（本番用）
* SSR対応版（Next.jsなし構成）
* RBAC（roles/permissions設計）

まで一気に実務レベルに落とせます。


いい前提です。ここは設計の分岐点で、ちゃんとやると後からかなり楽になります。

あなたの構成（React + Hono APIを同一ホスティング）なら、現実的に強いのは次の3パターンです。

---

# 結論（おすすめ）

## 一番バランス良い構成

👉 **BFF + Cookieセッション方式（同一ドメイン認証）**

---

# 全体アーキテクチャ

```
[ React SPA ]
      ↓ (cookie付きリクエスト)
[ Hono API (BFF) ]
      ↓
[ SSO (Google / Auth0 / Cognito / OIDC) ]
```

---

# パターン比較

## ① Cookieセッション（おすすめ）

### 流れ

```
React → /login → SSOへリダイレクト
SSO → callback → APIでsession発行
API → HttpOnly Cookieセット
React → APIを叩くだけ（認証意識なし）
```

---

### 特徴

* フロントは認証をほぼ意識しない
* APIが唯一の認証責任を持つ
* SSR/SPAどちらでも安定

---

### メリット

* セキュリティ強い（HttpOnly Cookie）
* XSS耐性高い
* 実装がシンプル
* モノレポと相性良い

---

### デメリット

* CORS設計が必要
* Cookie設計を理解する必要あり

---

## ② JWTをReactで保持

```
React → login → token取得
React → Authorization headerでAPI呼び出し
```

### メリット

* SPAだけで完結しやすい

### デメリット

* XSSリスク
* token管理が地獄になりやすい
* refresh token設計が面倒

👉 今はあまり推奨されない

---

## ③ 完全BFF型（さらに強い）

```
React → Honoだけ叩く
Hono → SSO全部管理
```

👉 フロントは「ただのUI」

---

# おすすめはどれ？

あなたの文脈だと：

* RPG系アプリ
* モノレポ
* API + editor + runtime
* 将来拡張あり

👉 **① Cookieセッション方式が最適**

---

# 実装指針（重要部分）

# 1. React側

## やることはほぼ2つだけ

### login redirect

```ts id="r4f8zk"
window.location.href = '/api/auth/login';
```

---

### API呼び出し

```ts id="9h0q3e"
fetch('/api/resources', {
  credentials: 'include',
});
```

👉 これだけ

---

# 2. Hono側（重要）

## ① login endpoint

```ts id="k8x3na"
app.get('/auth/login', async (c) => {
  return c.redirect('https://sso.example.com/login');
});
```

---

## ② callback

```ts id="p7z2lc"
app.get('/auth/callback', async (c) => {
  const code = c.req.query('code');

  const user = await exchangeCodeToUser(code);

  // session作る
  const sessionId = crypto.randomUUID();

  await sessionStore.set(sessionId, user);

  c.cookie('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  });

  return c.redirect('/');
});
```

---

## ③ middleware（あなたの既存設計に接続）

```ts id="m3d9qp"
export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionId = c.req.cookie('session');

  if (!sessionId) {
    throw new UnauthorizedError();
  }

  const user = await sessionStore.get(sessionId);

  if (!user) {
    throw new UnauthorizedError();
  }

  c.set('user', user);

  await next();
});
```

---

# 重要な設計ポイント

## ① Reactは認証を知らない

Reactはただ:

* API叩く
* redirectする

だけ

---

## ② 認証の責務は100%API

* session管理
* SSO連携
* user解決

全部API

---

## ③ CookieはHttpOnly

```txt id="z7m1nq"
JSから読めない = 安全
```

---

# よくある落とし穴

## ❌ Reactでtoken保持

→ 将来ほぼ確実に破綻

---

## ❌ middlewareでSSO直書き

→ テスト不能になる

---

## ❌ user型をフロントで信じる

→ 改ざんリスク

---

# あなたの今のmiddlewareとの接続

今のこれ：

```ts id="a2k8pd"
const user = c.get('user');
```

👉 完全に正しい設計

足りないのはただ1つ：

```
session → user を作る層
```

---

# 最終まとめ

## ベスト構成

* React = UIだけ
* Hono = BFF + 認証
* SSO = 外部認証
* Cookie = セッション

---

## 設計図

```
React
  ↓
Hono (auth + api)
  ↓
SSO (Google/Auth0/etc)
```

---

必要なら次は：

* 「SSO選定（Auth0 / Cognito / Keycloak）」
* 「HonoでOIDCを最小実装する方法」
* 「モノレポで auth layer を綺麗に分離する構成」
* 「dev環境だけ擬似ログインする安全な方法」

あたりまでかなり具体的に詰められます。

