---
layout: post
image: assets/images/system-design/protocolos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Protocolos de Comunicação
---


<br>

# Modelo OSI 

![OSI Model](/assets/images/system-design/osi.png)

O **Modelo OSI** (*Open Systems Interconnection*) é um modelo conceitual desenvolvido pela **International Organization for Standardization** (*ISO*) na década de 1980, com o objetivo de padronizar e catalogar as funções de um sistema de telecomunicações, componentes de rede e protocolos. O modelo é em dia zero, é uma abstração e tem uma fundamentação acadêmica, dando pilares para construção e entendimento de redes de alta disponibilidade, especificações de componentes de rede e criação e throubleshooting de protocolos de comunicação e conexões entre serviços. 

O Modelo OSI é dividido em sete camadas, cada uma com funções específicas:

### Layer 1: Física

A primeira camada descrita no modelo OSI é pesponsável pela transmissão e recepção de dados brutos não tratados sobre um meio físico. Ela define as especificações elétricas, mecânicas, procedurais e funcionais para ativar, manter e desativar conexões físicas. Nessa camada podem ser classificados **cabos de rede**, **cabos de cobre**, **fibra óptica** e **aplicações Wi-Fi**, basicamente todos os cabeamentos, equipamentos e roteadores que são meios de entrada e saída físicos para a rede. 

### Layer 2: Enlace 

A camada de enlace fornece transferência de dados confiável entre dois componentes adjacentes. Trata-se da detecção e possivelmente da correção de erros que podem ocorrer no nível físico. Nessa camada estão implementações de Ethernet para a transmissão de dados dentro de uma mesma rede local (LAN), PPP (Point-to-Point Protocol) usado para estabelecer uma conexão direta entre dois nós de rede e o MAC (Media Access Control), ou MAC Address, que permite controle de acesso e identificação dos membros de uma rede, identificando dispositivos de forma única através de seus endereços físicos.

### Layer 3: Rede

Essa camada é responsável por controlar a operação da sub-rede, decidindo como os dados serão encaminhados com base no endereço lógico dos dispositivos e nas condições das redes que sejam acessíveis entre si, utilizando rotas, regras e encaminhamento inteligente. Essa camada usa roteamento para enviar pacotes através de uma ou várias redes. Nele podemos encontrar a implementação do IP (Internet Protocol) de fato, que garante o endereçamento e roteamento. O protocolo IP e á base da internet como conhecemos hoje fornecendo endereçamento a partir de endereços IPV4 e IPV6.  Essa camada exige a especificação de uma origem e um destino para completar sua função de endereçamento e encaminhamento.


### Layer 4: Transporte

Trabalha na transferência de dados entre sistemas finais de fato, ou hosts, com a garantia de que os dados cheguem sem erros e em sequência. Essa camada gerencia o controle de fluxo, a correção de erros, e a entrega de segmentos dos pacotes. Aqui podemos encontrar implementações do protocolo TCP (Transmission Control Protocol) que fornece através de uma conexão, formas de entregar os pacotes sem erro, sem corrupção e na ordem correta que foram enviados. Ao lado podemos encontrar também o protocolo UDP (User Datagram Protocol) que fornece uma possibilidade de conexão muito rápida comparada ao TCP, porém menos confiável, sem garantia de entrega, ordem ou integridade dos dados.

### Layer 5: Sessão 

Essa sessão é responsável por iniciar e finalizar as conexões entre os hosts. Nela são estabelecidas funções que iniciam, gerenciam e terminam conexões entre aplicações. Usado frequentemente em serviços que tenham conexões autenticadas de longa duração. 

### Layer 6: Apresentação 

A camada de apresentação traduz os dados do formato da rede para o formato que a aplicação aceita e e compreende. Essa camada é responsável pela criptografia, compressão e conversão de dados. Ela poderia ser renomeada fácilmente para "Camada de Tradução".  Aqui temos a implementação criptografica do SSL/TLS (Secure Sockets Layer / Transport Layer Security, que são protocolos de segurança que criptografam dados em uma sessão ou conexão, protocolos de e-mail e formatos de imagens como JPEG, GIF, PNG .

### Layer 7: Aplicação 

Essa camada é onde fornecemos serviços de rede para aplicações do usuário, transferência de arquivos e conexões mais proximas do desenvolvimento de software. É a camada mais próxima do usuário final, servindo como a interface entre o software de aplicação e as funções de rede. Aqui podemos interpretar também como a camada de final de comunicação entre usuário e aplicação. Aqui temos finalmente as implementações de HTTP e HTTPS (Hypertext Transfer Protocol / HTTP Secure) que hoje é o protocolo padrão de transferencia de dados e documentos na internet, onde são construidas e executadas chamadas REST, transferencia de assets, arquivos e paginas da Web, implementações de Websockets e gRPC. Também podemos classificar a implementação de sessões de SSH (Secure Shell), transferencias FTP (File Transfer Protocol) entre outras. 

<br>

# Os Protocolos de Comunicação


<br>

## Protocolos base

Para entendermos no detalhe protocolos e tecnologias de comunicação mais modernas, precisamos revisitar os protocolos de rede mais baixo nível sob quais os mesmos são construídos. Antes de entendermos como protocolos como HTTP/2, HTTP/3, gRPC, AMPQ funcionam, é necessário entender os mecanismos de conexão que possibilitaram os mesmos serem construídos, sendo os eles o TCP/IP e UDP em sua maior importância.

### UDP (User Datagram Protocol)

O UDP, ou User Datagram Protocol, é um protocolo extremamente simples da camada de transporte (layer 4) que permite a transmissão de dados sem necessidade de uma conexão e de forma não confiável entre hosts na rede. Comparado aos outros protocolos de rede o UDP, apesar de não ser confiável em nenhuma parte de seu processo, é extremamente performático em termos de velocidade, pois não se propõe a ter a responsábilidade de abrir, manter, gerenciar e encerrar uma conexão. Nos protocolos que fazem uso de UDP para trafegar dados simplesmente enviam seus pacotes para o destinatário sem verificar se eles foram recebidos e checados em sua integridade. 

![UDP](/assets/images/system-design/udp.png)

O UDP se baseia em Datagramas para envio de pacotes, que são pacotes de dados totalmente independentes que não precisem ser entregues em ordens ou priotidades específicas e que não são dependentes de confirmação. 

Implementações de arquiteturas e protocolos que tendem a enviar e receber dados próximos de uma complexidade realtime e podem suportar corrupção e perda de dados, tendem a serem construídos sobre o protocolo UDP. 

Um paralelo com um entregador de cartas, o protocolo UDP pode ser análogo a entregadores que simplesmente deixam sua correspondência debaixo do seu portão, calçada ou janela e seguem seu trabalho para as próximas residências, sem confirmar se você realmente terá aquilo ela mãos em algum momento. 

### TCP/IP (Transmission Control Protocol/Internet Protocol)

O protocolo TCP/IP, ou Transmission Control Protocol/Internet Protocol, ao contrário do UDP, é um conjunto de protocolos orientados a conexões. Ele se encarrega desde o primeiro momento a abrir, manter, checar a saúde e encerrar a conexão, com o objetivo de garantir que tudo que foi enviado chegou de forma integra e confiável ao seu destino exatamente na ordem que faça sentido. Ele também atua na camada de transporte (layer 4), e antes de enviar qualquer pacote entre os hosts, ele estabelece uma conexão e utiliza mecanismos de controle de erro e fluxo, para garantir que tudo que foi enviado chegue na ordem correta e sem corrupção. 


![TCP](/assets/images/system-design/tcp.png)

O modelo TCP utiliza de termos como **ACK, SYN, SYN-ACK** e **FIN** para exemplificar os comportamentos de como funciona a gestão das suas conexões. Existem algumas outras Flag como **URG**, **PSH** e **RST**, porém vamos nos atentar a um fluxo simplificado para nivelarmos como uma conexão TCP funciona. 

Todas as ações que ocorrem dentro do ciclo de vida de uma conexão TCP são confirmadas através de **ACKS (Acknowledgment)**.

Para inicio da conexão TCP, é necessário uma série de confirmações entre cliente e servidor para garantir sequencialidade e confiabilidade. Esse processo é conhecido somo "three way handshake", exemplificado pela sequencia de três ações **SYN, SYN-ACK e ACK**. Por isso, three way handshake. 

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

## Protocolos de Aplicação

### HTTP/2 e HTTP/3

### QUIC 

### TLS (Transport Layer Security)

### RPC

### gRPC

### Websockets


<br>

## Protocolos de Mensageria

### MQTT (Message Queuing Telemetry Transport)

### AMQP (Advanced Message Queuing Protocol)

### Comunicação Over-TCP


<br>

# Protocolos em Arquiteturas em Operações Sincronas e Assincronas


<br>

# Considerações de Segurança


### Referências

[OSI-Model - Open Systems Interconnection model](https://osi-model.com/session-layer/)

[Introdução a Redes de Computadores](https://dev.to/bl4cktux89/introducao-a-redes-de-computadores-4nm4)

[What is Transmission Control Protocol (TCP)?](https://www.javatpoint.com/tcp)

[Explicação do handshake de três vias via TCP/IP](https://learn.microsoft.com/pt-br/troubleshoot/windows-server/networking/three-way-handshake-via-tcpip)
