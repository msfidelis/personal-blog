---
layout: post
image: assets/images/system-design/protocolos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Protocolos de Comunicação, TCP, UDP e OSI
---

Neste capitulo vamos abordar de forma simples os conceitos que permeiam **os principais tópicos de comunicação de rede na ótica de System Design**. A importância de entender protocolos de comunicação pode ser um *game change* muito grande para escovar tópicos de [performance](/performance-capacidade-escalabilidade/) e [resiliência](). Compreender como os protocolos base, como TCP/IP e UDP, e outros protocolos que são construídos em cima deles são implementados pode nos ajudar a tomar as melhores decisões arquiteturais, projetar estratégias, aumentar níveis de performance e tempo de resposta se entendermos as melhores características de cada um deles e empregá-las nos lugares corretos. 

Olhando para meus pares e de profissionais de engenharia que já trabalhei no lugar dos anos, o entendimento da camada de networking sempre foi um grande gap na compreenção de uma topologia de sistemas. Esse artigo foi baseado em discussões e sessões de design que tive o prazer de participar ao decorrer desses anos, compilando de forma simples os tópicos práticos e teóricos mais importantes para que a absorção e entendimento seja simples e fácilmente empregada no dia a dia das pessoas que vierem a investir um tempo aqui. Espero que seja de grande valor. 

<br>

# Modelo OSI

O **Modelo OSI** (*Open Systems Interconnection*) é um modelo conceitual desenvolvido pela **International Organization for Standardization** (*ISO*) na década de 1980, com o objetivo de padronizar as funções de sistemas de telecomunicações, componentes de rede e protocolos. Representando uma abstração com base acadêmica, o modelo serve como fundamento para o entendimento de redes de alta disponibilidade, especificação de componentes de rede e criação, além de troubleshooting de protocolos de comunicação e conexões entre serviços. É importante compreender como funciona esse modelo teórico antes de entrarmos de fato em implementações de protocolos, para conseguirmos mentalmente classificar onde cada um deles opera entre as camadas propostas por ele. 

![OSI Model](/assets/images/system-design/osi.png)

O Modelo OSI é dividido em sete camadas, cada uma responsável por funções específicas:

### Camada 1: Física

A primeira camada é r**esponsável pela transmissão e recepção de dados brutos não tratados sobre um meio físico**. Define especificações elétricas, mecânicas, procedurais e funcionais para ativar, manter e desativar conexões físicas. Inclui **cabos de rede**, **cabos de cobre**, **fibra óptica** e **aplicações Wi-Fi**, englobando todos os meios físicos de entrada e saída para a rede. **Basicamente resumida em dispositivos paupáveis**. 

### Camada 2: Enlace

A segunda camada de Enlace fornece uma transferência de dados confiável entre dois componentes de rede adjacentes, detectando e corrigindo erros do nível físico. Inclui implementações de **Ethernet** para transmissão de dados em **LANs**, **PPP (Point-to-Point Protocol)** para conexões diretas entre dois nós e seus **MAC Address**, que identifica dispositivos unicamente.

### Camada 3: Rede

A terceira camada, conhecida como **Rede**, **controla a operação da sub-rede, decidindo o encaminhamento de dados com base nos endereços lógicos e nas condições das redes**. Utiliza roteamento para enviar pacotes através de múltiplas redes, com protocolos como IP, fornecendo endereçamento através de **IPV4 e IPV6**.

### Camada 4: Transporte

Gerencia a transferência de dados entre sistemas finais, assegurando a entrega sem erros e em sequência. **Controla fluxo, corrige erros e entrega segmentos de pacotes.** Destacam-se os protocolos TCP, que entrega pacotes de forma confiável, e UDP, que oferece conexões rápidas, porém menos confiáveis.

### Camada 5: Sessão

Responsável por iniciar, gerenciar e finalizar conexões entre aplicações, frequentemente usada em serviços com conexões autenticadas de longa duração.

### Camada 6: Apresentação

Traduz dados do formato da rede para o formato aceito pelas aplicações, realizando criptografia, compressão e conversão de dados. **Funciona como uma "Camada de Tradução"**, implementando protocolos de segurança como **SSL/TLS** e suportando formatos de dados como **JPEG, GIF, PNG**.

### Camada 7: Aplicação

Fornece serviços de rede para aplicações do usuário, **incluindo transferência de arquivos e conexões de software**. É a c**amada mais próxima do usuário,** atuando como interface entre o software de aplicação e as funções de rede. Implementa protocolos como **HTTP, HTTPS, Websockets, gRPC, além de suportar sessões de SSH e transferências FTP**.


<br>

# Os Protocolos de Comunicação

Entrando agora de fato nos protocolos de comunicação, vamos entender algumas das implementações mais importantes e mais comunis dentro do dia a dia da engenharia de software e usuários de aplicações de rede, resumidamente qualquer pessoa do planeta Terra que possua conexões com a internet. Temos várias implementações diferentes com diversas vantagens e desvantagens quando olhamos uma mapa de protocolos existentes, inclusive alguns protocolos são construídos outros protocolos mais estabelecidos como base, como é caso do UDP e do TCP/IP. Inicialmente vamos olhar como funcionam essas duas implementações tratando os mesmos como **protocolos base** para depois detalhar protocolos mais complexos que se utilizam dos mesmos para cumprir seus papéis. 

## Protocolos Base

Para compreender detalhadamente os protocolos e tecnologias de comunicação modernas, é crucial revisitar os protocolos de rede de baixo nível que servem como sua base. Antes de explorar protocolos como HTTP/2, HTTP/3, gRPC e AMPQ, precisamos entender os mecanismos de conexão fundamentais, principalmente o TCP/IP e o UDP, que são essenciais para o desenvolvimento dessas tecnologias avançadas.

### UDP (User Datagram Protocol)

O UDP, ou User Datagram Protocol, é um protocolo da camada de transporte (camada 4) notavelmente simples, que possibilita a transmissão de dados entre hosts na rede de maneira não confiável e sem a necessidade de estabelecer uma conexão prévia. Diferentemente de outros protocolos de rede, o UDP sacrifica a confiabilidade em favor da performance, eliminando o processo de estabelecimento, manutenção, gerenciamento e encerramento de conexões. Isso permite que os dados sejam enviados ao destinatário sem garantias de recebimento ou integridade.

![UDP](/assets/images/system-design/udp.png)

Utilizando Datagramas para o envio de pacotes, o UDP permite a transmissão de dados independentes que não requerem entrega em uma ordem ou prioridade específica, nem dependem de confirmação de recebimento. Essa característica torna o UDP adequado para aplicações que demandam comunicação em tempo real, mas que podem tolerar certa perda ou corrupção de dados.

Protocolos e arquiteturas que exigem envio e recebimento de dados com complexidade próxima ao tempo real, e que podem suportar perdas e corrupções, geralmente são construídos sobre o UDP.

Analogamente, o funcionamento do UDP pode ser comparado a entregadores que deixam correspondências debaixo do portão, na calçada ou na janela das casas, prosseguindo para as próximas entregas sem confirmar se o destinatário recebeu a mensagem.


### TCP/IP (Transmission Control Protocol/Internet Protocol)

O protocolo **TCP/IP**, ou **Transmission Control Protocol/Internet Protocol**, ao contrário do UDP, é um conjunto de protocolos orientados a conexões. Ele se encarrega desde o primeiro momento a abrir, manter, checar a saúde e encerrar a conexão, com o objetivo de garantir que tudo que foi enviado chegou de forma integra e confiável ao seu destino exatamente na ordem que faça sentido. Ele também atua na camada de transporte (layer 4), e antes de enviar qualquer pacote entre os hosts, ele estabelece uma conexão e utiliza mecanismos de controle de erro e fluxo, para garantir que tudo que foi enviado chegue na ordem correta e sem corrupção. 


![TCP](/assets/images/system-design/tcp.png)

O modelo TCP utiliza de termos como **ACK, SYN, SYN-ACK** e **FIN** para exemplificar os comportamentos de como funciona a gestão das suas conexões. Existem algumas outras Flag como **URG**, **PSH** e **RST**, porém vamos nos atentar a um fluxo simplificado para nivelarmos como uma conexão TCP funciona. 

Todas as ações que ocorrem dentro do ciclo de vida de uma conexão TCP são confirmadas através de **ACKS (Acknowledgment)**.

Para inicio da conexão TCP, é necessário uma **série de confirmações entre cliente e servidor para garantir sequencialidade e confiabilidade**. Esse processo é conhecido somo **"three-way handshake"**, exemplificado pela sequencia de três ações **SYN, SYN-ACK e ACK**. Por isso, three-way handshake. 

No inicio, o cliente começa o processo enviando um segmento TCP com a flag **SYN (synchronize)** marcada ao servidor, **indicando a intenção de estabelecer uma conexão**. Esse processo inicial inclui um número de sequencia conhecido como **ISN** (Initial Sequence Number), que é usado para sincronização e controle de fluxo.

Após esse primeiro contato, servidor responde ao cliente com um segmento TCP contendo as flags **SYN e ACK (acknowledgment)**. O **ACK confirma o recebimento do SYN do cliente**, enquanto o SYN do servidor sinaliza sua própria solicitação de sincronização, repetindo o processo mas no sentido inverso. Este segmento inclui tanto o número de sequência do servidor quanto o número de reconhecimento, que é o número de sequência inicial (ISN) do cliente **incrementado de um**.

Após receber o SYN do servidor, finalimente cliente envia um segmento de ACK de volta ao servidor, confirmando o recebimento do SYN-ACK do servidor. Este ACK também inclui o número de sequência inicial do cliente (agora incrementado) e o número de sequência inicial do servidor incrementado de um. Com este passo, a conexão é estabelecida, e os dados podem começar a ser transmitidos de fato.

Uma vez que a conexão é estabelecida, os dados podem ser enviados entre o cliente e o servidor em segmentos TCP. Cada segmento enviado é numerado sequencialmente, o que permite ao receptor reordenar segmentos recebidos fora de ordem e detectar qualquer dado perdido. O receptor envia um ACK para cada segmento recebido, indicando o próximo número de sequência que espera receber. Este mecanismo garante a entrega confiável e a integridade dos dados.

Para encerrar uma conexão TCP, **tanto o cliente quanto o servidor devem fechar a sessão de sua respectiva direção**, usando um processo de **"four-way handshake"**, onde o cliente inicia o encerramento enviando um segmento com a flag **FIN** marcada, indicando que não tem mais dados para enviar, recebe um ACK do servidor com outra flag de FIN em sequência, indicando que o servidor também pode finalizar a conexão. O cliente finalmente envia o ultimo ACK e a conexão é terminada. 

Comparado ao UDP, o TCP/IP é mais lento, porém mais confiável. A maioria dos protocolos de comunicação utilizados entre serviços produtivos e componentes de software são construídos em cima do TCP para garantir sua confiabilidade de conexão. 

Usando o mesmo exemplo de entregadores de cartas, imagine que o protocolo TCP é aquele tipo de entregador que toca sua campainha e apenas entrega sua correspondencia em mãos mediante a assinatura, foto e confirmação. 

### TCP/IP ou UDP para construção de protocolos

Em resumo, a escolha entre UDP e TCP/IP depende das necessidades específicas da aplicação em termos de confiabilidade, ordem, integridade dos dados e eficiência. Enquanto o UDP é escolhido para aplicações que requerem entrega rápida e podem tolerar perdas, o TCP é usado em aplicações que necessitam de entrega confiável de dados. Essas variáveis são de extrema importância para construídos implementações que façam uso de conexões de rede. 

<br>

### TLS (Transport Layer Security)

TLS (Transport Layer Security) é um protocolo importante para a segurança na internet e redes comporativas, projetado para fornecer comunicação segura entre comunicações clientes-servidor. Ele é o sucessor do Secure Sockets Layer (SSL) e tem como principal objetivo garantir privacidade e integridade dos dados durante a transferência de informações entre sistemas de forma criptografada, utilizando criptografia para garantir que os dados transmitidos de um ponto a outro da rede não seja legível para terceiros.

O TLS funciona com base em um handshake e uma troca de chaves publicas e privadas durante o handshake, estabelecendo uma chave que será usada para criptografar os dados da sessão, e uma vez estabelecidade os dados podem trafegar de forma segura entre o cliente e o servidor. 

O processo começa com o "handshake" do TLS, onde cliente e servidor estabelecem os parâmetros da sessão especificando quais versões do protocolo e quais métodos de criptografia serão usados. Ao final da comunicação, a sessão pode ser encerrada de forma segura, com a opção de re-negociar parâmetros para futuras sessões de comunicação.

O TLS tem várias versões, com melhorias contínuas em segurança e desempenho. As mais utilizadas atualmente são TLS 1.2 e TLS 1.3, sendo esta última a mais recente e considerada a mais segura e eficiente, oferecendo melhorias em relação às versões anteriores, como o processo de handshake mais rápido.

<br>

## Protocolos de Aplicação

<br>

### HTTP/1, HTTP/2 e HTTP/3

Para conseguirmos olhar o protocolo HTTP (Hypertext Transfer Protocol) com a perspectiva de system design, é necessário entender como esse protocolo influencia a arquitetura, o desempenho, a escalabilidade e a segurança das aplicações modernas. Esse protocolo atua na **Layer 7 do Modelo OSI**, sendo tratado como **Camada de Aplicação**. Ele funciona majoritariamente utilizando **conexões TCP** para rastrear e tratar suas solicitações e funciona como a espinha dorsal da internet e da comunicação entre sistemas modernos. 

Os protocolos HTTP/2 e HTTP/3 são evoluções do protocolo HTTP. Eles foram desenvolvidos para **melhorar a eficiência da comunicação, reduzir a latência e otimizar o desempenho** em comparação com o HTTP/1.1 e o HTTP/1.0, que foi a versão dominante do protocolo nos sites e aplicações distribuídos pela internet e redes comporativas por muitos anos. 

O HTTP trabalha um formato de **solicitação-resposta**, entre **cliente-servidor**, onde o cliente **envia uma solicitação para o servidor, e o servidor responde**, basicamente. Este modelo é simples e extensível, permite fácil integração com diversas arquiteturas de aplicação, incluindo [sistemas monolíticos e microserviços](/monolitos-microservicos/). No entanto, a natureza síncrona do HTTP pode **introduzir latência, tempo de resposta** e exigir otimizações para melhorar o desempenho dessas solicitações.

<br>

#### HTTP/1.x

O HTTP 1.1 foi lançado em 1997, visando trazer algumas melhorias a nível de otimização ao HTTP 1.0 para se adaptar a nova forma de se usar a internet e aplicações web. Antes do HTTP/1.1, **cada requisição necessitava de uma nova conexão TCP**, o que era ineficiente. **O HTTP/1.1 introduziu conexões persistentes, permitindo que várias requisições e respostas fossem trocadas em uma única conexão.**

![HTTP/1.1](/assets/images/system-design/http1.1.png)

Nessa versão foi introduzido o conceito de **Pipelining**, que permitia que várias requisições fossem enviadas em sequência, sem esperar pela resposta da primeira, para melhorar a utilização da conexão. 

Ainda em termos de performance, a possibilidade caching mais eficaz, e gerenciamento de estado com cookies, reduziram significantenebte o número de requisições repetidas ao servidor.

Apesar dessas melhorias, o HTTP/1.1 ainda sofria de alguns problemas, como o "head-of-line blocking" (HOL blocking), onde a espera pela resposta da primeira requisição podia bloquear as respostas das seguintes, o que motivou a evolução do protocolo em mais alguns degraus. 

<br>

#### HTTP/2

Lançado em 2015, o HTTP/2 foi projetado para lidar com as limitações do HTTP/1.1 e melhorar o modo como os dados solicitados são formatados, priorizados e transporados, introduzindo algumas otimizações importantes que permitiram a** implementação de vários outros protocolos e formas de comunicação mais inteligente para enriquecer as possibilidades de System Design**. 

O conceito de multiplexação foi um dos mais importantes para a adoção e popularização do protocolo, permitindo que requests e responses sejam enviadas simultaneamente pela mesma conexão TCP, eliminando o problema do HOL blocking ainda presente na versão 1.1. 

Uma das features que podem ser consideradas no desenvolvimento de aplicações web junto ao HTTP/2 é a **possibilidade de priorização de requisições**, onde é possivel **indicar a prioridade das requisições**, para que os servidores que estão atendendo as requisições otimizem a entrega de recursos ao cliente em ordem de importância para o mesmo. 

A funcionalidade de **Server Push** permite que o servidor **envie recursos para o navegador antes que eles sejam solicitados explicitamente pelo cliente**, 


![HTTP/2](/assets/images/system-design/http2.png)

<br>

#### HTTP/3 (QUIC)

O HTTP/3 é a versão mais recente do protocolo, introduzindo mudanças interessantes e disruptivas na implementação do protocolo, principalmente camada de transporte (layer 4) ao **substituir o TCP pelo QUIC (Quick UDP Internet Connections), que por sua vez é baseado no protocolo UDP ao invés do TCP.**

Originalmente desenvolvido por Google e formalizado como parte do HTTP/3 pela Internet Engineering Task Force (IETF), o QUIC é um protocolo de transporte baseado em UDP que oferece várias vantagens em relação ao TCP, especialmente em termos de latência, segurança e eficiência de transmissão.

Essa mudança pode parecer assustadora, mas a implementação do QUIC conseguiu atingir objetivos de redução de latência entre conexão, mesmo **implementando handshakes criptografados e recuperação de erros**, assim como nas conexões TCP convencionais, mas sem sacrificar muita performance na comunicação. 

![HTTP/3](/assets/images/system-design/http3.png)

O QUIC reduz a latência de conexão através de um processo de handshake criptografado mais eficiente, diferentemente do TCP, que requer uma série de trocas (o three-way handshake) antes de estabelecer uma conexão segura, o QUIC combina o **handshake do protocolo de controle de transmissão com o do TLS, reduzindo o número de viagens necessárias para estabelecer uma conexão**. A Multiplexação introduzida na HTTP/2 também foi melhorada, fazendo com que ela realmente conseguisse ser completada sem bloqueio, podendo trafegar os dados e arquivos dentro de uma conexão UDP ao invés de uma TCP. 

Essa abordagem do HTTP/3 com o QUIC podem ser considados em vários tipos de aplicações diferentes, particularmente aquelas que requerem **transmissões de dados rápidas e confiáveis**, como **streaming de vídeo**, **jogos online** e **comunicações em tempo real**. Uma característica única do QUIC é sua capacidade de manter uma conexão ativa mesmo quando um usuário muda de rede (por exemplo, de Wi-Fi para dados móveis). Isso é possível porque o QUIC é **identificado por uma conexão ID em vez de por endereços IP e portas**, permitindo que a sessão continue sem interrupção. 

#### Estruturas e Componentes de Um Requisição e Resposta HTTP

Compreender conceitualmente a estrutura de uma requisição HTTP pode ser um conhecimento extremamente valioso na arquitetura de sistemas. Por mais que seja simples e presente na vida de grande parte de engenheiros e arquitetos, saber destrinchar suas partes e entender conceitualmente cada uma delas pode abrir o leque para possibilidades de troubleshooting, segurança e performance. Vamos detalhar cada um dos principais componentes, sendo eles o Body, Headers, Cookies e Status Codes. 

##### Body

O Body, ou corpo de uma requisição ou resposta HTTP contém **os dados enviados ou recebidos entre o cliente e o servidor**. Em uma requisição HTTP, o body pode conter informações necessárias para que o servidor execute alguma função específica , como os detalhes de um formulário enviado por um usuário de uma página, um payload em JSON contendo informações de uma compra e até mesmo imagens, arquivos e mídias. Na resposta, o body geralmente contém o recurso solicitado pelo cliente, como um documento HTML, um objeto JSON, dados para um relatório, ou qualquer outro formato de dados definido pelos headers de `Content-Type`.

##### Headers 

Os Headers ou Cabeçalhos HTTP são componentes-chave tanto na requisição quanto na resposta, fornecendo informações essenciais sobre a transação HTTP em si. Eles podem indicar o tipo de conteúdo do body utilizando o `Content-Type`, a autenticação necessária com o header `Authorization`, instruções de cache  usando os derivados do `Cache-Control`, entre outros metadados. Os headers desempenham um papel importante na configuração e no controle do comportamento da comunicação HTTP, permitindo uma interação mais rica e segura entre cliente e servidor devido ao acumulo de responsabilidades informativas. Nele por exemplo são declarados qual o formato de dados estão sendo enviados, que estão sendo devolvidos, encode, tamanho do payload e várias outras informações importante . 
 
##### Cookies 

Cookies são dados que o servidor envia para o navegador do usuário, que o navegador armazena e envia de volta com subsequente requisições para o mesmo servidor. Eles são usados principalmente para **manter o estado da sessão entre as requisições**, como autenticação do usuário ou personalização. Os cookies são transmitidos através dos headers de requisição e resposta, permitindo que o servidor mantenha um registro do estado do cliente sem a necessidade de reautenticação a cada solicitação.

##### Status Codes

Os Status Codes (Códigos de Status) HTTP são números de três dígitos enviados pelo servidor em resposta a uma requisição HTTP, indicando o resultado da solicitação. Eles são essenciais para o REST, pois informam ao cliente sobre o sucesso ou falha da operação solicitada. Alguns dos mais comuns incluem:

| Código    | Classe | Descrição    |
|-----------|--------|--------------|
| 1xx       | Informativo           | Respostas provisórias que indicam que o servidor recebeu a solicitação e o processo está em andamento.                  | 
| 2xx       | Sucesso               | Indica que a solicitação foi recebida, compreendida e aceita com sucesso. |
| 3xx       | Redirecionamento      | Informa que ações adicionais precisam ser tomadas para completar a solicitação, geralmente envolvendo redirecionamento para outro URI. |
| 4xx       | Erro do Cliente       | Significa que houve um erro na solicitação, impedindo o servidor de processá-la. Indica erros vindos da requisição do cliente, como parâmetros inválidos, requisições impossíveis de serem concluídas devido a regras de negócio da aplicação ou URIs inexistentes. |
| 5xx       | Erro do Servidor      | Indica que o servidor falhou ao tentar processar uma solicitação válida. Indica erros vindos do processo interno, uma falha inesperada entre comunicações, sobrecarga de processamento, excedência do tempo limite da solicitação ou falha entre dependências de serviços. |

<br>

## Protocolos de Mensageria

### MQTT (Message Queuing Telemetry Transport)

### AMQP (Advanced Message Queuing Protocol)

### Comunicação Over-TCP




### Referências

[OSI-Model - Open Systems Interconnection model](https://osi-model.com/session-layer/)

[Livro: Redes de Computadores - Andrew Tanenbaum](https://www.amazon.com.br/Redes-Computadores-Andrew-Tanenbaum/dp/8582605609)

[Introdução a Redes de Computadores](https://dev.to/bl4cktux89/introducao-a-redes-de-computadores-4nm4)

[What is Transmission Control Protocol (TCP)?](https://www.javatpoint.com/tcp)

[Explicação do handshake de três vias via TCP/IP](https://learn.microsoft.com/pt-br/troubleshoot/windows-server/networking/three-way-handshake-via-tcpip)

[Push do servidor HTTP/2](https://imasters.com.br/devsecops/push-do-servidor-http2)

[Examining HTTP/3 usage one year on](https://blog.cloudflare.com/http3-usage-one-year-on)

[HTTP/1 vs HTTP/2 vs HTTP/3](https://dev.to/accreditly/http1-vs-http2-vs-http3-2k1c)

[HTTP 1.1 vs. HTTP 2 vs. HTTP 3: Key Differences](https://www.javacodegeeks.com/2023/03/http-1-1-vs-http-2-vs-http-3-key-differences.html)

[O que é um certificado SSL/TLS?](https://aws.amazon.com/pt/what-is/ssl-certificate/)

[Qual é a diferença entre SSL e TLS?](https://aws.amazon.com/pt/compare/the-difference-between-ssl-and-tls/)

[HTTP Status](https://www.httpstatus.com.br/)

[HTTP Cats](https://http.cat/)