import type { Choice, Condition, DocumentEntry, Ending, Effects, RunState, StoryNode } from './engine/types';
// Roteiro original da v2, migrado para um módulo TypeScript.
const D=(label:string,to:string,fx:Effects={},condition:Condition|null=null):Choice=>({label,to,fx,condition});
const N:Record<string,StoryNode>={};
const add=(id:string,where:string,year:string,chapter:string,speaker:string,text:StoryNode["text"],choices:StoryNode["choices"]):void=>{N[id]={id,where,year,chapter,speaker,text,choices};};
const has=(s:RunState,id:string)=>s.docs.includes(id);
const f=(s:RunState,key:string)=>Boolean(s.flags[key]);
const focus=(s:RunState,name:string)=>s.focus===name;
const enough=(s:RunState)=>s.docs.length>=4;
const m=(s:RunState,k:string)=>s.meters[k]||0;
const secretReady=(s:RunState)=>s.docs.length>=7 && has(s,'codigo') && has(s,'prata1828') && has(s,'abril1831') && f(s,'chave_portal');
const DOCS:Record<string,DocumentEntry>={
 carta1822:{name:'Cartas do porto',date:'1822 — Recife',category:'Correspondência',fact:'A independência proclamada em 1822 não teve efeitos iguais nem simultâneos em todas as províncias.',fiction:'Cartas e remetentes criados para o jogo.'},
 bahia1823:{name:'Notícia da Bahia',date:'1823 — Salvador',category:'Noticiário',fact:'Na Bahia, a luta contra forças portuguesas prosseguiu até julho de 1823.',fiction:'Noticiário fictício inspirado em registros do período.'},
 assembleia1823:{name:'Caderno da Constituinte',date:'1823 — Rio de Janeiro',category:'Anotações',fact:'A Assembleia Constituinte iniciou seus trabalhos em maio de 1823 e foi dissolvida em novembro por D. Pedro I.',fiction:'Anotações ficcionais, não ata original.'},
 carta1824:{name:'Carta sobre o Poder Moderador',date:'1824 — Império',category:'Carta política',fact:'A Constituição de 25 de março de 1824 criou, além dos poderes tradicionais, o Poder Moderador, atribuído ao imperador.',fiction:'Síntese fictícia do conteúdo constitucional.'},
 typhis:{name:'Folha de tipografia',date:'1824 — Recife',category:'Imprensa',fact:'O Typhis Pernambucano, de Frei Caneca, começou a circular em dezembro de 1823 e participou dos debates políticos da época.',fiction:'A folha do jogador não é uma reprodução de edição histórica.'},
 manifestacao:{name:'Testemunho das ruas',date:'1824 — Pernambuco',category:'Relato oral',fact:'A Confederação do Equador, iniciada em Pernambuco em julho de 1824, contestou o governo imperial e foi reprimida.',fiction:'Relato e pessoa entrevistada inventados.'},
 tratado1825:{name:'Carta do reconhecimento',date:'1825 — Rio de Janeiro',category:'Correspondência',fact:'Portugal reconheceu a independência brasileira por tratado em 1825.',fiction:'Carta resumida criada para a narrativa.'},
 parlamento1826:{name:'Diário da Assembleia',date:'1826 — Rio de Janeiro',category:'Diário',fact:'A primeira legislatura da Assembleia Geral Legislativa foi aberta em 6 de maio de 1826.',fiction:'Diário ficcional inspirado na abertura do Parlamento.'},
 prata1828:{name:'Registro da Cisplatina',date:'1825–1828 — Região do Prata',category:'Registro marítimo',fact:'A Guerra da Cisplatina ocorreu entre 1825 e 1828; a paz de 1828 abriu caminho para a independência do Uruguai.',fiction:'Registro de viagem fictício.'},
 crise1830:{name:'Caderno de crise',date:'1829–1830 — Rio de Janeiro',category:'Anotações',fact:'A guerra, dificuldades econômicas e disputas políticas contribuíram para o desgaste do Primeiro Reinado.',fiction:'Caderno ficcional com síntese histórica.'},
 abril1831:{name:'Última notícia do Reinado',date:'1831 — Rio de Janeiro',category:'Noticiário',fact:'D. Pedro I abdicou em 7 de abril de 1831, encerrando o Primeiro Reinado.',fiction:'Noticiário recriado, sem reproduzir jornal original.'},
 codigo:{name:'Margens do tempo',date:'1824–1831 — Origem incerta',category:'Fragmento ficcional',fact:'Não há evidência histórica de portais temporais; esse mecanismo pertence exclusivamente à fantasia do jogo.',fiction:'Documento secreto inteiramente fictício.'}
};
const ENDS:Record<string,Ending>={
 retorno_consciente:{name:'O Retorno Consciente',subtitle:'A história nunca foi simples',rarity:'Raro',art:'portal_atualidade',icon:'✧',frames:[
  ['ruas_1831','A ÚLTIMA PÁGINA','A madrugada de 7 de abril de 1831 chega ao fim. D. Pedro I abdicou. O país que você observou seguirá outro capítulo, com a Regência.'],
  ['porto_1822','O PESO DAS CARTAS','Você reúne testemunhos diferentes. Nem a vida nas ruas, nem os gabinetes, nem os combates cabem numa explicação única.'],
  ['portal_atualidade','DE VOLTA AO PRESENTE','O portal se fecha atrás de você. No sofá, a série ainda espera — mas sua memória agora guarda vozes que um resumo jamais contaria.']]},
 retorno_apressado:{name:'O Regresso Apressado',subtitle:'A porta primeiro, as respostas depois',rarity:'Comum',art:'portal_atualidade',icon:'➤',frames:[
  ['ruas_1831','ÚLTIMAS NOTÍCIAS','Você atravessa a crise de 1831 ouvindo apenas o suficiente para reconhecer que um reinado chegou ao fim.'],
  ['porto_1822','PAPÉIS AO VENTO','As correspondências ficam para trás. Você sabe algumas datas, mas sente que deixou perguntas sem resposta.'],
  ['portal_atualidade','UM SILÊNCIO FAMILIAR','O celular acende. Você chegou em casa. Talvez um dia volte a estudar a história que viveu tão depressa.']]},
 cronista_provincias:{name:'Cartógrafo das Províncias',subtitle:'Uma independência, muitos caminhos',rarity:'Incomum',art:'salvador_1823',icon:'✥',frames:[
  ['salvador_1823','LUGARES DIFERENTES','Sua coleção une vozes da Bahia, Pernambuco e do Rio de Janeiro. A Independência não aconteceu da mesma forma para todos.'],
  ['olinda_1824','O PAPEL DAS PROVÍNCIAS','Debates sobre autonomia, guerra e participação política não desaparecem com uma proclamação.'],
  ['portal_atualidade','MAPA DE MEMÓRIAS','No presente, você desenha um mapa com acontecimentos e pessoas, sabendo que nenhuma província cabe em uma nota de rodapé.']]},
 cartas_corte:{name:'As Cartas da Corte',subtitle:'Entre a Coroa e a Constituição',rarity:'Incomum',art:'corte_1825',icon:'♜',frames:[
  ['assembleia_1823','O SALÃO VAZIO','A Assembleia de 1823 é dissolvida. Você observa o contraste entre ideias constitucionais e a força do poder imperial.'],
  ['corte_1825','O PODER NO PAPEL','Os tratados, o Poder Moderador e as disputas entre instituições mostram um Império em formação — e sob tensão.'],
  ['portal_atualidade','UM ARQUIVO ABERTO','De volta ao presente, você abre um caderno: entender instituições também exige perguntar quem podia participar delas.']]},
 vozes_tipografia:{name:'Vozes de Tinta',subtitle:'Nenhuma folha é neutra',rarity:'Incomum',art:'tipografia_1824',icon:'✒',frames:[
  ['tipografia_1824','O SOM DA PRENSA','Letras de metal encontram o papel. A circulação das notícias pode apoiar, questionar ou incomodar o poder.'],
  ['olinda_1824','AS VOZES EM CONFLITO','Você compara versões dos acontecimentos de 1824, procurando distinguir rumores, argumentos e documentos.'],
  ['portal_atualidade','LEITOR DO FUTURO','No presente, você não acredita mais na primeira manchete que aparece: procura origem, contexto e silêncio.']]},
 travessia_prata:{name:'Marés do Prata',subtitle:'O preço da guerra',rarity:'Incomum',art:'cisplatina_1828',icon:'⚓',frames:[
  ['cisplatina_1828','NAVIOS NO HORIZONTE','A guerra na região do Prata alterou vidas, alianças e finanças. Você conhece marinheiros, famílias e diplomatas.'],
  ['corte_1825','UMA PAZ DIFÍCIL','O acordo de 1828 abre caminho para a independência do Uruguai. Nenhum documento apaga os custos humanos do conflito.'],
  ['portal_atualidade','OCEANOS DE MEMÓRIA','Ao voltar, você guarda uma carta naval. Para você, as datas agora têm nomes, vozes e distâncias.']]},
 memorias_silenciadas:{name:'Memórias Silenciadas',subtitle:'A história de quem pouco pôde decidir',rarity:'Raro',art:'olinda_1824',icon:'❀',frames:[
  ['salvador_1823','FORA DOS SALÕES','Trabalhadores livres, libertos e pessoas escravizadas viviam consequências políticas sem acesso igual ao poder.'],
  ['olinda_1824','O QUE FOI OMITIDO','Você escolhe preservar testemunhos de pessoas comuns. A grande história também se faz de vidas muitas vezes ausentes dos retratos oficiais.'],
  ['portal_atualidade','NOMES À MARGEM','No presente, você escreve sobre essas desigualdades e sobre os limites das fontes, sem fingir que pode falar por todos.']]},
 entre_dois_tempos:{name:'Entre Dois Tempos',subtitle:'A escolha de ficar',rarity:'Raro',art:'porto_1822',icon:'⌛',frames:[
  ['ruas_1831','UM MUNDO EM TRANSIÇÃO','A abdicação chega. Você sabe que as pessoas daqui enfrentarão novos conflitos e esperanças.'],
  ['porto_1822','PORTAL SEM PRESSA','Você não atravessa. Decide permanecer por mais algum tempo, sem supor que poderá mudar eventos históricos conhecidos.'],
  ['portal_atualidade','UMA PORTA ENTREABERTA','O narrador suspira. Sua história não terminou — apenas mudou de ritmo. Uma nova página aguarda no passado.']]},
 arquivo_tempo:{name:'O Arquivo do Tempo',subtitle:'O segredo entre as margens',rarity:'Secreto',art:'portal_atualidade',icon:'✦',frames:[
  ['tipografia_1824','O CÓDIGO INCOMPLETO','Três marcas escondidas entre documentos revelam que os papéis do portal foram deixados por outra pessoa deslocada no tempo.'],
  ['corte_1825','QUEM CONTA A HISTÓRIA?','Você compreende a diferença entre arquivo e invenção: os registros históricos são reais; o mecanismo da viagem é parte da ficção.'],
  ['portal_atualidade','A ÚLTIMA CARTA','O portal não leva a uma resposta definitiva, mas à responsabilidade de continuar investigando. No presente, uma carta sem remetente repousa em sua mesa.']]},
 portal_incompleto:{name:'A Porta Incompleta',subtitle:'Sem provas, sem caminho',rarity:'Comum',art:'portal_atualidade',icon:'◈',frames:[
  ['porto_1822','O ÚLTIMO PAPEL','Os anos passaram rápido. Você chegou ao portal com poucos registros para orientar a volta.'],
  ['ruas_1831','TUDO SE CONFUNDE','Luzes tremem e as datas se embaralham. O narrador admite que não conhece todos os atalhos.'],
  ['portal_atualidade','CONTINUAÇÃO INCERTA','A passagem fecha antes do último passo. Você permanece em segurança no passado, com a possibilidade de recomeçar e investigar melhor.']]}
};

/* PROLOGO / 1822 */
add('p1','porto_1822','1822','PRÓLOGO','NARRADOR','Uh... Olá! Sei que está confuso e vou esclarecer umas coisas para você.',[D('Estou ouvindo.','p2')]);
add('p2','porto_1822','1822','PRÓLOGO','NARRADOR','Você voltou muuuuitos anos! Continua no Brasil, mas nos primeiros anos do Império. A independência foi proclamada em 1822; ainda há conflitos e mudanças pela frente.',[D('Como eu volto para casa?','p3')]);
add('p3','porto_1822','1822','PRÓLOGO','NARRADOR','Justo a época que você talvez não conheça tão bem! Mas calma: o portal funciona com registros espalhados por diferentes momentos do Primeiro Reinado. As escolhas que fizer mudarão sua jornada.',[D('Papéis? Portais? Continue.','p4')]);
add('p4','porto_1822','1822','PRÓLOGO','NARRADOR','Converse com pessoas, recolha cartas e viaje por cenas do passado. Não há Uber por aqui, hehehe... E lembre-se: a história real não muda porque você escolheu outro caminho.',[D('Tudo bem. E depois?','p5')]);
add('p5','portal_atualidade','1822','PRÓLOGO','NARRADOR','Quando compreender essa época e chegar ao portal final, poderá voltar ao seu sofá e à série que ainda não terminou. Ou talvez descubra outras maneiras de encerrar a viagem.',[D('Então vamos começar!','porto_escolha')]);
add('porto_escolha','porto_1822','1822','CAPÍTULO I · UM PAÍS RECÉM-INDEPENDENTE','MORADOR DO CAIS','Recife, 1822. Os navios trazem notícias desencontradas. Uma proclamação não resolve de imediato os conflitos entre províncias, tropas e interesses. Por onde você começa?',[
 D('Seguir notícias que vêm da Bahia.','bahia_1822',{focus:'provincias',docs:['carta1822'],meters:{saber:1}}),
 D('Consultar despachos vindos do Rio de Janeiro.','corte_1822',{focus:'corte',docs:['carta1822'],meters:{prudencia:1}}),
 D('Investigar rumores na tipografia do Recife.','imprensa_1822',{focus:'imprensa',docs:['carta1822'],meters:{saber:1}}),
 D('Ouvir trabalhadores e mulheres do mercado.','povo_1822',{focus:'povo',docs:['carta1822'],meters:{escuta:2}}),
 D('Não perder tempo: seguir adiante.','passagem_1823',{meters:{pressa:2}})
]);
add('bahia_1822','salvador_1823','1822','CAPÍTULO I','MENSAGEIRA DA BAHIA','No Recôncavo, forças favoráveis à Independência enfrentam tropas ligadas a Portugal. A luta continua para além do 7 de Setembro. Você anota as vozes que chegam pelos caminhos.',[D('Seguir os acontecimentos até 1823.','passagem_1823',{flags:['viu_bahia']})]);
add('corte_1822','corte_1825','1822','CAPÍTULO I','ESCRIVÃO','Despachos celebram a nova situação política. Mas as regiões do Império ainda precisam negociar autoridade, segurança e pertencimento.',[D('Acompanhar como o novo Estado se organiza.','passagem_1823',{flags:['viu_corte']})]);
add('imprensa_1822','tipografia_1824','1822','CAPÍTULO I','TIPÓGRAFA','As palavras viajavam em folhas, cartas e conversas. Não confunda uma voz impressa com a verdade inteira: quem escreveu e para quem?', [D('Guardar a pergunta e continuar.','passagem_1823',{flags:['viu_imprensa'],meters:{prudencia:1}})]);
add('povo_1822','olinda_1824','1822','CAPÍTULO I','JOANA, TRABALHADORA','Algumas pessoas festejam, outras temem o futuro. A escravidão permanece; liberdade política do Estado não significa liberdade para todos.', [D('Registrar os diferentes pontos de vista.','passagem_1823',{flags:['ouviu_povo'],meters:{escuta:1}})]);
add('passagem_1823','salvador_1823','1823','CAPÍTULO II · GUERRAS E CONSTITUIÇÃO','NARRADOR','O calendário avança para 1823. Na Bahia, a luta pela Independência continua até julho. No Rio, uma Assembleia Constituinte procura escrever as regras do novo país.',[
 D('Ir à Bahia e ouvir relatos do conflito.','bahia_1823',{focus:'provincias',docs:['bahia1823'],meters:{escuta:1}}),
 D('Acompanhar os debates constitucionais.','assembleia_1823',{focus:'corte',docs:['assembleia1823'],meters:{saber:2}}),
 D('Recolher impressos e confrontar versões.','papel_1823',{focus:'imprensa',docs:['assembleia1823'],meters:{prudencia:2}}),
 D('Passar diretamente a 1824.','choque_1823',{meters:{pressa:2}})
]);
add('bahia_1823','salvador_1823','1823','CAPÍTULO II','MORADOR DE SALVADOR','As forças portuguesas deixam Salvador em julho de 1823. A campanha envolveu diversos grupos sociais, cujas experiências não cabem apenas nos nomes dos comandantes.',[D('Registrar o resultado e as contradições.','choque_1823',{meters:{saber:1},flags:['viu_bahia']})]);
add('assembleia_1823','assembleia_1823','1823','CAPÍTULO II','DEPUTADO (PERSONAGEM FICTÍCIO)','Em maio de 1823, a Constituinte inicia seus trabalhos. O debate sobre os limites da autoridade imperial logo ganha tensão.',[D('Ler as notas dos debates.','choque_1823',{flags:['viu_corte'],meters:{saber:1}})]);
add('papel_1823','tipografia_1824','1823','CAPÍTULO II','IMPRESSOR','Você compara duas folhas que descrevem o mesmo debate com ênfases distintas. Fonte, intenção e data importam tanto quanto a manchete.',[D('Seguir para a notícia de novembro.','choque_1823',{flags:['viu_imprensa'],meters:{prudencia:1}})]);
add('choque_1823','assembleia_1823','1823','CAPÍTULO II','NARRADOR','Em 12 de novembro de 1823, D. Pedro I dissolve a Assembleia Constituinte. A Constituição será elaborada por um conselho e outorgada em março de 1824.',[
 D('Guardar essa informação e investigar 1824.','carta_1824',{meters:{saber:1}}),
 D('Ir em frente sem anotar.','carta_1824',{meters:{pressa:1}})
]);
/* 1824 */
add('carta_1824','corte_1825','1824','CAPÍTULO III · A CARTA E A REVOLTA','NARRADOR','25 de março de 1824. A primeira Constituição brasileira é outorgada. O Poder Moderador é atribuído ao imperador. Em Pernambuco, tensões sobre a centralização política crescem.',[
 D('Ler os dispositivos constitucionais.','const_1824',{focus:'corte',docs:['carta1824'],meters:{saber:2}}),
 D('Viajar ao Recife e ouvir a oposição.','recife_1824',{focus:'imprensa',docs:['carta1824'],meters:{prudencia:1}}),
 D('Perguntar quem participa dessas decisões.','pessoas_1824',{focus:'povo',docs:['carta1824'],meters:{escuta:2}}),
 D('Seguir sem parar para estudar.','confed_1824',{meters:{pressa:2}})
]);
add('const_1824','corte_1825','1824','CAPÍTULO III','ESCRIVÃ HELENA','A Constituição organiza a monarquia e distingue Legislativo, Executivo, Judiciário e Moderador. Mas atribui ao imperador uma posição singular no arranjo político.',[D('Examinar o que ocorre em Pernambuco.','confed_1824',{flags:['viu_corte']})]);
add('recife_1824','tipografia_1824','1824','CAPÍTULO III','IMPRESSOR DO RECIFE','O Typhis Pernambucano começou em dezembro de 1823. A imprensa ajuda a circular argumentos e críticas, mas vive em meio a disputas concretas.',[D('Ler mais sobre o movimento.','confed_1824',{flags:['viu_imprensa'],meters:{prudencia:1}})]);
add('pessoas_1824','olinda_1824','1824','CAPÍTULO III','JOANA','Debates de poder passam por cima de muita gente. Pessoas escravizadas não têm liberdade nem cidadania política plena; outros grupos também têm participação muito limitada.',[D('Incluir essa perspectiva no diário.','confed_1824',{flags:['ouviu_povo'],meters:{escuta:1}})]);
add('confed_1824','olinda_1824','1824','CAPÍTULO III','NARRADOR','Em julho de 1824, a Confederação do Equador é proclamada em Pernambuco. O movimento contesta a centralização imperial. As forças do governo o reprimem e líderes são punidos.',[
 D('Ler uma folha da tipografia.','tipografia_1824',{focus:'imprensa',docs:['typhis'],meters:{saber:1,prudencia:1}}),
 D('Ouvir testemunhos de quem vive a crise.','testemunho_1824',{focus:'povo',docs:['manifestacao'],meters:{escuta:2}}),
 D('Registrar os diferentes interesses provinciais.','prov_1824',{focus:'provincias',docs:['manifestacao'],meters:{prudencia:1}}),
 D('Evitar o conflito e seguir para 1825.','reconhecimento_1825',{meters:{pressa:2}})
]);
add('tipografia_1824','tipografia_1824','1824','CAPÍTULO III','TIPÓGRAFA','Nas margens de uma folha, você encontra palavras apagadas e uma pequena marca geométrica. Parece uma anotação fora do tempo. O jornal histórico é real; esta folha, não.',[
 D('Guardar o fragmento estranho.','reconhecimento_1825',{docs:['codigo'],flags:['pista1'],meters:{prudencia:1}}),
 D('Guardar apenas a notícia política.','reconhecimento_1825',{meters:{saber:1}})
]);
add('testemunho_1824','olinda_1824','1824','CAPÍTULO III','MORADORA DE OLINDA','Uma decisão política pode significar medo, perda e incerteza para quem não a tomou. Seu caderno guarda essa diferença.',[D('Seguir com os relatos.','reconhecimento_1825',{flags:['ouviu_povo']})]);
add('prov_1824','salvador_1823','1824','CAPÍTULO III','MENSAGEIRA DAS PROVÍNCIAS','O alcance e o apoio à Confederação variaram. Não há um único pensamento em Pernambuco ou no Brasil: procure quem concorda, quem discorda e quem foi afetado.',[D('Guardar a comparação e seguir.','reconhecimento_1825',{flags:['viu_bahia']})]);
/* 1825–1826 */
add('reconhecimento_1825','corte_1825','1825','CAPÍTULO IV · RECONHECIMENTO E PARLAMENTO','NARRADOR','Em 1825, Portugal reconhece a independência do Brasil por tratado. O jovem Império negocia reconhecimento externo enquanto enfrenta problemas internos.',[
 D('Consultar correspondência diplomática.','tratado_1825',{focus:'corte',docs:['tratado1825'],meters:{saber:1}}),
 D('Ouvir comerciantes sobre os efeitos.','comercio_1825',{focus:'povo',docs:['tratado1825'],meters:{escuta:1}}),
 D('Acompanhar como o jornal relata o acordo.','gazeta_1825',{focus:'imprensa',docs:['tratado1825'],meters:{prudencia:1}}),
 D('Prosseguir para o Parlamento.','parlamento_1826',{meters:{pressa:1}})
]);
add('tratado_1825','corte_1825','1825','CAPÍTULO IV','ESCRIVÃ HELENA','A diplomacia combina reconhecimento e interesses internacionais. Você anota o tratado sem imaginar que ele resolveu os dilemas do Império.',[D('Avançar para 1826.','parlamento_1826',{flags:['viu_corte']})]);
add('comercio_1825','porto_1822','1825','CAPÍTULO IV','COMERCIANTE','Os navios carregam notícias e preços. A independência tem consequências econômicas, mas elas não atingem todas as pessoas da mesma forma.',[D('Avançar para 1826.','parlamento_1826',{flags:['ouviu_povo']})]);
add('gazeta_1825','tipografia_1824','1825','CAPÍTULO IV','REDAÇÃO','Uma folha comemora o acordo; outra debate seu custo. Você guarda a comparação entre perspectivas.',[D('Avançar para 1826.','parlamento_1826',{flags:['viu_imprensa']})]);
add('parlamento_1826','assembleia_1823','1826','CAPÍTULO IV','NARRADOR','Em 6 de maio de 1826, começa a primeira legislatura da Assembleia Geral Legislativa. Câmara dos Deputados e Senado passam a funcionar sob a Constituição de 1824.',[
 D('Analisar os limites da representação.','voz_1826',{docs:['parlamento1826'],meters:{escuta:1,prudencia:1}}),
 D('Guardar um resumo institucional.','instituicoes_1826',{docs:['parlamento1826'],meters:{saber:1}}),
 D('Pular para as notícias da guerra.','guerra_1827',{meters:{pressa:1}})
]);
add('voz_1826','assembleia_1823','1826','CAPÍTULO IV','JOANA','Há instituições novas, mas a representação política continua restrita. Seu diário precisa registrar essa diferença.',[D('Seguir para o conflito na região do Prata.','guerra_1827',{flags:['ouviu_povo']})]);
add('instituicoes_1826','corte_1825','1826','CAPÍTULO IV','ESCRIVÃ HELENA','Uma Assembleia começa a funcionar. Isso não elimina os atritos entre diferentes poderes nem as disputas sobre representação.',[D('Seguir para o conflito na região do Prata.','guerra_1827',{flags:['viu_corte']})]);
/* 1827–28 */
add('guerra_1827','cisplatina_1828','1827–1828','CAPÍTULO V · MARÉS DO PRATA','NARRADOR','A Guerra da Cisplatina, iniciada em 1825, prossegue. O Império e as Províncias Unidas disputam o futuro da região. O conflito custa vidas e recursos.',[
 D('Viajar com um marinheiro e observar o conflito.','mar_1828',{focus:'mar',docs:['prata1828'],meters:{saber:1}}),
 D('Acompanhar as negociações de paz.','paz_1828',{focus:'corte',docs:['prata1828'],meters:{prudencia:1}}),
 D('Ouvir famílias afetadas pela guerra.','familias_1828',{focus:'povo',docs:['prata1828'],meters:{escuta:2}}),
 D('Evitar os relatos e acelerar o tempo.','fim_guerra_1828',{meters:{pressa:2}})
]);
add('mar_1828','cisplatina_1828','1828','CAPÍTULO V','MARINHEIRO BENTO','No convés, os relatos são de medo, espera, fadiga e ordens. Nenhuma vitória de papel devolve a todos o que perderam.',[D('Registrar o que ouvi.','fim_guerra_1828',{flags:['viu_mar'],meters:{escuta:1}})]);
add('paz_1828','corte_1825','1828','CAPÍTULO V','DIPLOMATA (FICTÍCIO)','Um acordo toma forma em 1828, abrindo caminho para um Uruguai independente. Na borda do documento, surge a mesma marca estranha que você viu antes.',[
 D('Comparar a marca com o fragmento guardado.','fim_guerra_1828',{flags:['pista2'],meters:{prudencia:1}},s=>f(s,'pista1')),
 D('Registrar o tratado e seguir.','fim_guerra_1828',{flags:['viu_corte']})
]);
add('familias_1828','cisplatina_1828','1828','CAPÍTULO V','MORADORA DA REGIÃO','A fronteira está nos mapas. Para quem vive aqui, há perdas, deslocamentos e incertezas que não desaparecem com uma assinatura.',[D('Guardar o testemunho.','fim_guerra_1828',{flags:['ouviu_povo']})]);
add('fim_guerra_1828','cisplatina_1828','1828','CAPÍTULO V','NARRADOR','A convenção de paz de 1828 marca a separação da Cisplatina e abre caminho à independência do Uruguai. No Brasil, os custos da guerra ampliam críticas ao governo.',[D('Acompanhar os últimos anos do reinado.','crise_1830')]);
/* 1829–1831 */
add('crise_1830','ruas_1831','1829–1830','CAPÍTULO VI · O IMPÉRIO EM CRISE','NARRADOR','No fim da década de 1820, dificuldades financeiras, críticas ao governo e tensões políticas se acumulam. O Império ainda tenta consolidar suas instituições.',[
 D('Ouvir a população nas ruas.','rua_1830',{focus:'povo',docs:['crise1830'],meters:{escuta:2}}),
 D('Ler as críticas publicadas em jornais.','jornais_1830',{focus:'imprensa',docs:['crise1830'],meters:{prudencia:1}}),
 D('Observar os gabinetes políticos.','gabinete_1830',{focus:'corte',docs:['crise1830'],meters:{saber:1}}),
 D('Apressar o calendário para 1831.','garrafadas_1831',{meters:{pressa:2}})
]);
add('rua_1830','ruas_1831','1830','CAPÍTULO VI','JOANA','Crises políticas não têm apenas rostos de ministros. A falta de recursos, a desigualdade e a insegurança chegam à vida cotidiana.',[D('Continuar observando.','garrafadas_1831',{flags:['ouviu_povo']})]);
add('jornais_1830','tipografia_1824','1830','CAPÍTULO VI','REDATOR','Jornais apresentam críticas duras e posições divergentes. Você cruza datas e evita tomar boatos como provas.',[D('Continuar observando.','garrafadas_1831',{flags:['viu_imprensa'],meters:{prudencia:1}})]);
add('gabinete_1830','corte_1825','1830','CAPÍTULO VI','ESCRIVÃ HELENA','O desgaste do governo não se resume a um episódio. Diferentes tensões alimentam a crise de legitimidade de D. Pedro I.',[D('Continuar observando.','garrafadas_1831',{flags:['viu_corte']})]);
add('garrafadas_1831','ruas_1831','1831','CAPÍTULO VII · A ABDICAÇÃO','NARRADOR','Março de 1831: confrontos nas ruas do Rio ficam conhecidos como Noite das Garrafadas. A crise política se aprofunda.',[
 D('Anotar os relatos divergentes.','relatos_1831',{docs:['abril1831'],meters:{prudencia:2}}),
 D('Prestar atenção nas pessoas ameaçadas.','cuidado_1831',{docs:['abril1831'],meters:{escuta:2}}),
 D('Conferir as marcas nos papéis do portal.','marcas_1831',{docs:['abril1831'],flags:['pista3'],meters:{saber:1}},s=>f(s,'pista1')&&f(s,'pista2')),
 D('Seguir imediatamente para abril.','abdicacao_1831',{meters:{pressa:2}})
]);
add('relatos_1831','ruas_1831','1831','CAPÍTULO VII','MORADOR DO RIO','As versões se confrontam, e a circulação de acusações aumenta a tensão. Você distingue o que está registrado do que é apenas rumor.',[D('Prosseguir para 7 de abril.','abdicacao_1831')]);
add('cuidado_1831','ruas_1831','1831','CAPÍTULO VII','JOANA','Em meio ao tumulto, você escolhe ouvir quem teme a violência e a instabilidade.',[D('Prosseguir para 7 de abril.','abdicacao_1831',{flags:['ouviu_povo']})]);
add('marcas_1831','ruas_1831','1831','CAPÍTULO VII','NARRADOR','As três marcas formam o desenho do portal. É um segredo de fantasia — não um fato histórico. Os documentos reais continuam contando outra história.',[D('Guardar a chave e prosseguir.','abdicacao_1831',{flags:['chave_portal'],meters:{saber:1}})]);
add('abdicacao_1831','ruas_1831','1831','CAPÍTULO VII','NARRADOR','7 de abril de 1831. D. Pedro I abdica. Termina o Primeiro Reinado; a Regência se inicia. A sua viagem pela década chega ao momento do retorno.',[D('Ir ao portal com meus documentos.','portal_final')]);
/* PORTAL + ENDINGS */
add('portal_final','portal_atualidade','1831','EPÍLOGO · A PORTA DO TEMPO','NARRADOR',s=>`O portal se abre. Você carrega ${s.docs.length} de ${Object.keys(DOCS).length} registros possíveis e um conjunto único de escolhas. Não é a história do Brasil que mudou — é o modo como você a percebeu. Qual será sua última decisão?`,s=>[
 D('Regressar agora, mesmo deixando perguntas.','@retorno_apressado',{},enough),
 D('Construir um relato que compare diferentes perspectivas.','@retorno_consciente',{},s=>enough(s)&&m(s,'saber')+m(s,'prudencia')>=5),
 D('Voltar com as vozes das províncias.','@cronista_provincias',{},s=>enough(s)&&(focus(s,'provincias')||f(s,'viu_bahia'))),
 D('Levar um registro sobre as instituições do Império.','@cartas_corte',{},s=>enough(s)&&(focus(s,'corte')||f(s,'viu_corte'))),
 D('Preservar as notícias e os debates impressos.','@vozes_tipografia',{},s=>enough(s)&&(focus(s,'imprensa')||f(s,'viu_imprensa'))),
 D('Guardar o testemunho da Guerra da Cisplatina.','@travessia_prata',{},s=>enough(s)&&has(s,'prata1828')),
 D('Priorizar o relato das pessoas pouco ouvidas.','@memorias_silenciadas',{},s=>enough(s)&&m(s,'escuta')>=4),
 D('Escolher permanecer mais um tempo no passado.','@entre_dois_tempos'),
 D('Usar a chave secreta das margens do tempo.','@arquivo_tempo',{},s=>secretReady(s)),
 D('Forçar a abertura sem registros suficientes.','@portal_incompleto',{},s=>!enough(s)),
 ]);

export const story={nodes:N,docs:DOCS,endings:ENDS,makeChoice:D,constants:{requiredYears:['1822','1823','1824','1825','1826','1827–1828','1829–1830','1831']}};
