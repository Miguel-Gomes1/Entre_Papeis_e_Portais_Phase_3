# Verificação da versão Phaser + TypeScript (10/11/2026)

## O que foi testado neste ambiente

- **Tipos TypeScript:** módulos de roteiro, regras, salvamento e interface passaram na verificação estrita via `tsc`. A renderização Phaser requer dependência ausente para análise completa.
- **Rotas:** 45 nós, 12 documentos, 10 finais; busca por 20.780 estados explorados, 9.053 estados distintos, os 10 finais alcançados e todos os destinos de escolhas/arquivos verificados.
- **Chromium (interface TypeScript transpilada; sem Phaser): 21/21 testes passaram.** Foram verificados controles, iniciar/continuar, salvamento em `localStorage` simulado, todos os finais com três etapas de cutscene e replay das cartas, 4 dimensões de tela, importação de estado da v2, exportação/importação JSON, ausência de erros de JavaScript.
- **Salvamento compatível:** a v3 reconhece a estrutura do progresso da v2. No mesmo endereço e navegador, os dados antigos devem continuar disponíveis.

## Limitações e verificações pendentes

1. O `npm install` falhou por indisponibilidade de resolução de DNS para `registry.npmjs.org` neste ambiente, portanto **o build Vite ainda não foi executado**.
2. **As animações Phaser não foram renderizadas nem testadas em um navegador real** nesta entrega; o teste Chromium valida apenas a UI e a lógica usando um adaptador gráfico simulado.
3. Não houve execução em Safari/iOS, telefone físico, nem validação do deploy Cloudflare.
4. O teste usa `localStorage` simulado; persistência real após limpar cache ou trocar de domínio não foi testada.

## Próxima validação recomendada

1. Executar `npm install`, `npm run typecheck`, `npm run build`.
2. Executar `npm run dev` e navegar por cenas em 1822, 1824, 1828 e 1831, conferindo frames de animação, tamanho do Canvas e transições.
3. Concluir pelo menos um final, ver a cutscene e rever a carta na galeria.
4. Testar em Chrome Android e Safari iOS, inclusive retrato e paisagem, com economia de bateria e redução de movimento habilitadas.
5. Publicar em HTTPS via Cloudflare Pages e repetir os testes com o endereço final.

Arquivos automatizados: `tests/validate_routes.mjs`, `tests/reachable_paths.json`, `tests/test_ui_v3.py`, `tests/ui_results.json`.

### Atualização 3.2 — Remoção de overlays

- Retirados do código o carregamento, a criação e a renderização de NPCs adicionais.
- Removidos os círculos programáticos do portal e os arquivos dos NPCs.
- O método `rebuild()` foi preservado com as chaves de fechamento corretas.
- Validação estática e rotas narrativas: consulte a saída dos testes desta entrega.
- **Pendente:** testar o renderizador Phaser após `npm install`, `npm run typecheck` e `npm run build` no computador.
