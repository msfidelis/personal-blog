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

<br>

## Event-Bus e Publishers 

Dentro - e fora - de uma arquitetura de Event Sourcing, o Event Bus é o componente dedicado para permitir que os eventos gerados dentro de um domínio sejam publicados, e assim propagados para outros domínios, sistemas e subsistemas interessados nos acontecimentos e mudanças de estados de suas entidades. Seu objetivo é carregar esses eventos de forma desacoplada para outras partes do sistema. 

Os Publishers são componentes de um sistema Event Sourcing  que são responsáveis por publicar os eventos confirmados no Event Store nesses tópicos, filas ou barramentos. Esse comportamento de publicação deve ter característica atômica, e os eventos só podem ser emitidos no event-bus quando a gravação e outras operações são bem sucedidas. 

<br>

## Projections e Modelos de Leitura

Os Event-Stores dos Sistemas Event-Sourcing são otimizados para grandes quantidades de escrita, porém, entretanto, podem apresentar desafios de leituras e recuperações de dados. Os databases principais devem conter idealmente apenas os logs dos fatos. Para criar consultas sistemicas para alimentar API's e outros processos, precisamos ter meios de criar modelos otimizados para a leitura. 

Uma Projection, é um componente que “ouve” os eventos do Event Store e atualiza uma visão derivada em um formato otimizado para leitura do próprio sistema, ou de outros sistemas. Esses modelos são conhecidos como Modelos de Leitura, ou Read Models. Esses modelos podem sim, ser construídos em uma visão de State Mutation.

![Read Models](/assets/images/system-design/read-models.drawio.png)

Projections são construídas utilizando padrão de CQRS (Command-Query Responsability Segregation), onde portamos de forma assincrona, um modelo otimizado para escrita, para outro otimizado para a leitura.  Em Read Models, podemos utilizar bancos de dados em memória para escrever e retornar dados voláteis rápidos, bancos de dados orientados a documentos para buscas textuais ou modelos relacionais e não relacionais para relatórios consolidados. 

Ao contrário do event-sourcing, uma projeção são determinísticas ao estado atual, e os processos de “Replay” dos eventos em caso de reprocessamento dos eventos guardados de forma temporal para recomposição dos estados deve refletir também nas projections, que devem ser atualizadas e refletir o estado atual do sistema.

Em sistemas maiores, várias projeções coexistem, cada uma representando uma visão específica: analytics, relatórios, dashboards, filas de envio, catálogos, etc.

<br>


## Snapshotting 

O modelo event sourcing se propõe a que seja armazenada todas as alterações e operações de estado para que esse dado consiga ser auditado e recomposto durante o tempo. Em um exemplo transacional de o saldo de uma conta bancária, podemos saver o saldo atual da conta, mas perdemos a a trilha de eventos que representa o mesmo até seu momento atual. Depositos, saques, transferencias, estornos em conjunto construiriam o estado atual do saldo. Em domínios onde a auditabilidade, rastreabilidade ou causalidade são importantes, essa ausência histórica é um problema significativo. 

No entanto, reconstruir o estado completo pode se tornar computacionalmente caro com o crescimento da base de eventos. É nesse ponto que surge o conceito de **Snapshotting**. Snapshotting é uma técnica otimização que cria “pontos de restauração” intermediários do estado, como “fotografias” que permitem reconstruir o estado de forma incremental, sem precisar realizar cálculos de todas as transações a todo o momento. 

Um Snapshot representa o estado de um agregado ou entidade em um determinado ponto do tempo, junto com um indice do ultimo evento aplicado para gerar aquele determinado estado. Assim, caso seja necessário “reidratar” o estado, o sistema ao invés de processar todo o histórico de inicio ao fim, ele pode iniciar o processamento apenas aos eventos que ocorreram depois dele. 

Por exemplo, a entidade Saldo dentro do Agregado “Conta” possui 1.000.000 de eventos historicos de lançamentos e movimentações. Para realizar um recalculo de saldo, ao invés de processar todos os eventos dispersos no banco de dados, a cada 10.000 eventos, o sistema pode gerar um snapshot contendo o saldo consolidado a partir do ultimo evento. Para reconstruir o estado atual, basta carregar o ultimo snapshot e aplicar os eventos posteriores a ele, reduzindo de forma considerável o tempo e custo computacional de leitura.  

No entanto, snapshots devem ser tratados como artefatos derivados e descartáveis, não como fonte primária de verdade. O **Event Store** continua sendo o single source of truth, e snapshots são apenas mecanismos auxiliares para performance pontuais para operação.

<br>

# Reconstituição de Estados e Rehydratation

<br>

# Integração de Domínios em Arquiteturas Complexas 

<br>

# Idempotencia em Dominios Complexos 

A **idempotência** é a propriedade que permite que uma operação seja executada múltiplas vezes

**sem alterar o resultado final**.

Em sistemas centralizados, isso pode ser implementado com transações ACID. Mas em arquiteturas distribuídas, onde eventos são propagados de forma assíncrona e cada serviço mantém sua própria consistência, a idempotência precisa ser **explicitamente  e cuidadosamente projetada**.

Em sistemas distribuídos baseados em eventos ou arquiteturas assincronas em geral, a idempotencia é um requisito que nos permite operar arquiteturas complexas de forma segura, principalmente pelo fato de que a entrega e o processamento de eventos são inerentes e não deterministicos, muitas vezes podendo ocorrer duplicidade na entrega, race conditions ocasionais, processamentos podem falhar em meio a execução e precisar serem reiniciadas . 

Em arquiteturas event-sourcing, podemos decidir reprocessar todos os eventos de um período específico e recompor projeções e notificações para sistemas subjacentes e forma histórica. Para que todo esse processo ocorra dentro do domínio, e nos domínios ao redor, precisamos garantir processos de idempotencia distribuída e controle de versão dos eventos, para que os eventos processados corretamente não sejam impactados por efeitos colaterais e gerar efeitos negativos. 

Cada evento deve possuir um `event_id` único e uma `version` incremental. Isso evita duplicações e permite evoluir o schema de eventos com segurança.

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