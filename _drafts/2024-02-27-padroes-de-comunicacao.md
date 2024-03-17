---
layout: post
image: assets/images/system-design/sincrono.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Padrões de Comunicação Sincronos
---

Este texto é uma continuação direta do capitulo onde falamos sobre [Protocolos e Comunicação de Redes](). A ideia é seguir com os conceitos direcionados anteriormente para aplicá-los em diferentes tipos de padrões de comunicação direcionados na contrução de software em arquiteturas modernas e distribuídas. Nesse capítulo iremos falar sobre alguns padrões que podemos utilizar para **construção de chamadas sincronas entre serviços**, aproveitando os conhecimentos ofertados quando abordamos sobre o Protocolo HTTP, TCP/IP e UDP para detalhar conceitualmente com a visão de System Design outras tecnologias e padrões como o **Padrão REST, gRPC, Websockets e GraphQL**. 

# Definindo Comunicações Sincronas

Uma comunicação síncrona, de forma bem direta e simples, é um padrão de comunicação utilizados em sistemas distribuídos, ou não, onde o **cliente espera por uma resposta do servidor antes de prosseguir a execução de outras tarefas**. Por exemplo, em um ambiente de microserviços de um domínio de logística, um sistema que estima o preço de um frete precisa recuperar em um outro sistema responsável pelo cadastral de seus clientes as informações de endereço antes de prosseguir com o calculo de fato. 

Este modelo de comunicação é caracterizado por sua natureza **"bloqueante"**, significando que o **processo que inicia a chamada fica "bloqueado" até que a operação e a comunicação com o servidor seja concluída**, significando uma "espera ativa" entre os dois componentes. Em outras palavras, a comunicação síncrona envolve uma interação **direta e imediata entre as partes**, facilitando um "diálogo" que precise ser concluído fim-a-fim em tempo de execução de uma tarefa.

Esse padrão é muito bem recebido onde a **consistência dos dados é de extrema importância**, pois as operações podem ser facilmente feitas em uma **sequência específica**, além de ser muito mais simples e intuitiva em quesitos de entendimento e implementação. 

Em quesito de desvantagens, a implementação de uma comunicação sincrona pode **limitar a escalabilidade do sistema**, uma vez que o bloqueio durante a espera por respostas pode **reduzir a capacidade de processamento paralelo**, além de afetar performance em cadeia, onde o mau funcionamento constante ou temporário de uma dependência específica entre uma série de chamadas pode acabar aumentando o tempo de resposta e processamento. O ponto mais crítico é que a indisponibilidade de um serviço que é dependente de um processo bloqueante pode i**nvariávelmente degradar a disponibilidade geral de uma cadeia de processos**. 

Nesse sentido, por mais simples que sejam a construção e manutenção de chaamdas sincronas, é necessário o cuidado com questões de retentativas, timeouts e outras estratégias de resiliência cosntruída de forma pragmática entre cliente-servidor. 

<br>

# REST (Representational State Transfer)

O **REST**, ou **Representational State Transfer**, é um estilo **arquitetônico para sistemas distribuídos** que presa pela simplicidade da comunicação entre componentes na internet ou em redes internas de microserviços. Definido por **Roy Fielding** em sua tese de doutorado em 2000, REST não é um protocolo ou padrão, mas um conjunto de princípios arquitetônicos usados para projetar sistemas distribuídos escaláveis, confiáveis e de fácil manutenção. **Os serviços que seguem os princípios REST são conhecidos como RESTful em API's.**

O REST é construído usando referências e recursos do **protocolo HTTP**, definindo papeis e responsabilidades de cliente-servidor e busca **estabelecer uma interface de um cliente com os dados e ações de um sistema** de forma intuitiva. 

Ele utiliza métodos HTTP para definir ações, como **GET, POST, PUT, DELETE e PATCH**, para realizar operações CRUD **(Criar, Ler, Atualizar, Deletar)** em recursos identificados por URI's. Esses recursos são representações de entidades ou objetos do domínio da aplicação.

#### Utilização de Métodos HTTP para Representar Ações

Os métodos HTTP, também conhecidos como "verbos", definem ações que podem ser realizadas sobre os recursos. Eles permitem uma interação semântica com os recursos, onde cada método tem um propósito específico:

| Método  | Descrição                                                                                                                                 | Idempotência |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| GET     | Utilizado para **recuperar a representação de um recurso sem modificá-lo**. É seguro e **idempotente**, o que significa que várias **requisições idênticas devem ter o mesmo efeito que uma única requisição.** | Sim          |
| POST    | Empregado para **criar um novo recurso**. **Não é idempotente**, pois realizar várias requisições POST pode criar múltiplos recursos.                                                              | Não          |
| PUT     | Utilizado para **atualizar um recurso existente ou criar um novo se ele não existir**, no URI especificado. **É idempotente**, então **múltiplas requisições idênticas terão o mesmo efeito sobre a entidade**.   | Sim          |
| DELETE  | Empregado para **remover um recurso**. É **idempotente, pois deletar um recurso várias vezes tem o mesmo efeito que deletá-lo uma única vez**.                                                      | Sim          |
| PATCH   | Utilizado para **aplicar atualizações parciais a um recurso**. Ao contrário do PUT, que substitui o recurso inteiro, o **PATCH modifica apenas as partes especificadas**. É idempotente, pois a execução sob o mesmo recurso tende a gerar sempre o mesmo efeito e gerar o mesmo resultado. | Sim          |

<br>

#### Métodos HTTP nas URI's e Entidades

As URIs são utilizadas para identificar os recursos de forma única. Em uma API RESTful, as URIs são projetadas para serem intuitivas e descritivas, facilitando o entendimento e a navegação pelos recursos disponíveis. A estrutura de uma URI em REST reflete a organização dos recursos e suas relações.

As URIs quando olhadas no modelo REST, devem se referir a recursos e entidades,  e não às ações que serão realizadas diretamentesobre eles. Por exemplo, o path `/users` para acessar recursos do usuário combinado com o método `GET`, e não um basepath imperativo como `/getUsers`.

A URI de determinadas entidades devem refletir a estrutura hierárquica dos recursos. Por exemplo, `/users/123/posts` pode representar os posts do usuário com ID 123.

Devem se utilizar querystrings como parametros de consulta para filtrar recursos ou modificar a saída de uma chamada REST. Por exemplo, `/users?active=true` para filtrar apenas usuários ativos ou `/users/123/posts?tag=system-design` para filtrar os posts do usuário com a tag `system-design`. 

Considerando uma API para um portal de notícias ou blog, aqui estão exemplos de como os métodos HTTP e as URIs podem ser utilizados para interagir com os recursos:

| Ação                          | Método | Endpoint     |
|-------------------------------|--------|--------------|
| Listar todos os posts         | GET    | `/posts`     |
| Obter um post específico      | GET    | `/posts/1`   |
| Criar um novo post            | POST   | `/posts`     |
| Atualizar um post existente   | PUT    | `/posts/1`   |
| Deletar um post               | DELETE | `/posts/1`   |
| Atualizar parte de um post    | PATCH  | `/posts/1`    |


<br>

#### Status Codes de Resposta e Padrões do REST

Os códigos de status de resposta HTTP são recursos importantes para implementacões RESTful, pois são usados como convenção para indicar informações de estado das respostas de uma  solicitação. Ele abre o leque das classes dando funcionalidades e representatividade a elas perante uma solicitação.  

Os status codes mais utilizados em implementações RESTFul são os seguintes: 

| Código                    | Descrição                                                                                 |
|---------------------------|-------------------------------------------------------------------------------------------|
| 200 OK                    | Solicitação bem-sucedida para GET, PUT ou POST sem criação de recurso.                    |
| 201 Created               | Nova criação de recurso resultante de uma solicitação POST.                               |
| 202 Accepted              | Solicitação aceita para processamento; conclusão pendente.                                |
| 204 No Content            | Solicitação bem-sucedida sem conteúdo para retornar. Comum após DELETE.                   |
| 400 Bad Request           | Erro de cliente devido a sintaxe ou formato inválido.                                     |
| 401 Unauthorized          | Falha ou necessidade de autenticação.                                                     |
| 403 Forbidden             | Servidor recusa a solicitação, apesar de compreendê-la.                                   |
| 404 Not Found             | Recurso solicitado não encontrado.                                                        |
| 405 Method Not Allowed    | Método conhecido pelo servidor, mas desativado.                                           |
| 500 Internal Server Error | Falha genérica do servidor.                                                               |
| 503 Service Unavailable   | Servidor indisponível, geralmente por manutenção ou sobrecarga.                           |
| 504 Gateway Timeout       | Tempo limite atingido por um servidor gateway ou proxy sem resposta do servidor upstream. |

<br>

#### Comunicação Stateless 

No REST, cada requisição do cliente para o servidor deve conter todas as informações necessárias para entender e completar a requisição. O servidor não armazena nenhum estado da sessão do cliente. 

#### Camadas 

A arquitetura em camadas permite que intermediários (como proxies e gateways) facilitem ou melhorem a comunicação entre o cliente e o servidor, promovendo a segurança, o balanceamento de carga e a capacidade de cache. Combinando o conceito e viabilidade de camadas com o padrão stateless, o padrão se torna muito poderoso e escalável. 

#### Cache 

As respostas do servidor devem ser explícitas quanto à sua cacheabilidade para evitar a reutilização de dados obsoletos ou inapropriados, melhorando a eficiência e a escalabilidade.


<br>

### RPC (Remote Procedure Call)

### gRPC (Google Remote Procedure Call)

O gRPC é um framework de chamada de procedimento remoto (RPC) de código aberto desenvolvido pelo Google. Ele permite que os desenvolvedores conectem serviços de maneira performática e escalável, possibilitando a comunicação entre serviços construídos de maneira distribuída. Seu design baseia-se no uso de **HTTP/2 como protocolo de transporte**, **Protocol Buffers (ProtoBuf)** como linguagem de interface de descrição de serviço (IDL), e oferece recursos como autenticação, balanceamento de carga e validações.  Essa arquitetura é ideal para construir arquiteturas de microserviços, onde serviços leves e eficientes são fundamentais para o desempenho e a escalabilidade.

Com o HTTP/2, é possível fazer múltiplas chamadas RPC em paralelo sobre uma única conexão TCP, o que é uma grande melhoria em termos de eficiência de rede e latência.

O gRPC suporta **streaming bidirecional**, permitindo que tanto o cliente quanto o servidor enviem uma sequência de mensagens para o outro usando uma única conexão. Isso é particularmente útil para casos de uso como chat em tempo real, monitoramento em tempo real e outros cenários que exigem comunicação contínua e persistente. 

Implementar e gerenciar um sistema baseado em gRPC pode ser mais complexo do que usar alternativas mais simples como REST, especialmente em projetos menores ou com requisitos menos rigorosos de desempenho. A característica de se utilizar contratos por ProtoBuf para manter um contrato consistencia, encontra-se a necessidade de distribuir e versionar esse contrato entre o cliente e o servidor. Uma vez que esse contrato precise ser mudado para adicionar, modificar ou remover alguma variável do mesmo, pode existir a problemática de garantir a atualização de todos os clientes desse serviço. 

#### ProtoBufs 

O Protocol Buffers, ou ProtoBuf, é a linguagem de descrição de interface preferida pelo gRPC, é usada para definir os serviços e a **estrutura de dados que serão compartilhados entre cliente e servidor por meio de um contrato forte**. ProtoBuf é um sistema de serialização binária que não só é mais eficiente em termos de espaço do que formatos como JSON, mas também fornece uma maneira clara de especificar a interface do serviço de maneira agnóstica a linguagens e frameworks


#### Exemplo de Contrato


#### Exemplo de Server gRPC


#### Exemplo de Client  gRPC


<br>

### Websockets

Uma comunicação baseada em Websockets são uma alternativa para solucionar **problemas de comunicação em tempo real entre clientes e servidores em tecnologias de desenvolvimento web**. Diferentemente do modelo tradicional de requisição e resposta HTTP, que é unidirecional e cria uma nova conexão TCP para cada requisição/resposta, o protocolo WebSocket estabelece uma **conexão full-duplex sobre um único socket TCP**. Isso permite uma **comunicação bidirecional contínua entre o cliente e o servidor**, ideal para aplicações web que necessitem de interações em tempo real de atualizações frequentes e instantâneas, como chats online, dashboards dinamicos, graficos de dados financeiros, sistemas de notificações e jogos online. 

![Web Socket](/assets/images/system-design/websocket.png)

A conexão WebSocket inicia-se como uma requisição HTTP padrão, mas solicita um "upgrade" para WebSockets através do cabeçalho `Upgrade`. Se o **servidor suporta WebSockets, ele responde com uma confirmação do "upgrade" e a conexão HTTP é então elevada a uma conexão WebSocket**. Uma vez estabelecida, a **conexão WebSocket permanece aberta, permitindo que tanto o cliente quanto o servidor enviem dados a qualquer momento até que a conexão seja fechada por uma das partes**. Ao manter uma conexão aberta, WebSockets eliminam a necessidade de estabelecer novas conexões HTTP para cada interação, reduzindo significativamente a latência.

Embora a maioria dos navegadores modernos suporte WebSockets, pode haver problemas de compatibilidade com navegadores mais antigos ou em ambientes de rede restritivos que não permitem conexões WebSocket. Além de que gerenciar uma conexão WebSocket persistente e garantir a retransmissão de mensagens perdidas pode ser mais complexo do que usar requisições HTTP simples.


#### Implementacão de um server de WebSockets



<br>

### GraphQL

GraphQL é uma linguagem de consulta para APIs e um runtime para execução dessas consultas pelo lado do servidor. Desenvolvido pelo Facebook em 2012 e lançado publicamente em 2015, GraphQL oferece uma abordagem flexível para o desenvolvimento de APIs em comparação com a abordagem tradicional REST. Ele permite que os clientes definam a estrutura dos dados requeridos, e exatamente esses dados, nada mais, nada menos, são retornados pelo servidor. Isso não só torna as consultas mais eficientes, mas também resolve o problema de sobrecarga e subutilização de dados frequentemente encontrado em APIs REST.

O grande motivador da tecnologia é reduzir o over-fetching e under-fetching, pois permite que os clientes solicitem exatamente os dados de que precisam sem a necessidade de lidar com gigantescos payloads. 

#### Como Funciona


### Referências


[HTTP Status](https://www.httpstatus.com.br/)

[HTTP Cats](https://http.cat/)

[Qual é a diferença entre gRPC e REST?](https://aws.amazon.com/pt/compare/the-difference-between-grpc-and-rest/)

[REST vs. GraphQL vs. gRPC vs. WebSocket](https://www.resolutesoftware.com/blog/rest-vs-graphql-vs-grpc-vs-websocket/)