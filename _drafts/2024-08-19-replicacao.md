---
layout: post
image: assets/images/system-design/replicacao-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Replicação de Dados
---

# Definindo Replicação na Engenharia de Software

Replicação, principalmente dentro nos requisitos de engenharia, se refere ao ato de criar uma ou mais cópias do mesmo dado em destinos diferentes. Essa é uma prática bem vista e bem vinda, especialmente em sistemas distribuídos, onde a consistência, disponibilidade e tolerância a falhas são requisitos mandatórios para uma operabilidade saudável e duradoura. Quando olhamos para [Bancos de Dados](/teorema-cap/), a replicação permite que mesmo em caso de falhas terminais de hardware ou problemas de rede, os dados permaneçam acessíveis em outros locais e dão a garantia de que o sistema se tornará consistente em algum momento. 

Essas réplicas podem estar localizadas em servidores diferentes, em datacenters separados geograficamente ou até mesmo em diferentes regiões de nuvens públicas. A finalidade principal da replicação é garantir que os dados estejam disponíveis em vários locais, o que é crítico para sistemas que exigem alta disponibilidade e continuidade de negócios.

Os beneficios de estratégias de replicação são vários, como por exemplo, ao replicar dados em vários locais, um sistema pode continuar a operar mesmo que uma parte do sistema falhe. Em caso de um cluster de databases um nó do mesmo falhar, as réplicas dos dados em outros nós podem assumir e se tornarem a fonte principal da consulta, garantindo que o serviço continue disponível.

<br>

# Modelos de Replicação 

Antes de entrarmos nos tópicos sobre estratégias de replicação, precisamos entender alguns modelos pelos quais os sistemas de replicação são construídos. Independente da estratégia adotada para garantir a existência de várias cópias do mesmo dado em diferentes locais ou nós, o modelo pelo qual essa estratégia é adotada normalmente trafega entre os modelos Primary-Replica ou Primary-Primary, também conhecido como Multi-Master. Vamos entender conceitualmente essas duas estratégias para nivelar o conhecimento para as implementações de fato.  

## Replicação Primary-Replica

Na Replicação Primary-Replica, podemos presumir a existência de um nó primário que recebe todas as operações de escrita e, em seguida, replica essas operações para um ou mais nós secundários, suas replicas. As réplicas geralmente são usadas apenas para leitura, enquanto todas as operações de escrita são gerenciadas pelo nó primário. Essa arquitetura é útil quando se deseja escalar leituras em um sistema, distribuindo-as entre réplicas, mas mantendo a simplicidade no gerenciamento de escrita. 

O nó primário é responsável por garantir a consistência dos dados em todas as réplicas. Essa abordagem pode ser eficiente em cenários de alta demanda de leitura, ou quando fazemos um uso intensivo de [CQRS](/cqrs/), mas cria um ponto único de falha no nó primário. Se o nó primário falhar, um novo primário deve ser promovido de uma das réplicas, o que pode introduzir um tempo de inatividade até que essa atividade seja concluída. 

## Replicação Primary-Primary - Multimaster

A Replicação Primary-Primary, também conhecida como Multi-Master Replication, é uma arquitetura onde múltiplos nós podem atuar simultaneamente como primários, recebendo tanto operações de leitura quanto de escrita. Nessa configuração, qualquer nó pode processar atualizações e as mudanças são replicadas entre todos os nós, permitindo alta disponibilidade e escalabilidade de escrita. 

![Replicacao Multiprimary](/assets/images/system-design/replicacao-multi-primary.png)

Esse modelo reduz o ponto único de falha da replicação Primary-Replica e permite maior flexibilidade na distribuição de carga de trabalho. No entanto, ele também introduz complexidade adicional, especialmente para resolver conflitos de escrita. Quando duas operações de escrita ocorrem em diferentes nós primários simultaneamente, o sistema precisa de uma estratégia para resolver esses conflitos, como basear-se em timestamps de ordem de execução das tarefas, ou ter políticas específicas de resolução de conflitos por conta de [particionamento temporário por falha de rede](/teorema-cap/).

<br>

# Estratégias de Replicacão

Dentro das disciplinas de engenharia, podemos encontrar várias estratégias de replicação, tanto abordagens que se aplicam somente para dados, que é geralmente o foco desse tipo de estratégia devido a importância e a complexidade, tanto quanto para outras abordagens não convencionais como cargas de trabalho completas, domínios de software em cache e etc. O objetivo desse capítulo é exemplificar alguns dos modelos mais utilizados de replicação e explicar suas diferenças, vantagens e desvantagens. 

## Replicação Total e Parcial

A Replicação Total se refere à prática de replicar todos os dados em todos os nós de um sistema. Isso significa que cada nó tem uma cópia completa dos dados. A vantagem da replicação total é que ela maximiza a disponibilidade e resiliência de forma com que qualquer nó possa atender a uma solicitação do cliente caso a escrita seja amplamente permitida. No entanto,como um tradeoff, essa estratégia pode aumentar os custos de armazenamento e a latência de escrita, já que cada nova informação precisa ser replicada e confirmada em todos os nós que compõe um cluster do dado. 

Em contraponto, a Replicação Parcial, por outro lado, distribui apenas uma parte dos dados em cada nó. Assim, cada nó contém apenas uma fração dos dados totais. Esse modelo é eficiente em termos de armazenamento e reduz a latência de escrita, mas aumenta a complexidade na leitura, pois os dados solicitados podem não estar disponíveis localmente e podem exigir comunicação entre nós, fazendo com que o cliente precise fazer queries em mais de um nó, ou deixar para que o sitema de consulta abstraia essa complexidade. Para encontrar o dado entre os nós, é comum implementar algoritmos de [Sharding](/sharding/) como Hashing Consistente. 

## Replicação Sincrona

Na Replicação Síncrona, todas as alterações de todos os dados devem ser replicadas em todos os nós antes que a operação seja considerada bem-sucedida. Isso garante consistência forte entre os nós, ou seja, todos eles terão os mesmos dados em qualquer momento.

![Replicação Sincrona](/assets/images/system-design/replicacao-sincrona.png)

Em uma dimensão onde um cliente precisa salvar uma informação em um cluster de cache, ele envia o dado a ser salvo em uma forma de chave e valor para o endpoint primário de um cluster de cache, que por sua vez se encarrega de distribuir o dado entre todos os nós do mesmo. A solicitação só é finalizada e encerrada para o cliente prosseguir com o restante de suas tarefas quando essa operação é concluída por completo. 

A replicação síncrona tem vantagens em cenários onde a consistência é crítica, como em sistemas de pagamento ou bancos de dados financeiros, onde qualquer discrepância entre os nós pode causar grandes problemas. No entanto, ela pode aumentar a latência, especialmente quando há grandes distâncias entre os nós, ou uma grande quantidade deles. 

## Replicação Assincrona

Na Replicação Assíncrona, as alterações de dados são enviadas um dos nós de um cluster, e replicada para os outros nós de forma eventual, o que significa que a operação pode ser considerada bem-sucedida sem esperar que todas as réplicas tenham sido atualizadas. Isso resulta em maior desempenho nas operações de escrita, pois o sistema não precisa esperar pelas confirmações de todos os nós. Porém pode se aceitar uma inconsistência eventual em uma consulta subsequente, uma vez que o dado possa não ter sido replicado totalmente nos demais nós, e possam existir mais de uma versão do dado existindo ao mesmo tempo até que a replicação termine por completo. 

![Replicação Assincrona](/assets/images/system-design/replicacao-assincrona.png)

A replicação assíncrona é amplamente utilizada em cenários onde a disponibilidade e o desempenho são mais importantes que a consistência imediata, como redes sociais, assets em uma CDN, dados pouco importantes utilizados somente para evitar excesso de acessos a uma origem, clusters de cache e afins. 

## Replicação Semi-Sincrona

A Replicação Semi-Síncrona combina aspectos da replicação síncrona e assíncrona. Neste modelo, pelo menos uma ou um pequeno subconjunto de réplicas deve confirmar a gravação de dados antes que a operação seja considerada bem-sucedida. As demais réplicas podem ser atualizadas de forma assíncrona.

![Replicação Semi-Sincrona](/assets/images/system-design/replicacao-semi-sincrona.png)

Esse tipo de replicação oferece um equilíbrio entre consistência e desempenho. Ele melhora a resiliência, garantindo que os dados sejam gravados em pelo menos um nó de forma síncrona, enquanto mantém a baixa latência ao não exigir que todas as réplicas estejam atualizadas imediatamente. Alguns flavors de bancos de dados, como o MySQL e MariaDB, a escrita é confirmada assim que um nó secundário grava os dados. Outros nós podem receber as atualizações posteriormente de forma assíncrona, garantindo um grau adicional de consistência sem comprometer a performance por completo.

## Replicação por Logs

A Replicação por Logs é uma abordagem em que todas as operações ofetuadas em um sistema são registradas em um log de operações sequenciais, e esse log é então replicado para outros nós do cluster para executarem as mesmas operações. Em vez de replicar o estado completo dos dados, o sistema replica as mudanças, permitindo que as réplicas apliquem essas mudanças localmente e mantenham seus dados consistentes.

![Replicação por Logs](/assets/images/system-design/replicacao-logs.png)

Essa abordagem é vantajosa em cenários onde as alterações são mais frequentes que leituras, ou onde o volume de dados é muito grande, pois apenas as modificações são replicadas, reduzindo a quantidade de dados trafegados entre um ponto a outro de um cluster. Esse tipo de abordagem pode ser encontrado em tecnologias que permitem interoperabilidade entre multiplas regiões de núvens públicas, multiplos datacenters, zonas de recuperação de desastre e afins. 

Tecnologias altamente conhecidas e maduras como o [Apache Kafka ou outras tecnologias de streaming e eventos](/mensageria-eventos-streaming/) usa replicação por logs em sua arquitetura de nós e replicas. Cada tópico em Kafka é composto por múltiplas partições, e as alterações nessas partições são registradas em logs de transações que são replicados entre os brokers, garantindo durabilidade e resiliência. 


<br>

# Arquitetura

## Event-Carried State Transfer - Replicação de Estados e Objetos de Domínios

Em grandes sistemas, especialmente em arquiteturas corporativas complexas, uma possível solução para se lidar com a alta disponibilidade de grandes volumes de dados é o **Event-Carried State Transfer**.

Esse padrão permite que o estado de um objeto seja transmitido entre serviços ou domínios de software por meio de eventos. Ele combina estratégias de cache, sistemas baseados em eventos e replicação de dados, proporcionando uma maneira custoza, porém poderosa de lidar com altos volumes de dados sem agravar níveis de acoplamento.

A ideia central é que, sempre que houver uma atualização em uma entidade de um domínio, essa mudança seja publicada em tópicos de eventos. Os demais serviços que dependem desse domínio podem consumir esses eventos e atualizar suas próprias bases de dados locais, criando uma cópia em cache do estado. Isso é especialmente útil em sistemas que toleram consistência eventual, pois, em vez de consultar uma fonte centralizada a cada solicitação, os serviços mantêm e utilizam suas próprias versões dos dados, que são atualizadas conforme os eventos são processados. Em sistemas complexos e altamente distribuído, a curva de custo x benefício desse tipo de abordagem pode se tornar viável. 

![State Transfer](/assets/images/system-design/state-transfer.drawio.png)

Imagine um sistema governamental que compartilha os dados dos cidadãos entre diferentes sistemas de diversos orgãos bancários, fiscais, entidades de segurança, sistemas de transito, imobiliário e social. Se pensarmos esse case orientado a eventos, sempre que o cliente atualizar um estado cívil, renda, endereço, telefone de contato em um sistema central de cadastro, essa informação seja notificada por um evento, e cada um desses sistemas de orgãos públicos o consuma e atualize sua base cadastral. 

<br>

## Change Data Capture - Captura de Alterações de Dados

O **Change Data Capture (CDC)** é uma técnica que detecta e captura as alterações feitas em uma fonte de dados, como um **[banco de dados relacional](/teorema-cap/)**, e as **transmite para outros sistemas em tempo real**. Isso **permite que outros serviços sejam imediatamente atualizados sem precisarem consultar diretamente o banco de dados original**. Essa abordagem é muito útil para **sincronizar dados entre diferentes sistemas**, alimentar filas de mensagens, ou manter caches atualizados com as últimas informações.

![CDC](/assets/images/system-design/cdc.drawio.png)

O objetivo do padrão é oferecer um mecanismo que **monitora operações como inserções, atualizações e deleções**, **capturando essas mudanças à medida que elas acontecem**. Depois de capturadas, as **alterações podem ser enviadas para tópicos de eventos ou diretamente para sistemas que dependem desses dados**. Isso possibilita que outros serviços recebam as informações mais recentes **sem sobrecarregar o banco de dados principal com consultas constantes**.

Essa técnica funciona como uma base para outras estratégias, como o **Event-Carried State Transfer**, que se beneficia da captura de eventos para replicar dados de forma inteligente e proativa. O CDC também é um viabilizador em processos que envolvem streaming de dados para Datalakes, [cacheamento proativo](/caching/), e [CQRS](/cqrs/), atuando como uma ponte reativa que facilita a replicação e a integração com outros padrões.

<br>

## Replicação de Cargas de Trabalho

![Workload](/assets/images/system-design/workload.drawio.png)

A Replicação de Cargas de Trabalho vai além da replicação de dados, focando em duplicar processos de computação ou serviços inteiros em diferentes nós, datacenters ou regiões. Essa estratégia é muito usada para garantir que sistemas distribuídos estejam sempre disponíveis, com uma carga de trabalho bem distribuída e tolerância a falhas.

Com essa abordagem, mesmo que um nó ou região de computação falhe, outras réplicas continuam processando as requisições, assegurando que o serviço siga funcionando sem interrupções.

<br>

### Obrigado aos Revisores

<br>

### Referências

[What is Change Data Capture?](https://www.qlik.com/us/change-data-capture/cdc-change-data-capture)

[O que é Change Data Capture](https://triggo.ai/blog/o-que-e-change-data-capture/)

[SQL-Server: O que é a CDA (captura de dados de alterações)?](https://learn.microsoft.com/pt-br/sql/relational-databases/track-changes/about-change-data-capture-sql-server?view=sql-server-ver16)

[Event-Carried State Transfer Pattern](https://rivery.io/data-learning-center/data-replication/)

[7 Data Replication Strategies & Real World Use Cases 2024](https://estuary.dev/data-replication-strategies/)

[Replication Strategies and Partitioning in Cassandra](https://www.baeldung.com/cassandra-replication-partitioning)

[Event-Carried State Transfer: A Pattern for Distributed Data Management in Event-Driven Systems ](https://dev.to/cadienvan/event-carried-state-transfer-a-pattern-for-distributed-data-management-in-event-driven-systems-165h)

[Event-Carried State Transfer: Consistência e isolamento entre microsserviços](https://medium.com/@lauanguermandi/event-carried-state-transfer-consist%C3%AAncia-e-isolamento-entre-microsservi%C3%A7os-89d1937de33d)

[Event-Carried State Transfer Pattern](https://www.grahambrooks.com/event-driven-architecture/patterns/stateful-event-pattern/)

