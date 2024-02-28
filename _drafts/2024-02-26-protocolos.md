---
layout: post
image: assets/images/system-design/protocolos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Protocolos e Padrões de Comunicação
---


<br>

# Modelo OSI 


O **Modelo OSI** (*Open Systems Interconnection*) é um modelo conceitual desenvolvido pela **International Organization for Standardization** (*ISO*) na década de 1980, com o objetivo de padronizar e catalogar as funções de um sistema de telecomunicações, componentes de rede e protocolos. O modelo é em dia zero, é uma abstração e tem uma fundamentação acadêmica, dando pilares para construção e entendimento de redes de alta disponibilidade, especificações de componentes de rede e criação e throubleshooting de protocolos de comunicação e conexões entre serviços. 

![OSI Model](/assets/images/system-design/osi.png)


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


## Protocolos de Aplicação

### HTTP/1, HTTP/2 e HTTP/3

Para conseguirmos olhar o protocolo HTTP (Hypertext Transfer Protocol) com a perspectiva de system design, é necessário entender como esse protocolo influencia a arquitetura, o desempenho, a escalabilidade e a segurança das aplicações modernas. Esse protocolo atua na **Layer 7 do Modelo OSI**, sendo tratado como **Camada de Aplicação**. Ele funciona majoritariamente utilizando **conexões TCP** para rastrear e tratar suas solicitações e funciona como a espinha dorsal da internet e da comunicação entre sistemas modernos. 

Os protocolos HTTP/2 e HTTP/3 são evoluções do protocolo HTTP. Eles foram desenvolvidos para **melhorar a eficiência da comunicação, reduzir a latência e otimizar o desempenho** em comparação com o HTTP/1.1 e o HTTP/1.0, que foi a versão dominante do protocolo nos sites e aplicações distribuídos pela internet e redes comporativas por muitos anos. 

O HTTP trabalha um formato de **solicitação-resposta**, entre **cliente-servidor**, onde o cliente **envia uma solicitação para o servidor, e o servidor responde**, basicamente. Este modelo é simples e extensível, permite fácil integração com diversas arquiteturas de aplicação, incluindo [sistemas monolíticos e microserviços](/monolitos-microservicos/). No entanto, a natureza síncrona do HTTP pode **introduzir latência, tempo de resposta** e exigir otimizações para melhorar o desempenho dessas solicitações.

#### HTTP/1.x

O HTTP 1.1 foi lançado em 1997, visando trazer algumas melhorias a nível de otimização ao HTTP 1.0 para se adaptar a nova forma de se usar a internet e aplicações web. Antes do HTTP/1.1, **cada requisição necessitava de uma nova conexão TCP**, o que era ineficiente. **O HTTP/1.1 introduziu conexões persistentes, permitindo que várias requisições e respostas fossem trocadas em uma única conexão.**

![HTTP/1.1](/assets/images/system-design/http1.1.png)

Nessa versão foi introduzido o conceito de **Pipelining**, que permitia que várias requisições fossem enviadas em sequência, sem esperar pela resposta da primeira, para melhorar a utilização da conexão. 

Ainda em termos de performance, a possibilidade caching mais eficaz, e gerenciamento de estado com cookies, reduziram significantenebte o número de requisições repetidas ao servidor.

Apesar dessas melhorias, o HTTP/1.1 ainda sofria de alguns problemas, como o "head-of-line blocking" (HOL blocking), onde a espera pela resposta da primeira requisição podia bloquear as respostas das seguintes, o que motivou a evolução do protocolo em mais alguns degraus. 


#### HTTP/2

Lançado em 2015, o HTTP/2 foi projetado para lidar com as limitações do HTTP/1.1 e melhorar o modo como os dados solicitados são formatados, priorizados e transporados, introduzindo algumas otimizações importantes que permitiram a** implementação de vários outros protocolos e formas de comunicação mais inteligente para enriquecer as possibilidades de System Design**. 

O conceito de multiplexação foi um dos mais importantes para a adoção e popularização do protocolo, permitindo que requests e responses sejam enviadas simultaneamente pela mesma conexão TCP, eliminando o problema do HOL blocking ainda presente na versão 1.1. 

Uma das features que podem ser consideradas no desenvolvimento de aplicações web junto ao HTTP/2 é a **possibilidade de priorização de requisições**, onde é possivel **indicar a prioridade das requisições**, para que os servidores que estão atendendo as requisições otimizem a entrega de recursos ao cliente em ordem de importância para o mesmo. 

A funcionalidade de **Server Push** permite que o servidor **envie recursos para o navegador antes que eles sejam solicitados explicitamente pelo cliente**, 


![HTTP/2](/assets/images/system-design/http2.png)


#### HTTP/3 (QUIC)

O HTTP/3 é a versão mais recente do protocolo, introduzindo mudanças interessantes e disruptivas na implementação do protocolo, principalmente camada de transporte (layer 4) ao **substituir o TCP pelo QUIC (Quick UDP Internet Connections), que por sua vez é baseado no protocolo UDP ao invés do TCP.**

Originalmente desenvolvido por Google e formalizado como parte do HTTP/3 pela Internet Engineering Task Force (IETF), o QUIC é um protocolo de transporte baseado em UDP que oferece várias vantagens em relação ao TCP, especialmente em termos de latência, segurança e eficiência de transmissão.

Essa mudança pode parecer assustadora, mas a implementação do QUIC conseguiu atingir objetivos de redução de latência entre conexão, mesmo **implementando handshakes criptografados e recuperação de erros**, assim como nas conexões TCP convencionais, mas sem sacrificar muita performance na comunicação. 

![HTTP/3](/assets/images/system-design/http3.png)

O QUIC reduz a latência de conexão através de um processo de handshake criptografado mais eficiente, diferentemente do TCP, que requer uma série de trocas (o three-way handshake) antes de estabelecer uma conexão segura, o QUIC combina o **handshake do protocolo de controle de transmissão com o do TLS, reduzindo o número de viagens necessárias para estabelecer uma conexão**. A Multiplexação introduzida na HTTP/2 também foi melhorada, fazendo com que ela realmente conseguisse ser completada sem bloqueio, podendo trafegar os dados e arquivos dentro de uma conexão UDP ao invés de uma TCP. 

Essa abordagem do HTTP/3 com o QUIC podem ser considados em vários tipos de aplicações diferentes, particularmente aquelas que requerem **transmissões de dados rápidas e confiáveis**, como **streaming de vídeo**, **jogos online** e **comunicações em tempo real**. Uma característica única do QUIC é sua capacidade de manter uma conexão ativa mesmo quando um usuário muda de rede (por exemplo, de Wi-Fi para dados móveis). Isso é possível porque o QUIC é **identificado por uma conexão ID em vez de por endereços IP e portas**, permitindo que a sessão continue sem interrupção. 

#### Estruturas e Componentes de Um Requisição e Resposta HTTP

##### Body

##### Headers 

##### Cookies 

##### Status Codes

| Código    | Classe | Descrição    |
|-----------|--------|--------------|
| 1xx       | Informativo           | Respostas provisórias que indicam que o servidor recebeu a solicitação e o processo está em andamento.                  | 
| 2xx       | Sucesso               | Indica que a solicitação foi recebida, compreendida e aceita com sucesso. |
| 3xx       | Redirecionamento      | Informa que ações adicionais precisam ser tomadas para completar a solicitação, geralmente envolvendo redirecionamento para outro URI. |
| 4xx       | Erro do Cliente       | Significa que houve um erro na solicitação, impedindo o servidor de processá-la. Indica erros vindos da requisição do cliente, como parâmetros inválidos, requisições impossíveis de serem concluídas devido a regras de negócio da aplicação ou URIs inexistentes. |
| 5xx       | Erro do Servidor      | Indica que o servidor falhou ao tentar processar uma solicitação válida. Indica erros vindos do processo interno, uma falha inesperada entre comunicações, sobrecarga de processamento, excedência do tempo limite da solicitação ou falha entre dependências de serviços. |


* **1xx (Informativo)**: Respostas provisórias que indicam que o servidor recebeu a solicitação e o processo está em andamento.
* **2xx (Sucesso)**: Indica que a solicitação foi recebida, compreendida e aceita com sucesso.
* **3xx (Redirecionamento)**: Informa que ações adicionais precisam ser tomadas para completar a solicitação, geralmente envolvendo redirecionamento para outro URI.
* **4xx (Erro do Cliente)**: Significa que houve um erro na solicitação, impedindo o servidor de processá-la. Indica erros vindos da requisição do cliente, como parametros inválidos, requisições impossíveis de serem concluída devido a regras de negócio da aplicação ou URI's inexistentes. 
* **5xx (Erro do Servidor)**: Indica que o servidor falhou ao tentar processar uma solicitação válida. Indica erros vindos do processo interno, uma falha inexperada entre comunicações, sobrecarga de processamento, excedencia do tempo limite da solicitação ou falha entre dependencias de serviços. 


### REST (Representational State Transfer)

O **REST**, ou **Representational State Transfer**, é um estilo **arquitetônico para sistemas distribuídos** que presa pela simplicidade da comunicação entre componentes na internet ou em redes internas de microserviços. Definido por Roy Fielding em sua tese de doutorado em 2000, REST não é um protocolo ou padrão, mas um conjunto de princípios arquitetônicos usados para projetar sistemas distribuídos escaláveis, confiáveis e de fácil manutenção. Os serviços que seguem os princípios REST são conhecidos como RESTful.

O REST é construído usando referências e recursos do protocolo HTTP, definindo papeis e responsabilidades de cliente-servidor e busca estabelecer uma interface de um cliente com os dados e ações de um sistema. 

Ele utiliza métodos HTTP para definir ações, como **GET, POST, PUT, DELETE e PATCH**, para realizar operações CRUD **(Criar, Ler, Atualizar, Deletar)** em recursos identificados por URI's. Esses recursos são representações de entidades ou objetos do domínio da aplicação.

#### Utilização de Métodos HTTP para Representar Ações

Os métodos HTTP, também conhecidos como "verbos", definem ações que podem ser realizadas sobre os recursos. Eles permitem uma interação semântica com os recursos, onde cada método tem um propósito específico:

* **GET**: Utilizado para **recuperar a representação de um recurso sem modificá-lo**. É seguro e **idempotente**, o que significa que várias **requisições idênticas devem ter o mesmo efeito que uma única requisição.**

* **POST**: Empregado para **criar um novo recurso**. **Não é idempotente**, pois realizar várias requisições POST pode criar múltiplos recursos.
    
* **PUT:** Utilizado para **atualizar um recurso existente ou criar um novo se ele não existir**, executado no URI especificado. **É idempotente**, então **múltiplas requisições idênticas terão o mesmo efeito sobre a entidade**.
    
* **DELETE**: Empregado para **remover um recurso**. É **idempotente, pois deletar um recurso várias vezes tem o mesmo efeito que deletá-lo uma única vez**.
    
* **PATCH**: Utilizado para **aplicar atualizações parciais a um recurso**. Ao contrário do PUT, que substitui o recurso inteiro, o **PATCH modifica apenas as partes especificadas**. É idempotente, pois a execução sob o mesmo recurso tende a gerar sempre o mesmo efeito e gerar o mesmo resultado.

#### Métodos HTTP nas URI's e Entidades

As URIs são utilizadas para identificar os recursos de forma única. Em uma API RESTful, as URIs são projetadas para serem intuitivas e descritivas, facilitando o entendimento e a navegação pelos recursos disponíveis. A estrutura de uma URI em REST reflete a organização dos recursos e suas relações.

As URIs quando olhadas no modelo REST, devem se referir a recursos e entidades,  e não às ações que serão realizadas diretamentesobre eles. Por exemplo, o path `/users` para acessar recursos do usuário combinado com o método `GET`, e não um basepath imperativo como `/getUsers`.

A URI de determinadas entidades devem refletir a estrutura hierárquica dos recursos. Por exemplo, `/users/123/posts` pode representar os posts do usuário com ID 123.

Devem se utilizar querystrings como parametros de consulta para filtrar recursos ou modificar a saída de uma chamada REST. Por exemplo, `/users?active=true` para filtrar apenas usuários ativos ou `/users/123/posts?tag=system-design` para filtrar os posts do usuário com a tag `system-design`. 

Considerando uma API para um portal de notícias ou blog, aqui estão exemplos de como os métodos HTTP e as URIs podem ser utilizados para interagir com os recursos:

* Listar todos os posts: **GET** `/posts`
* Obter um post específico: **GET** `/posts/1`
* Criar um novo post: **POST** `/posts`
* Atualizar um post existente: **PUT** `/posts/1`
* Deletar um post: **DELETE** `/posts/1`
* Atualizar parte de um post: **PATCH** `/posts/1`

#### Status Codes de Resposta e Padrões do REST

Os códigos de status de resposta HTTP são recursos importantes para implementacões RESTful, pois são usados como convenção para indicar informações de estado das respostas de uma  solicitação. Ele abre o leque das classes dando funcionalidades e representatividade a elas perante uma solicitação.  

Os status codes mais utilizados em implementações RESTFul são os seguintes: 

* **200 OK**: A solicitação foi bem-sucedida. Usado para respostas GET, PUT ou POST que não resultam em criação.
* **201 Created**: A solicitação resultou na criação de um novo recurso. Frequentemente usado em respostas a solicitações POST.
* **202 Accepted**: Este código de status indica que a solicitação foi aceita para processamento, mas o processamento ainda não foi concluído. É utilizado em operações assíncronas, onde a solicitação foi iniciada com sucesso, mas sua conclusão ocorrerá em algum momento no futuro. 
* **204 No Content**: A solicitação foi bem-sucedida, mas não há conteúdo para enviar na resposta. Comum em respostas DELETE.
* **400 Bad Request**: A solicitação não pode ser processada devido a erro do cliente (sintaxe, formato).
* **401 Unauthorized**: Indica que a autenticação é necessária ou falhou.
* **403 Forbidden**: O servidor entendeu a solicitação, mas se recusa a autorizá-la.
* **404 Not Found**: O recurso solicitado não foi encontrado.
* **405 Method Not Allowed**: O método solicitado é conhecido pelo servidor, mas foi desativado e não pode ser usado.
* **500 Internal Server Error**: Um erro genérico indicando uma falha do servidor.
* **503 Service Unavailable:** O servidor não está pronto para lidar com a solicitação, geralmente devido a manutenção ou sobrecarga.
* **504 Gateway Timeout:** Este código de status é utilizado quando um servidor que atua como gateway ou proxy não recebe uma resposta a tempo de um servidor upstream ao qual fez uma solicitação.

#### Comunicação Stateless 

No REST, cada requisição do cliente para o servidor deve conter todas as informações necessárias para entender e completar a requisição. O servidor não armazena nenhum estado da sessão do cliente. 

#### Camadas 

A arquitetura em camadas permite que intermediários (como proxies e gateways) facilitem ou melhorem a comunicação entre o cliente e o servidor, promovendo a segurança, o balanceamento de carga e a capacidade de cache. Combinando o conceito e viabilidade de camadas com o padrão stateless, o padrão se torna muito poderoso e escalável. 

#### Cache 

As respostas do servidor devem ser explícitas quanto à sua cacheabilidade para evitar a reutilização de dados obsoletos ou inapropriados, melhorando a eficiência e a escalabilidade.

### RPC (Remote Procedure Call)

### gRPC (google Remote Procedure Call)

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

[Qual é a diferença entre gRPC e REST?](https://aws.amazon.com/pt/compare/the-difference-between-grpc-and-rest/)

[HTTP Status](https://www.httpstatus.com.br/)

[HTTP Cats](https://http.cat/)