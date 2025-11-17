---
layout: post
image: assets/images/system-design/capa-pacelc.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Event Sourcing
---

# Definindo Event Sourcing

Event Sourcing é um padrão arquitetural que busca registrar todos os eventos que mudam o estado de ume entidade em uma base de dados de forma historica. Esse padrão é usado para "contar uma história" de ume transação ou entidade em todo seu ciclo de vida.

Em sistemas que uma entidade muda com frequencia, como por exemplo estados de um pagamento, estados de um usuário ou operador do sistema, uma compra, o fases de fabricação de algo passa por diversas alterações de estado ao decorrer do processo, o event sourcing visa registrar cada alteração de forma imutável. 

O objetivo dé não armazenar apenas o estado atual, mas todas as alterações ao decorrer do tempo de forma cronológica, como um log de eventos que podem ser auditados e recompostos. Isso é útil em sistemas event-driven que emitem eventos constantes para outros sistemas e que eventualmente precisam recompor os estados de forma distribuída. 

<br>

# Persistencia Tradicional e Event Sourcing

A medida que a evolução arquitetural de sistemas distribuídos ocorrem e desenvolvem integrações e dependências mais complexas, a forma tradicional de persistir o “estado atual” de um registro dentro do sistema tende a se tornar limitada devido a critérios de resiliência e recuperação de falhas. 

Em modelos tradicionais, o paradigma central é o “State Mutation”, onde o estado atual é sempre substituido a cada operação que ocorre. A proposta é responde como uma entidade do sistema “está agora", mas não “como ela chegou até aqui”.  

![Persistencia Tradicional](/assets/images/system-design/persistencia-tradicional.drawio.png)

Como visto, o estado de cada entidade é mutavel por padrão, ou seja,  cada operação de INSERT, UPDATE e DELETE substitui as informações anteriores apagando o historico. Por exemplo, em um sistema de pagamentos, podemos receber uma série de eventos de domínio que representam ações que são realizados diretamente na entidade.

| Evento                        | Ação      | Status            |
|-------------------------------|-----------|-------------------|
| PagamentoCriado(valor=100)    | Insert    | status=criado     |
| PagamentoConfirmado           | Update    | status=confirmado | 
| PagamentoEstornado            | Update    | status=estornado  | 

<br>

O Modelo de Event Sourcing propõe essa inversão conceitual, onde ao invés de armazenar o estado atual de entidades e registros após uma série de operações de insert, updates, deletes o sistema acumula uma série de eventos imutáveis e armazenamos todos eles para derivar o estado atual. 

![Persistencia Event Sourcing](/assets/images/system-design/persistencia-event-sourcing.drawio.png)

Cada operação representa uma operação imutável, de que “algo aconteceu” e está sumariamente registrado, fazendo com que o estado represente de fato uma sequencia ordenada e temporal de eventos, e não sua atualização mais recente.

Todas as operações em um sistema Event Sourcing são naturalmente inserts de novos dados sobre o estado da entidade. Sendo necessário recuperar o ultimo estado sempre que o mesmo precisar ser consultado. Exigindo mais das operações de leitura em caso de alto volume, sendo um tradeoff conhecido, e onde é necessário empregar as maiores otimizações

Esse modelo de persistencia quando construído de forma consciente e responsável permite construir sistemas auditáveis, reproduzíveis e naturalmente reativos, mas exige uma maturidade complexa de engenharia para não criar pontos de gargalo e custos excessivos.

<br>

# Arquitetura Event-Sourcing 

## Event-Store

O Event Store é o database central de uma arquitetura baseada em Event Soucing. Um database de event-store deve ser tratado como um ledger imutável, e deve armazenar o log de todos os eventos que registram mudanças de estado das entidades do sistema, respeitando uma ordem temporal e absoluta. 

A estrutura de dados de um Event Store, ao invés de atualizar o estado atual, deve anexar um novo evento ao final do fluxo, ou stream, associado a uma determinada entidade ou agregado. Cada stream deve representar uma linha de tempo de uma transação. 

Um Event-Store não deve armazenar o estado de fato, apenas a história completa dos fatos, por isso o ponto crítico da construção dessas soluções deve garantir ordenação e atomicidade, para que seja possivel reconstruir a entidade reaplicando os eventos em sequencia.

![Event Store](/assets/images/system-design/event-store.drawio.png)

Ao reaplicar os 3 eventos da transação `432`, é reconstituido totalmente e de forma fiel, para o estado `pago`, com 2 produtos adicionados para o cliente `a`. 

Esse modelo é análogo ao **append-only log** usado por sistemas como Kafka ou bancos contábeis — o dado nunca é substituído, apenas acumulado, por isso é comparado a um ledger distribuído, um registro permanente, auditável e verificável ao decorrer do tempo de tudo que aconteceu dentro de um domínio.

![Event Store Ledger](/assets/images/system-design/event-store-ledger.drawio.png)

Modelar o nosso event-store para se tornar agnótisco ao time de operação efetuada, utilizando campos livres ou em blob para armazenar dados e metadados do evento com fins de repuplicação e reprocessamento, utilizando de indices para otimização de consultas transacionais e recuperação de estado histórico. 

<br>

## Event-Bus e Publishers 

Dentro - e fora - de uma arquitetura de Event Sourcing, o Event Bus é o componente dedicado para permitir que os eventos gerados dentro de um domínio sejam publicados, e assim propagados para outros domínios, sistemas e subsistemas interessados nos acontecimentos e mudanças de estados de suas entidades. Seu objetivo é carregar esses eventos de forma desacoplada para os consumidores do sistema. O Event Store é o registro de verdade, a golden source dos eventos. O Event Bus é o meio de projeção de consequências desses eventos. 

![Event Bus](/assets/images/system-design/event-bus.drawio.png)

Os Publishers são componentes de um sistema Event Sourcing  que são responsáveis por publicar os eventos confirmados no Event Store nesses tópicos, filas ou barramentos. Esse comportamento de publicação deve ter característica atômica, e os eventos só podem ser emitidos no event-bus quando a gravação e outras operações são bem sucedidas. O Event Bus pode ser implementado sobre tecnologias como Kafka, RabbitMQ, SQS, NATS ou Pulsar, dependendo do SLA e das garantias necessárias.

Ambos não são definitivamente obrigatórios para uma arquitetura event sourcing, porém são grandes facilitadores em implementações em arquiteturas de microserviços orientadas a eventos. De qualquer forma um Event Bus devem preservar ordenação dos eventos por stream ou aggregate, e garantir que o evento seja entregue pelo uma vez, com deduplicação evitando que os mesmos sejam repetidos de forma não intencional e idempotencia a nível dos consumidores para permitir reprocessamento. 

Um Event Sourcing pode possuir vários barramentos de service bus que são responsáveis por registrar e transmir eventos de domínio para consumidores especificos com ações específicos em domínios diferentes. 

![Event Bus Conta Confirmada](/assets/images/system-design/event-bus-conta.drawio.png)

Um Event Bus com características de ledger distribuido, que é responsável por registrar de forma histórica todas ações efetuadas dentro de uma conta específica, pode emitir eventos como "Nova Conta Registrada" para domínios que precisam persistir previamente uma estrutura base de uma nova conta antes de começar a consumir o evento central como por exemplo uma transação, como um Saldo (Balance) ou um Extrato (Statement). 

Assim que houverem eventos emitidos dentro do event sourcing responsável por registrar as transações, essas mensagens de transações persistidas são transmitidas para outro barramento de event-bus responsável por notificar os domínios que esses eventos aconteceram, por exemplo para compor o balance e registrar de forma histórica eventos de extrato. 

![Event Bus Transacao Confirmada](/assets/images/system-design/event-bus-transacao.drawio.png)

Dessa forma conseguimos notificar e recompor entidades inteiras dentro de domínios que podem aplicar suas proprias características de event sourcing ou persistencia transacional por meio de arquiteturas orientadas a eventos de forma eventualmente consistente. 

<br>

## Projections e Modelos de Leitura

Os Event-Stores dos Sistemas Event-Sourcing são otimizados para grandes quantidades de escrita, porém, entretanto, podem apresentar desafios de leituras e recuperações de dados. Os databases principais devem conter idealmente apenas os logs dos fatos. Para criar consultas sistemicas para alimentar API's e outros processos, precisamos ter meios de criar modelos otimizados para a leitura. 

Eventos por definição são eventos e ações de fatos que aconteceram no passado. Projections são componentes e processos que são utilizados para interpretar esses fatos e transformá-los em algo utilizável sistemicamente, em termos de leitura. Uma projection é a consolidação de vários eventos de um mesmo identificador ou entidade, que após interpretados, chegamos a um resultado esperado e esse resultado é salvo em um modelo de leitura, ou Read Model. 

![Projections](/assets/images/system-design/projection.drawio.png)

Em outras palavras, os projections,são componentes ou processos que “ouvem” os eventos do Event Store e atualiza uma visão derivada em um formato otimizado para leitura do próprio sistema, ou de outros sistemas. Esses modelos são conhecidos como Modelos de Leitura, ou Read Models. Esses modelos podem sim, ser construídos em uma visão de State Mutation.

![Read Models](/assets/images/system-design/read-models.drawio.png)

Projections são normalmente construídas utilizando padrão de CQRS (Command-Query Responsability Segregation), onde portamos de forma sincrona ou assincrona, um modelo otimizado para escrita, para outro modelo otimizado para a leitura.  Em Read Models, podemos utilizar bancos de dados em memória para escrever e retornar dados voláteis rápidos, bancos de dados orientados a documentos para buscas textuais ou modelos relacionais e não relacionais para relatórios consolidados. 

Read Models não são apenas caches de leitura, eles são representações materializadas e derivadas de fatos históricos ocorridos no passado e registrados no event store. Isso significa que eles precisam evoluir junto com o domínio e com a semântica dos eventos em tempo proximo do real.

Ao contrário do event-sourcing, uma projeção são determinísticas ao estado atual, e os processos de “Replay” dos eventos em caso de reprocessamento dos eventos guardados de forma temporal para recomposição dos estados deve refletir também nas projections, que devem ser atualizadas e refletir o estado atual do sistema.

Em sistemas maiores, várias projeções coexistem, cada uma representando uma visão específica: analytics, relatórios, dashboards, filas de envio, catálogos, etc. Seguindo as boas práticas de reprocessamento e elasticidade inerente ao domínio principal, as Read Models distribuídas se tornam efêmeras descartáveis, podendo ser reconstituídas a qualquer momento do tempo. 

<br>

### Projections e Read Models Transacionais 

Dentro de um modelo transacional, podemos agrupar pequenas projections dentro do mesmo banco de dados do event store de forma atômica. Um event source não é otimizado para leitura, são otimizados para escrita intensiva. Em processos que exigem uma carga de trabalho e volumes muito altos de dados, uma gama maior de operações dentro de uma transação do event source pode gerar gargalos e uma escalabilidade vertical maior das aplicações e databases. 

![Transacao](/assets/images/system-design/read-model-transacional.drawio.png)

Nesse modelo, a prioridade é preservar atomicidade e consistência imediata. Isso significa que, dentro de uma única transação, tanto o evento quanto a projeção derivada são persistidos de forma atômica. O maior benefício desse modelo é a eliminação de latência entre escrita e leitura, permitindo consistência em valores que não aceitam divergência em nenhum estado, porém leva complexidade operacional ao Event Source e maior carga de operações ao Event Store, sendo um gargalo em cenários de alta volumetria. 

<br>

### Projections e Read Models Semi-Sincronos

O propósito inicial de uma Event Source é **gerar uma fonte segura e confiável de dados transacionais** e que os mesmos **possam ser reconstituidos e replicados**. No modelo transacional, como visto anteiormente, mesmo que algumas Read Models sejam construidas dentro do próprio Event Source de forma atômica, idealmente elas precisam ser encaminhadas para aplicações que iram tratar e otimizar esses dados para leitura, lidando com esses dados transacionais apenas para atualização e reconstrução de projections. Em outras palavras, precisamos reduzir qualquer outra operação que possam comprometer a capacidade dedicada para escrita e confiabilidade. 

Nesses casos, podemos tratar a afinidade transacional do event source para tratá-lo como uma "**golden source atômica**", e atualizar nossas Read Models de forma assincrona e eventual, tendo duas fontes do mesmo dado, uma voltada apenas para persistencia e confiabilidade, e outra para consulta. Ideal para grandes volumes de dados.

![Golden Source](/assets/images/system-design/semi-sync-read-model.drawio.png)

Uma operacão de saldo precisa ser executada de forma atômica e transacional para evitar inconsistências. Precisamos garantir **exclusão mutua** e lidar com **diversas operações por meio de transactions** para lidar com todos os lançamentos e movimentações para chegar ao saldo atual. **Essas operações podem ser executadas dentro de um event source**. Após cada transação, o novo saldo é calculado de forma atômica e é produzido no event bus onde pode ser consumido por um Read Model que expõe o dado para uma modelagem e database otimizados para consulta e exposição para grandes volumes de requisições. 

**Esse caso pode ser assumido apenas onde podemos lidar com otimismo entre os níveis de consistência.**

<br>

### Projections e Read Models Assincronos 

Em sistemas que tem apetite para consistencia eventual, podemos encaminhar os dados registrados no event sourcing via event-bus para construção de read models diretamente nos domínios interessados, removendo qualquer complexidade adicional no event store. 

![Async](/assets/images/system-design/read-model-async.drawio.png)

Dessa forma deixamos o capacity do event source dedicado apenas para registrar, confirmar e repassar os logs temporais e garantir uma temporalidade atômica. Todos os modelos de leitura são construidos e processados de forma totalmente desacoplada do event source, porem lidando com aumento computacional significativo em cada proposta de processamento e sendo necessário o envio completo dos logs para reconstituição. Tiramos a complexidade e demanda computacional do motor dos eventos e repassamos os mesmos para cada aplicação e domínio responsável por tratar os dados de forma agnóstica. 

<br>


## Snapshotting 

O modelo event sourcing se propõe a que seja armazenada todas as alterações e operações de estado para que esse dado consiga ser auditado e recomposto durante o tempo. Em um exemplo transacional de o saldo de uma conta bancária, podemos saver o saldo atual da conta, mas perdemos a a trilha de eventos que representa o mesmo até seu momento atual. Depositos, saques, transferencias, estornos em conjunto construiriam o estado atual do saldo. Em domínios onde a auditabilidade, rastreabilidade ou causalidade são importantes, essa ausência histórica é um problema significativo. 

No entanto, reconstruir o estado completo pode se tornar computacionalmente caro com o crescimento da base de eventos. É nesse ponto que surge o conceito de **Snapshotting**. Snapshotting é uma técnica otimização que cria “pontos de restauração” intermediários do estado, como “fotografias” que permitem reconstruir o estado de forma incremental, sem precisar realizar cálculos de todas as transações a todo o momento. 

Um Snapshot representa o estado de um agregado ou entidade em um determinado ponto do tempo, junto com um indice do ultimo evento aplicado para gerar aquele determinado estado. Assim, caso seja necessário “reidratar” o estado, o sistema ao invés de processar todo o histórico de inicio ao fim, ele pode iniciar o processamento apenas aos eventos que ocorreram depois dele. 

Por exemplo, a entidade Saldo dentro do Agregado “Conta” possui 1.000.000 de eventos historicos de lançamentos e movimentações. Para realizar um recalculo de saldo, ao invés de processar todos os eventos dispersos no banco de dados, a cada 10.000 eventos, o sistema pode gerar um snapshot contendo o saldo consolidado a partir do ultimo evento. Para reconstruir o estado atual, basta carregar o ultimo snapshot e aplicar os eventos posteriores a ele, reduzindo de forma considerável o tempo e custo computacional de leitura.  

No entanto, snapshots devem ser tratados como artefatos derivados e descartáveis, não como fonte primária de verdade. O **Event Store** continua sendo o single source of truth, e snapshots são apenas mecanismos auxiliares para performance pontuais para operação.

<br>

# Reconstituição de Estados e Rehydratation

A reconstituição de estado de um agregado dentro do event source, popularmente conhecido como Rehydratation, é o processo pelo qual utilizamos os logs sequenciais registrados no event store para reconstruir o estado de entidades e operações dentro e fora do domínio principal. Um event source deve idealmente ter ferramentas que permitam que todos os registros sejam reprocessados sequencialmente reaplicando todos os eventos associados a ele. Esse processo é central ao Event Sourcing, e permite que a história contada pelos logs seja novamente reconstituida. 

![Rehydratation](/assets/images/system-design/rehydratation.drawio.png)

No cenário hipotético de um event source que guarda todas as transações de credito e debito e dispara esses eventos confirmados para outros domínios que fazem uso dessa informação como saldo ou extrato do cliente que irá disponibilizar read models dessas informações sumarizadas. Um desses domínios sofre algum grau de inconsistencia sistemica ou manual, perdendo total ou parcialmente todos os dados e ferindo a integridade da informação. Nossa aplicação event source, deve oferecer gatilhos para reaplicar todos os eventos e enviá-los de forma sequencial para o event-bus, oferendo meios de que os domínios subsequentes consigam se reconstituir com essa informação temporal e recalcular o saldo atual, ou reconstruir a visualização de lançamentos. 

Essa estratégia pode ser implementada em domínios complexos que exigem otimizações e reconstituições rastreáveis como rastreio de medicamentos farmaceuticos, históricos de linhas de fabricação, aplicação de descontos, prontuários e histórico médico de pacientes, fechamento de caixas e etc. 



<br>

# Integração de Domínios em Arquiteturas Complexas 

<br>

# Idempotencia em Dominios Complexos 

A **idempotência** é a propriedade que permite que uma operação seja executada múltiplas vezes

**sem alterar o resultado final**.

Em sistemas centralizados, isso pode ser implementado com transações ACID. Mas em arquiteturas distribuídas, onde eventos são propagados de forma assíncrona e cada serviço mantém sua própria consistência, a idempotência precisa ser **explicitamente  e cuidadosamente projetada**.

Em sistemas distribuídos baseados em eventos ou arquiteturas assincronas em geral, a idempotencia é um requisito que nos permite operar arquiteturas complexas de forma segura, principalmente pelo fato de que a entrega e o processamento de eventos são inerentes e não deterministicos, muitas vezes podendo ocorrer duplicidade na entrega, race conditions ocasionais, processamentos podem falhar em meio a execução e precisar serem reiniciadas . 

Em arquiteturas event-sourcing, podemos decidir reprocessar todos os eventos de um período específico e recompor projeções e notificações para sistemas subjacentes e forma histórica. Para que todo esse processo ocorra dentro do domínio, e nos domínios ao redor, precisamos garantir processos de idempotencia distribuída e controle de versão dos eventos, para que os eventos processados corretamente não sejam impactados por efeitos colaterais e gerar efeitos negativos. 

Cada evento deve possuir um `event_id` único e uma `version` incremental. Isso evita duplicações e permite evoluir o schema de eventos com segurança. Esse processo também pode ser conduzido por Unix timestamps indicando ordem temporal direta. 

<br>

# Garantias de Ordem em Consistência Eventual (Last-Write-Wins)


### Referências 

- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Event sourcing pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing.html)
- [Eventsourcing e EventStore, Projeções, Snapshots](https://medium.com/@rvf.vazquez/eventsourcing-e-eventstore-proje%C3%A7%C3%B5es-snapshots-97b964a220d)
- [Event store](https://en.wikipedia.org/wiki/Event_store)
- [Explorando o EventStore – Overview](https://israelaece.com/2016/04/28/explorando-o-eventstore-overview/)
- [Event Bus & Event Store](https://docs.axoniq.io/axon-framework-reference/4.11/events/infrastructure/)
- [How to Create a Event Bus in Go](https://leapcell.medium.com/how-to-create-a-event-bus-in-go-d7919b59a584)
- [Implementing event-based communication between microservices (integration events)](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/integration-event-based-microservice-communications)
- [Guide to Projections and Read Models in Event-Driven Architecture](https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/)