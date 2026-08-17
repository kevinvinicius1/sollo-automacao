/**
 * Ajustes sobre o que a Gefran publica, aplicados na origem pelo extrator.
 * A chave é o título do produto no site da Gefran. Campos aceitos:
 *
 *   title        rótulo do produto quando o original está em outro idioma
 *   code         código exibido no selo do card (use "" para não exibir)
 *   subTitle     base do nome e do slug
 *   overview     descrição técnica longa (HTML)
 *   mainFeatures lista de características principais (HTML)
 *
 * Existem por dois motivos:
 *
 * 1. Idioma. O site pt-BR da Gefran tem trechos que ficaram em inglês e, no
 *    caso do GRM-H, em espanhol. Onde existe um produto irmão já publicado
 *    em português (GRM para o GRM-H, GRP para o GRP-H), o texto oficial dele
 *    é reaproveitado em vez de uma tradução nova.
 *
 * 2. Tamanho. Alguns subtítulos passam de 100 caracteres e estouram a faixa
 *    de título da página de produto, dimensionada para uns 60. Sai do nome
 *    o que é detalhe de interface, mostrador ou faixa de corrente — que
 *    continua no resumo e nas especificações.
 */

/* ------------------------ controladores e indicadores ------------------- */

const controladoresEIndicadores = {
  "3850T": { subTitle: "Controlador e registrador de até 16 loops PID" },
  "2850T": { subTitle: "Programador e registrador de até 8 loops PID" },
  "40TB": { subTitle: "Indicador/Unidade de alarme de temperatura e pressão" },
  "40B48": { subTitle: "Indicador/Unidade de alarme de força, pressão e posição" },
  "40B96": { subTitle: "Indicador/Unidade de alarme de força, pressão e posição" },
  "40A48-96": { subTitle: "Indicador/Unidade de alarme de tensão e corrente" },
  "4A48-96": { subTitle: "Indicador/Unidade de alarme de tensão e corrente" },
  "4T96": { subTitle: "Indicador" },
  "400-401": {
    mainFeatures:
      "<p>Entrada universal configurável pelo painel frontal</p>\n" +
      "<p>Precisão melhor que 0,2% f.e. em condição nominal</p>\n" +
      "<p>Indicação do desvio por gráfico de barras</p>",
  },
};

/* --------------------------- módulos de potência ------------------------ */

/** Texto oficial do GRM, reaproveitado no GRM-H (publicado em espanhol). */
const visaoGeralGrmH =
  "<p><strong>Visão geral</strong></p>\n" +
  "<p>A necessidade dos fabricantes e usuários de instalações de tratamento " +
  "térmico é manter um controle preciso e constante do processo, com o " +
  "objetivo de obter uma qualidade constante da produção e, ao mesmo tempo, " +
  "otimizar o consumo de energia.</p>\n" +
  "<p>Os recursos dos controladores de potência da série GRM-H garantem um " +
  "gerenciamento eficiente do aquecimento, mesmo no caso de cargas elétricas " +
  "complexas, que exigem recursos especiais, como no caso de lâmpadas " +
  "infravermelhas ou elementos de aquecimento de carboneto de silício.</p>\n" +
  "<p><strong>Controle</strong></p>\n" +
  "<p>A disponibilidade de vários modos de aquecimento configuráveis (ZC, BF, " +
  "FT, HSC, PA), combinada com recursos que garantem o fornecimento estável " +
  "de energia à carga — como a compensação por flutuações na tensão da rede " +
  "elétrica ou pelo envelhecimento dos elementos de aquecimento —, permite um " +
  "gerenciamento eficiente da temperatura, resultando na otimização " +
  "energética do processo.</p>\n" +
  "<p><strong>Protocolos de comunicação digital</strong></p>\n" +
  "<p>A digitalização industrial está agora alcançando sua fronteira final: o " +
  "nível de campo da automação industrial. Ao selecionar um controlador de " +
  "potência GRM-H com os protocolos de comunicação IO-Link ou Modbus RTU, os " +
  "usuários têm acesso a dados valiosos do processo para manutenção preditiva " +
  "e para o uso de aprendizado de máquina em suas instalações.</p>\n" +
  "<p><strong>Configuração por NFC</strong></p>\n" +
  "<p>Comissionamento simples e seguro, manutenção e diagnóstico rápidos são " +
  "requisitos atuais para dispositivos como os controladores de potência. A " +
  "série GRM-H, graças à tecnologia NFC, possibilita ampliar a interação com " +
  "o usuário utilizando smartphones ou tablets comuns como configuradores " +
  "inteligentes. Graças a uma interface gráfica e intuitiva, a configuração e " +
  "o diagnóstico são particularmente intuitivos.</p>";

const modulosDePotencia = {
  GPC: { subTitle: "Controlador de potência avançado, até 600 A" },
  GRC: { subTitle: "Controlador de potência compacto, de 1 a 3 fases" },
  GRM: { subTitle: "Controlador de potência compacto monofásico, até 120 A" },
  "GRM-H": {
    subTitle: "Controlador de potência compacto com dissipador, até 120 A",
    overview: visaoGeralGrmH,
    mainFeatures:
      "<p>Tamanho compacto de 10 A a 120 A</p>\n" +
      "<p>Tensão de carga: 480 V, 600 Vca</p>\n" +
      "<p>Comunicação digital via IO-Link e Modbus RTU</p>",
  },
  GSLM: { subTitle: "Gerenciador inteligente de cargas elétricas" },
  GFX: { subTitle: "Controlador de potência PID até 120 A" },
  "GFX Multifunções": { subTitle: "Controlador de potência PID até 15 A" },
  // A Gefran escreve "4 PID circuitos"; a ordem correta em português é
  // "4 circuitos PID", usada aqui e no GFX4-IR.
  GFX4: { subTitle: "Controlador de potência 4 circuitos PID até 80 kW" },
  "GFX4-IR": { subTitle: "Controlador 4 circuitos PID para lâmpadas SWIR" },
  "IR-12/IR-24": { subTitle: "Controladores multicanais para lâmpadas SWIR" },
  GTF: {
    mainFeatures:
      "<p>Níveis de corrente de 40 A a 250 A</p>\n" +
      "<p>Tensão nominal de 480 Vca a 600 Vca</p>\n" +
      "<p>Fusível eletrônico rearmável incorporado (opcional)</p>",
  },
  "GTF Xtra": {
    subTitle: "Controlador de potência com proteção de sobrecorrente",
    overview:
      "<p>O controlador de potência GTF-Xtra reúne, em um mesmo equipamento, " +
      "a unidade de potência de estado sólido monofásica, bifásica ou " +
      "trifásica e o controlador, somados à proteção integrada contra falhas " +
      "por sobrecorrente.</p>\n" +
      "<p>Essa proteção dispensa os fusíveis extrarrápidos, reduzindo as " +
      "paradas de máquina e o custo de reposição dos fusíveis queimados. Ela " +
      "monitora a corrente de carga instantaneamente, corta a alimentação " +
      "quando a carga atinge um limite pré-ajustado e isola os dispositivos " +
      "de chaveamento de potência.</p>\n" +
      "<p>Em aplicações sujeitas a curtos-circuitos intermitentes e " +
      "sobrecargas, o GTF-Xtra pode ser programado para restabelecer a " +
      "alimentação automaticamente assim que a falha for eliminada, evitando " +
      "a parada completa do processo e mantendo a produção.</p>\n" +
      "<p>A alimentação também pode ser restabelecida manualmente, local ou " +
      "remotamente.</p>\n" +
      "<p>No restabelecimento da corrente é aplicada uma rampa de soft-start, " +
      "que evita danos ao sistema caso a falha não tenha sido efetivamente " +
      "eliminada.</p>\n" +
      "<p>O GTF-Xtra é compacto, modular e otimizado para controlar " +
      "praticamente qualquer sistema de aquecimento resistivo, em uma ampla " +
      "gama de aplicações industriais.</p>\n" +
      "<p>Os recursos são configurados por um software para PC, com " +
      "configuração guiada e intuitiva.</p>\n" +
      "<p>O GTF-Xtra sempre oferece conexão serial RS485 com protocolo Modbus " +
      "RTU, para controlar correntes, tensões, potências, status de carga e " +
      "status do dispositivo a partir do terminal do supervisor (IHM) ou " +
      "do CLP.</p>",
    mainFeatures:
      "<p>Indicado para uma ampla gama de aplicações, incluindo fornos de " +
      "tratamento térmico, processos de sinterização de materiais em alta " +
      "temperatura e produção de vidro e cerâmica</p>\n" +
      "<p>A proteção integrada contra sobrecorrente protege todo o processo " +
      "de aquecimento e o sistema</p>\n" +
      "<p>Projetado para sistemas de aquecimento monofásicos ou trifásicos " +
      "com Super Kanthal™ e carboneto de silício</p>",
  },
  "GEFLEX General accessories": {
    title: "Acessórios GEFLEX",
    code: "",
    overview: "<p>Fusíveis, cabos e porta-fusíveis.</p>",
  },
  "Power controllers general accessories": {
    title: "Acessórios para controladores de potência",
    code: "",
    overview:
      "<p>Terminais de operação, ventiladores, fusíveis e porta-fusíveis, " +
      "cabos e conectores.</p>",
  },
};

/* ------------------------ relés de estado sólido ------------------------ */

/** Texto oficial do GRP, reaproveitado no GRP-H (publicado em inglês). */
const visaoGeralGrpH =
  "<p>A capacidade de oferecer soluções de controle personalizadas permite " +
  "atender rapidamente às mais diversas necessidades de automação. Para isso, " +
  "a série GRP oferece uma ampla gama de SSRs extremamente compactos, com uma " +
  "estrutura básica robusta, mas escalável em termos de intensidade de " +
  "corrente (de 15 A a 120 A), tipo de controle e recursos de " +
  "configuração.</p>\n" +
  "<p><strong>Controle</strong></p>\n" +
  "<p>Um controle preciso do processo é a condição essencial para alcançar " +
  "uma produção constante e de alta qualidade. Para atingir esse objetivo, é " +
  "necessário gerenciar da melhor maneira possível os diferentes tipos de " +
  "aquecedores industriais, desde resistências lineares até lâmpadas " +
  "infravermelhas. Para isso, a nova série de SSRs oferece uma série de " +
  "funcionalidades de controle (ZC/BF/HSC/PA/Softstart) totalmente " +
  "configuráveis para se adaptar às diversas necessidades.</p>\n" +
  "<p><strong>Diagnósticos</strong></p>\n" +
  "<p>Prevenir possíveis anomalias permite limitar ou eliminar paradas " +
  "prejudiciais e perdas de produção. A série GRP inclui funções dedicadas, " +
  "como o alarme HB para interrupção parcial da carga com precisão de 1/8 da " +
  "carga total, curto-circuito do SCR, superaquecimento e falha de " +
  "energia.</p>\n" +
  "<p><strong>Comunicação IO-Link</strong></p>\n" +
  "<p>A digitalização da fábrica está alcançando sua fronteira final: o nível " +
  "de campo da pirâmide de automação. Nesse nível, o IO-Link está se " +
  "consolidando como a forma de comunicação mais adequada para acessar " +
  "facilmente dispositivos como sensores e atuadores. Nessa perspectiva, a " +
  "série GRP foi desenvolvida para ser integrada a essa arquitetura de " +
  "automação.</p>\n" +
  "<p><strong>Configuração NFC</strong></p>\n" +
  "<p>Comissionamento, manutenção e diagnósticos rápidos, de forma simples e " +
  "segura, agora fazem parte das capacidades de dispositivos como o SSR. Tudo " +
  "isso graças à tecnologia NFC, que permite ampliar a interface do usuário " +
  "utilizando um smartphone ou tablet comum como configurador inteligente. " +
  "Graças a uma interface gráfica intuitiva, a configuração e os diagnósticos " +
  "são particularmente fáceis.</p>";

const relesDeEstadoSolido = {
  GRP: { subTitle: "Relé de estado sólido com diagnóstico avançado, até 120 A" },
  "GRP-H": {
    subTitle: "Relé de estado sólido com diagnóstico avançado e dissipador",
    overview: visaoGeralGrpH,
    mainFeatures:
      "<p>Faixa de corrente de 15 A a 120 A</p>\n" +
      "<p>Dimensões ultrafinas</p>\n" +
      "<p>Comunicação IO-Link</p>",
  },
  "GRS-H": {
    subTitle: "Relé de estado sólido monofásico com dissipador, até 120 A",
  },
  "Accessories for solid state relays": {
    title: "Acessórios para relés de estado sólido",
    code: "",
    overview:
      "<p>A seção de acessórios reúne fusíveis extrarrápidos específicos para " +
      "proteger adequadamente cada contator de estado sólido, além de outros " +
      "acessórios.</p>",
  },
};

/* --------------------------- sensores de posição ------------------------ */

/**
 * Os magnetostritivos seguem um padrão de subtítulo que a Gefran escreve de
 * forma irregular ("sem contacto Plus", "Plus Sem contacto", "avançado sem
 * contacto", "Rosca da haste") e em português de Portugal ("contacto").
 * Todos são normalizados para `Magnetostritivo <série>, <formato>, saída
 * <interface>`, o que também resolve o tamanho: os originais passam de 85
 * caracteres. O "sem contato" sai do nome — é da própria tecnologia e se
 * repete em todos — e o material da haste (AISI 316) fica nas especificações.
 */
const magnetostritivo = (serie, formato, saida) =>
  `Magnetostritivo${serie ? " " + serie : ""}, ${formato}, saída ${saida}`;

const PERFIL = "perfil de alumínio";
const ROSCADA = "haste roscada";
const FLANGE = "haste flange";

const sensoresDePosicao = {
  "WPG-A": { subTitle: magnetostritivo("geral", PERFIL, "analógica") },
  "WPP-A": { subTitle: magnetostritivo("plus", PERFIL, "analógica") },
  "WPA-A": { subTitle: magnetostritivo("avançado", PERFIL, "analógica") },
  "WPP-S": { subTitle: magnetostritivo("plus", PERFIL, "SSI") },
  "WPA-S": { subTitle: magnetostritivo("avançado", PERFIL, "SSI") },
  "WPA-F": { subTitle: magnetostritivo("avançado", PERFIL, "Profinet") },
  "WPA-E": { subTitle: magnetostritivo("avançado", PERFIL, "Ethercat") },
  WPL: { subTitle: magnetostritivo("", PERFIL, "IO-Link") },
  "WRG-A": { subTitle: magnetostritivo("geral", ROSCADA, "analógica") },
  "WRA-A": { subTitle: magnetostritivo("avançado", ROSCADA, "analógica") },
  "WRP-A": { subTitle: magnetostritivo("plus", ROSCADA, "analógica") },
  "WRP-S": { subTitle: magnetostritivo("plus", ROSCADA, "SSI") },
  "WRA-F": { subTitle: magnetostritivo("avançado", ROSCADA, "Profinet") },
  "WRA-E": { subTitle: magnetostritivo("avançado", ROSCADA, "Ethercat") },
  "RK-2": {
    subTitle: magnetostritivo("compacto", FLANGE, "analógica"),
    mainFeatures:
      "<p>Transdutor absoluto</p>\n" +
      "<p>Curso: 50 a 2.500 mm</p>\n" +
      "<p>Saída digital RS422 Partida/Parada (RK-2 S)</p>",
  },
  "RK-4": {
    subTitle: magnetostritivo("compacto", ROSCADA, "analógica"),
    mainFeatures:
      "<p>Transdutor absoluto</p>\n" +
      "<p>Curso: 50 a 2.500 mm</p>\n" +
      "<p>Saída analógica direta (RK-4 N/K/E)</p>",
  },

  // O WRA-S é publicado em inglês; o texto abaixo parte do WRA-A, irmão de
  // mesma haste já publicado em português, trocando a interface.
  "WRA-S": {
    subTitle: magnetostritivo("avançado", ROSCADA, "SSI"),
    overview:
      "<p>Transdutor de posição linear sem contato com tecnologia " +
      "magnetostritiva HYPERWAVE e interface digital RS422-SSI. Fechamento da " +
      "carcaça com anel de porca removível para permitir a substituição de " +
      "todo o sistema eletrônico e do elemento sensor.</p>\n" +
      "<p>A ausência de contato elétrico no cursor elimina todo o desgaste e " +
      "garante vida útil praticamente ilimitada. Alta precisão da medição no " +
      "que diz respeito à não linearidade, repetibilidade e histerese. Alta " +
      "resistência a vibrações e choques mecânicos para uso em ambientes " +
      "industriais adversos.</p>",
  },

  // RK-5 e RK-5 C também vêm em inglês. A tradução segue o vocabulário já
  // usado nos textos em português do RK-2 e do RK-4.
  "RK-5": {
    subTitle: magnetostritivo("", FLANGE, "analógica"),
    overview:
      "<p>Transdutor de posição linear com a tecnologia magnetostritiva ONDA, " +
      "desenvolvida pela Gefran para longa vida útil. A ausência de contato " +
      "elétrico no cursor elimina o desgaste e garante vida útil praticamente " +
      "ilimitada.</p>\n" +
      "<p>A tecnologia ONDA, patenteada pela Gefran, resulta em uma estrutura " +
      "compacta e modular, de instalação simples. O RK-5 é um transdutor de " +
      "posição magnetostritivo com conexão por flange, instalado inteiramente " +
      "dentro de cilindros hidráulicos.</p>\n" +
      "<p>Seu projeto exclusivo, somado a uma ampla gama de configurações de " +
      "cursor, garante instalação fácil e total compatibilidade com as " +
      "especificações dos fabricantes de cilindros.</p>\n" +
      "<p>A temperatura de trabalho de -40 a +105 °C, as pressões de trabalho " +
      "de até 350 bar e a alta resistência a vibrações (25 g) e choques " +
      "(100 g) dão ao sensor a robustez indispensável ao uso pesado, como na " +
      "hidráulica móvel.</p>\n" +
      "<p>Alto desempenho de medição em linearidade, histerese e " +
      "repetibilidade. O sinal é analógico nos modelos com saída em corrente " +
      "ou tensão.</p>",
  },
  "RK-5 C": {
    subTitle: magnetostritivo("", FLANGE, "CANopen"),
    overview:
      "<p>Transdutor de posição linear com a tecnologia magnetostritiva ONDA, " +
      "desenvolvida pela Gefran para longa vida útil. A ausência de contato " +
      "elétrico no cursor elimina o desgaste e garante vida útil praticamente " +
      "ilimitada.</p>\n" +
      "<p>A tecnologia ONDA, patenteada pela Gefran, resulta em uma estrutura " +
      "compacta e modular, de instalação simples. O RK-5 é um transdutor de " +
      "posição magnetostritivo com conexão por flange, instalado inteiramente " +
      "dentro de cilindros hidráulicos.</p>\n" +
      "<p>Seu projeto exclusivo, somado a uma ampla gama de configurações de " +
      "cursor, garante instalação fácil e total compatibilidade com as " +
      "especificações dos fabricantes de cilindros.</p>\n" +
      "<p>A temperatura de trabalho de -40 a +105 °C, as pressões de trabalho " +
      "de até 350 bar e a alta resistência a vibrações (25 g) e choques " +
      "(100 g) dão ao sensor a robustez indispensável ao uso pesado, como na " +
      "hidráulica móvel.</p>\n" +
      "<p>Alto desempenho de medição em linearidade, histerese e " +
      "repetibilidade.</p>\n" +
      "<p>O sistema de comunicação em barramento CAN permite uma transmissão " +
      "rápida e segura. A implementação do protocolo CANopen DS-301 e do " +
      "Device Profile DS-406 possibilita integrar o transdutor ao sistema de " +
      "controle e automação de forma rápida e simples.</p>",
  },

  // A Gefran publica estes dois só com a foto: nem descrição, nem
  // características. A frase abaixo é o subtítulo deles ("Acessórios por
  // encomenda") escrito por extenso, para o card não ficar sem texto.
  "RK-5 – acessórios": {
    title: "Acessórios RK-5",
    code: "",
    subTitle: "",
    overview: "<p>Acessórios sob encomenda para a série RK-5.</p>",
  },
  "IK4 – RK2 – RK4": {
    title: "Acessórios IK4, RK-2 e RK-4",
    code: "",
    subTitle: "",
    overview: "<p>Acessórios sob encomenda para as séries IK4, RK-2 e RK-4.</p>",
  },

  // Linear Twiist, inclinômetros e sensores angulares: subtítulos em inglês.
  "LM-C": { subTitle: "Sensor TWIIST sem contato, multivariável, saída CANopen" },
  "LM-L": { subTitle: "Sensor TWIIST sem contato, multivariável, saída IO-Link" },
  "LS-A": { subTitle: "Sensor TWIIST sem contato, saída analógica" },
  GIG: { subTitle: "Inclinômetro geral de eixo simples ou duplo (XY/360°)" },
  GIB: { subTitle: "Sensor de inclinação básico, eixo simples ou duplo (XY/360°)" },
  GIT: { subTitle: "Inclinômetro avançado de eixo simples ou duplo (XY/360°)" },
  GRA: { subTitle: "Sensor rotativo de volta única por efeito Hall, com eixo" },
  GRN: { subTitle: "Sensor rotativo de volta única por efeito Hall, sem eixo" },
  "GR3P": { subTitle: "Sensor rotativo por efeito Hall com conector AMP Superseal" },

  // Sensores a cabo: a faixa de medição já está no nome do modelo, então sai
  // do subtítulo — os originais passam de 140 caracteres.
  GSF: { subTitle: "Transdutor de posição a cabo (potenciômetro a cabo)" },
  "GSH-S 1.8-8.3 m": { subTitle: "Sensor a cabo para posição linear" },
  "GSH-S 10-12.5m": { subTitle: "Sensor a cabo para posição linear" },
  "GSH-A 1.8-8.3 m": { subTitle: "Sensor a cabo para posição linear e inclinação" },
  "GSH-A 10-12.5m": { subTitle: "Sensor a cabo para posição linear e inclinação" },

  // Células de carga
  DLC: { subTitle: "Célula de carga de diafragma, sem amplificador" },
  DLCA: { subTitle: "Célula de carga de diafragma, com amplificador" },

  /*
   * Potenciômetros. A Gefran publica a maior parte desta sublinha só com um
   * subtítulo solto ("Com haste", "Sem haste", "Apalpador") e sem descrição
   * nenhuma, o que deixaria o card sem dizer o que o produto é. O tipo passa
   * a abrir o subtítulo, como a própria Gefran já faz no LT67
   * ("Potenciômetro com haste - Proteção IP67").
   */
  LT: { subTitle: "Potenciômetro com haste" },
  PA1: { subTitle: "Potenciômetro com haste" },
  PK: { subTitle: "Potenciômetro sem haste" },
  PC: { subTitle: "Potenciômetro autoportante com corpo cilíndrico" },
  PY1: { subTitle: "Potenciômetro apalpador" },
  PY2: { subTitle: "Potenciômetro apalpador com ponta de esfera" },
  PY3: { subTitle: "Potenciômetro apalpador com ponta de rolamento" },
  PZ12: { subTitle: "Potenciômetro de corpo cilíndrico 1/2 polegada" },
  PZ34: { subTitle: "Potenciômetro de corpo cilíndrico 3/4 polegada" },
  LT67: { subTitle: "Potenciômetro com haste, proteção IP67" },
  PC67: { subTitle: "Potenciômetro autoportante com corpo cilíndrico, IP67" },
  "PZ67-S": { subTitle: "Potenciômetro com suportes de proteção IP67" },
  "PZ67-A": { subTitle: "Potenciômetro com autoalinhamento, proteção IP67" },
  PME: { subTitle: "Potenciômetro para cilindros pneumáticos" },
  PMA: { subTitle: "Potenciômetro autoportante" },
  PMI: { subTitle: "Potenciômetro patenteado para cilindros hidráulicos" },
  "PMI-SL": { subTitle: "Potenciômetro de 12,7 mm para cilindros hidráulicos" },
  "PMI-SLE": { subTitle: "Potenciômetro com saída analógica, cilindros hidráulicos" },
  IC: { subTitle: "Potenciômetro para cilindros hidráulicos" },
  PS: { subTitle: "Potenciômetro rotativo com montagem servo" },
  PR65: { subTitle: "Potenciômetro rotativo industrial estanque" },

  /*
   * Estes quatro não são sensores, e sim condicionadores de sinal — o
   * subtítulo original ("Para transdutores lineares") não diz o que são.
   */
  PCIR: { subTitle: "Condicionador de sinal para transdutores lineares ou rotativos" },
  "PCIR101-102": { subTitle: "Condicionador de sinal para transdutores lineares" },
  CIR: { subTitle: "Condicionador de sinal para transdutores extensométricos" },
  "CIR-D": { subTitle: "Condicionador de sinal com isolamento galvânico" },
};

export const OVERRIDES = {
  ...controladoresEIndicadores,
  ...modulosDePotencia,
  ...relesDeEstadoSolido,
  ...sensoresDePosicao,
};
