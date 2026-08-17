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

export const OVERRIDES = {
  ...controladoresEIndicadores,
  ...modulosDePotencia,
  ...relesDeEstadoSolido,
};
