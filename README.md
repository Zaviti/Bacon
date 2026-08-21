# Pulso — PWA de Feed Social

App mobile (PWA) em JavaScript puro — sem frameworks, sem build step —
pronto para deploy estático na Vercel.

## ✅ Requisito: Zona do Polegar (Thumb-Friendly Zone)

Todos os elementos de interação frequente ficam na **parte inferior da tela**:

- **`.bottom-nav`** (`index.html` + `css/style.css`): barra de navegação fixa
  (Início, Buscar, Atividade, Perfil), sempre visível, com alvos de toque
  ≥ 48px e respeitando `env(safe-area-inset-bottom)` para iPhones com barra
  de gestos.
- **FAB "Adicionar Postagem"** (`#btn-add-post`): botão circular coral,
  centralizado na barra inferior, ligeiramente elevado para não colidir
  com a curvatura natural do polegar — é o elemento de maior destaque
  visual da tela, seguindo o padrão de apps como Instagram/TikTok.
- O **modal de nova postagem** (bottom sheet) abre a partir da base da
  tela, e suas ações (Cancelar / Publicar / Foto / Local) também ficam
  na parte inferior do sheet — nunca é preciso esticar o polegar até o
  topo da tela para completar uma ação.
- Ações secundárias e menos frequentes (busca no topo, "mais opções" de
  um post) ficam no topo/canto, de propósito — são usadas com menor
  frequência e toleram um alcance maior.

## Funcionalidades

- Feed de postagens (curtir, salvar, comentar — placeholder, compartilhar)
- Criar postagem com texto, imagem (upload local) e localização simulada
- Busca simples por texto/autor + chips de hashtags
- Aba de Atividade (notificações simuladas)
- Aba de Perfil com grade de postagens
- Persistência local via `localStorage` (funciona offline)
- Instalável (Add to Home Screen) via `manifest.json`
- Funciona offline via `sw.js` (Service Worker com cache do app shell)
- Ícones gerados em `/icons` (192, 512, apple-touch-icon, favicon)

## Estrutura

```
pulso-pwa/
├── index.html          # Shell do app (todas as "telas" em <section>)
├── manifest.json        # Manifesto PWA (nome, ícones, cor, atalhos)
├── sw.js                 # Service Worker (offline)
├── vercel.json           # Headers de cache/deploy para Vercel
├── package.json
├── css/
│   └── style.css         # Design system completo (tokens, componentes)
├── js/
│   └── app.js             # Toda a lógica do app
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── apple-touch-icon.png
    └── favicon-32.png
```

## Rodar localmente

Não há build step. Basta servir os arquivos estáticos:

```bash
npx serve .
# ou
python3 -m http.server 3000
```

Depois acesse `http://localhost:3000` (ou a porta indicada) pelo Chrome
mobile emulation ou pelo celular na mesma rede, para testar a instalação
como PWA.

## Deploy na Vercel

### Opção 1 — Vercel CLI

```bash
npm i -g vercel
cd pulso-pwa
vercel --prod
```

A Vercel detecta automaticamente que é um projeto estático (não há
`build` necessário) graças ao `vercel.json` incluso.

### Opção 2 — Painel da Vercel (arrastar o .zip)

1. Extraia o `.zip` deste projeto em uma pasta.
2. Acesse [vercel.com/new](https://vercel.com/new).
3. Escolha **"Deploy without Git"** / importe a pasta extraída
   (ou suba a pasta para um repositório Git e importe o repositório).
4. Framework Preset: **Other** (estático).
5. Build Command: *(deixe em branco)*.
6. Output Directory: `.` (raiz do projeto).
7. Deploy.

### Opção 3 — Repositório Git

```bash
git init
git add .
git commit -m "Pulso PWA"
git remote add origin <seu-repositorio>
git push -u origin main
```

Depois importe o repositório em vercel.com/new normalmente.

## Testar como PWA instalado

1. Após o deploy, abra a URL da Vercel no Chrome (Android) ou Safari (iOS).
2. Android: menu ⋮ → "Adicionar à tela inicial" (ou banner automático).
3. iOS: botão Compartilhar → "Adicionar à Tela de Início".
4. O app abre em modo standalone (sem barra de navegador), com o FAB de
   nova postagem e a navegação inferior sempre ao alcance do polegar.

## Personalização rápida

- Cores e tipografia: variáveis CSS no topo de `css/style.css` (`:root`).
- Nome/ícone do app: `manifest.json` + arquivos em `/icons`.
- Dados iniciais do feed: `seedPosts()` em `js/app.js`.
