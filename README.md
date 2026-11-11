# Entre Papéis & Portais — Versão 3.2 (cenários sem sprites adicionais)

RPG narrativo em pixel art sobre o Primeiro Reinado (1822–1831). Projeto gratuito, preparado para navegadores em PC e celular, **sem cadastro e sem backend**.

## Stack

- **Phaser 4.2.1** para renderização dos cenários, efeitos atmosféricos e transições de câmera.
- **TypeScript** para história, estados, regras das escolhas, finais e interface.
- **Vite 7** para desenvolvimento e build de arquivos estáticos.
- **HTML + CSS** para diálogos acessíveis, menus, diário, cartas e configuração.
- **LocalStorage** para saves automáticos. Exportação/importação de backup JSON disponível no menu do jogo.

## Como executar

Você precisa do Node.js 22.12+ (ou 20.19+). No terminal, na pasta do projeto:

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`).

Para produzir o site estático:

```bash
npm run build
npm run preview
```

A pasta **`dist/`** é o site pronto para upload. **Não envie apenas o `index.html` da raiz** ao serviço de hospedagem, pois ele depende de um build do Vite.

## Deploy grátis: Cloudflare Pages

1. Crie um repositório com o conteúdo **desta pasta** no GitHub.
2. No painel Cloudflare, vá a Workers & Pages → Create → Pages → conectar Git.
3. Escolha o repositório e configure **Build command:** `npm run build` e **Build output directory:** `dist`.
4. Publique no subdomínio gratuito `*.pages.dev`, dentro dos limites do plano Free.

Não é preciso domínio personalizado, servidor Node ou banco de dados para hospedar esta versão. O Vite é usado no **build**, não como servidor de produção.

## O que foi preservado da versão anterior

- 45 cenas narrativas, 12 documentos e a linha do tempo completa de 1822–1831.
- Dez finais distintos (com condições de desbloqueio), três quadros de cutscene por final e galeria permanente de cartas.
- Reaproveitamento das nove ilustrações originais em WebP.
- Arquivo histórico, personagens ficcionais, explicação do contexto histórico e leitor de texto por voz (quando suportado pelo navegador).
- Teclas 1–9 para escolhas, `D` para diário, `Esc` para fechar, seta → para avançar as cutscenes.
- **Compatibilidade com os saves da v2:** mantidos os nomes das chaves `epp_reinado_run_v2` e `epp_reinado_ending_cards_v2`.

## Novas animações no Phaser

- Panorama com deslocamento de câmera suave nas nove artes (movimento limitado para manter o pixel art legível).
- Poeira com movimento e reflexos discretos nos cenários marítimos; sem círculos sobrepostos ao portal.
- Transições de câmera entre cenas e ritmo cinematográfico mais marcado nos epílogos.
- Respeito à configuração de acessibilidade `prefers-reduced-motion`.

O suporte de imagem estática permanece disponível como alternativa caso o renderizador do Phaser não inicialize.

## Estrutura

```text
index.html                   entrada web do Vite
src/main.ts                 inicialização
src/story.ts                todo o roteiro narrativo (tipado)
src/engine/types.ts         tipos de cena, escolha, documento e save
src/engine/narrative.ts     efeitos, regras de escolhas e rotas
src/engine/storage.ts       salvamento e backup
src/ui/UIController.ts      menus, diálogos, cartas e cutscenes
src/render/VisualStage.ts   camada animada do Phaser
src/style.css               aparência responsiva
public/assets/             ilustrações pixel art e efeito de poeira
public/manifest.webmanifest configuração do ícone web
tests/                      testes automáticos
```

## Testes

```bash
npm run test:routes
npm run typecheck
npm run build
```

`npm run test:routes` precisa de Node com suporte a remoção experimental de tipos, disponível na versão usada para os testes. O teste da interface pode ser executado com `npm run test:ui` se Python e `playwright` para Python estiverem instalados, além do navegador Chromium (veja relatório).

**Situação dos testes nesta entrega:** motor narrativo, rotas e interface estão validados, mas **o renderizador Phaser e o build completo do Vite não foram executados neste ambiente** porque o acesso ao registro npm estava indisponível para instalar dependências. Faça `npm install`, `npm run build` e uma verificação visual no navegador antes de publicar. Não considere esta versão certificada para produção sem essa etapa.

## Atualização 3.2 — Limpeza visual

- Removidos todos os mini-NPCs que eram desenhados sobre as ilustrações.
- Excluídos os arquivos de sprites de NPCs e o módulo `backgroundNpcs.ts`.
- Removidos os círculos azul e dourado desenhados por código sobre o portal.
- Mantidos os cenários originais, as transições, o parallax, a poeira e os reflexos discretos na água.
- Os personagens pintados *dentro* dos arquivos `.webp` permanecem imóveis porque fazem parte da própria imagem.
- Para animá-los de maneira natural no futuro, será necessário produzir sprites e fundos separados com perspectiva e oclusão corretas.

Esta versão não inclui novos sprites de personagens.
