# Publicação gratuita — Cloudflare Pages

O jogo é **estático**: o navegador executa o Phaser, e o Vite gera os arquivos finais. Não é necessário servidor permanente, conta no jogo ou banco de dados.

## Antes da publicação

1. Instale Node.js em versão compatível com Vite 7 (Node 22.12+ é uma opção).
2. Na pasta do projeto, execute:

```bash
npm install
npm run typecheck
npm run test:routes
npm run build
```

3. Confira a pasta `dist/` e teste com `npm run preview` em um navegador.

## Pelo GitHub + Cloudflare Pages

1. Publique **a pasta do projeto inteira** no GitHub. Não envie a pasta `node_modules`.
2. Abra https://dash.cloudflare.com/ e acesse **Workers & Pages**.
3. Crie um projeto **Pages**, conecte o repositório GitHub.
4. Configure:

| Campo | Valor |
|---|---|
| Tipo | Pages (site estático) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | raiz do projeto |
| Domínio inicial | `*.pages.dev` (gratuito) |

5. Publique. Novos commits podem disparar builds automaticamente.

## Importante

- A hospedagem no plano Free não garante recursos ilimitados. Respeite os limites vigentes da plataforma.
- Os dados do jogo ficam no `localStorage` do navegador. Para jogar em outro dispositivo, use **Menu → Exportar progresso / Importar progresso**.
- Se trocar de endereço (domínio), o `localStorage` antigo não acompanha automaticamente: exporte e importe antes.
- Não coloque senhas nem chaves secretas no código do frontend.
- O projeto ainda precisa de um teste real do Phaser e do build Vite com as dependências instaladas; isso não foi possível no ambiente de preparação.
