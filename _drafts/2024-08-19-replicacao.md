---
layout: post
image: assets/images/system-design/replicacao-capa-2.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Replicação de Dados
---

Neste capítulo da nossa série de System Design, vamos explorar os conceitos de escalabilidade de aplicações críticas, com foco especial na replicação de dados. Este tema está diretamente relacionado ao capítulo anterior sobre [Sharding e Particionamento de Dados](/sharding/), já que esses conceitos costumam ser usados em conjunto em diversas abordagens arquiteturais. Nosso objetivo é **apresentar diferentes padrões e estratégias de replicação, demonstrando como esses conceitos podem melhorar a disponibilidade, confiabilidade e performance de sistemas distribuídos**.


<br>

# Definindo Replicação na Engenharia de Software

Imagine as **chaves do seu carro ou da sua casa**. Agora, imagine que **exista apenas uma cópia delas e que você as carregue o dia todo**, acompanhando você na academia, supermercado, trabalho, restaurantes, aniversários, festas, cinema e outros lugares. Agora, **imagine que, infelizmente, você tenha perdido essas chaves em algum desses lugares e só percebeu quando precisou delas**. O que aconteceria? **Você ficaria trancado fora do carro ou de casa, causando um grande problema**. Quando pensamos em replicação de dados, é exatamente esse tipo de problema que queremos evitar. Agora, **imagine que você tenha cópias de reserva distribuídas com diferentes pessoas, como parceiro(a), pai, mãe ou amigos próximos**, ou até mesmo escondidas em **locais estratégicos, como debaixo do tapete da garagem ou dentro de um vaso de plantas**. Essa é uma analogia para o tipo de estratégia que usamos para lidar com replicação.

Na engenharia de software, replicação refere-se ao ato de **criar uma ou mais cópias do mesmo dado em locais diferentes**. Essa é uma prática altamente recomendada, especialmente em sistemas distribuídos, onde consistência, disponibilidade e tolerância a falhas são requisitos mandatórios para garantir a operabilidade do sistema.

Essas réplicas **podem estar localizadas em servidores distintos, datacenters separados geograficamente ou até mesmo em diferentes regiões de nuvens públicas**. O objetivo principal da replicação é **garantir que os dados estejam disponíveis em vários locais**, o que é essencial para sistemas que exigem alta disponibilidade e continuidade dos negócios. Quando falamos de [Bancos de Dados](/teorema-cap/), **a replicação permite que, mesmo em caso de falhas críticas de hardware ou problemas de rede, os dados continuem acessíveis em outros locais**. Ela também garante que o sistema se tornará consistente em algum momento, dependendo apenas do tempo necessário para que uma réplica se torne a nova fonte principal de dados.

Em resumo, o objetivo das estratégias de replicação é garantir que os mesmos dados estejam disponíveis em vários locais, permitindo que o sistema continue operando mesmo que uma parte dele falhe.

<br>

# Modelos de Replicação

Antes de abordarmos as estratégias de replicação, é importante entender alguns modelos pelos quais os sistemas de replicação são construídos. **Independentemente da estratégia adotada para garantir a existência de várias cópias do mesmo dado em diferentes locais ou nós, o modelo de replicação geralmente segue um dos dois principais tipos: Primary-Replica ou Primary-Primary**, também conhecido como **Multi-Master**. Vamos entender conceitualmente essas duas abordagens para estabelecer uma base antes de falarmos sobre as implementações práticas.


## Replicação Primary-Replica

Na Replicação Primary-Replica, **existe um nó primário que recebe todas as operações de escrita e, em seguida, replica essas operações para um ou mais nós secundários, chamados de réplicas**. **As réplicas geralmente são usadas apenas para leitura**, enquanto **todas as operações de escrita são gerenciadas exclusivamente pelo nó primário**. Essa arquitetura é **útil quando se deseja escalar as leituras em um sistema**, distribuindo-as entre as réplicas, mas mantendo a simplicidade no gerenciamento das escritas.

**O nó primário é responsável por garantir a consistência dos dados em todas as réplicas**. Essa abordagem é eficiente em cenários de alta demanda de leitura ou em sistemas que utilizam intensivamente [CQRS](/cqrs/), mas **cria um ponto único de falha no nó primário**. Se o nó primário falhar, **uma das réplicas precisará ser promovida a novo nó primário**, o que pode causar um tempo de inatividade até que esse processo seja concluído.

## Replicação Primary-Primary - Multi-Master

A Replicação Primary-Primary, **também conhecida como Multi-Master Replication**, é uma **arquitetura em que múltiplos nós podem atuar simultaneamente como primários, recebendo tanto operações de leitura quanto de escrita**. Nessa configuração, **qualquer nó pode processar atualizações, e as mudanças são replicadas entre todos os nós**, permitindo alta disponibilidade e escalabilidade de escrita.

![Replicacao Multi-Primary](/assets/images/system-design/replicacao-multi-primary.png)

Esse modelo **elimina o ponto único de falha presente na replicação Primary-Replica e permite maior flexibilidade na distribuição da carga de trabalho**. No entanto, ele também **introduz complexidade adicional, especialmente para resolver conflitos de escrita**. Quando duas operações de escrita ocorrem em diferentes nós primários simultaneamente, o sistema **precisa de uma estratégia para resolver esses conflitos**, como o uso de timestamps para ordenar as operações ou a definição de políticas específicas de resolução de conflitos em casos de [particionamento temporário por falha de rede](/teorema-cap/).


<br>

# Estratégias de Replicação

Nas disciplinas de engenharia, encontramos várias estratégias de replicação, tanto para dados — que geralmente são o foco dessas abordagens devido à sua importância e complexidade — quanto para outras áreas menos convencionais, como replicação de cargas de trabalho completas, domínios de software em cache, entre outros. O objetivo deste capítulo é exemplificar alguns dos modelos de replicação mais utilizados e explicar suas diferenças, vantagens e desvantagens.


## Replicação Total e Parcial

A **Replicação Total refere-se à prática de replicar todos os dados em todos os nós de um sistema**. Isso significa que **cada nó possui uma cópia completa dos dados**. A vantagem dessa abordagem é que ela maximiza a disponibilidade e a resiliência, permitindo que **qualquer nó atenda a uma solicitação do cliente, desde que as operações de escrita sejam amplamente permitidas**. No entanto, como trade-off, essa estratégia pode **aumentar os custos de armazenamento e a latência das escritas**, já que cada nova informação precisa ser replicada e confirmada em todos os nós que compõem o cluster. Esse modelo também é conhecido como **Full-Table Replication**. 

Por outro lado, a **Replicação Parcial distribui apenas uma parte dos dados para cada nó**. Assim, **cada nó contém apenas uma fração dos dados totais**. Esse modelo é **mais eficiente em termos de armazenamento e reduz a latência nas operações de escrita**, mas **aumenta a complexidade nas leituras**, pois os dados solicitados podem não estar disponíveis localmente e podem exigir comunicação entre nós. Isso pode fazer com que o cliente precise consultar vários nós, ou que o sistema de consultas abstraia essa complexidade. Para localizar os dados entre os nós, é comum implementar algoritmos de [Sharding](/sharding/), como o **Hashing Consistente**.


## Replicação Síncrona

Na Replicação Síncrona, **todas as alterações nos dados devem ser replicadas em todos os nós antes que a operação seja considerada bem-sucedida**. Isso **garante consistência forte entre os nós**, ou seja, todos eles terão os mesmos dados em qualquer momento.

![Replicação Síncrona](/assets/images/system-design/replicacao-sincrona.png)

Em um cenário onde um cliente precisa salvar uma informação em um cluster que, por exemplo, oferece funcionalidades de cache, ele envia o dado, em formato de chave e valor, para o endpoint primário do cluster de cache. **Esse endpoint é responsável por distribuir o dado entre todos os nós do cluster**. A solicitação **só é finalizada e confirmada ao cliente quando essa operação é concluída por completo**.

A replicação síncrona tem **vantagens em cenários onde a consistência é crítica**, como em sistemas de pagamento ou bancos de dados financeiros, onde **qualquer discrepância entre os nós pode causar grandes problemas**. No entanto, essa abordagem **pode aumentar a latência**, especialmente quando os nós estão distribuídos geograficamente ou em grande quantidade.


## Replicação Assíncrona

Na Replicação Assíncrona, **as alterações de dados são enviadas a um dos nós de um cluster e replicadas para os outros nós de forma eventual**, o que **significa que a operação pode ser considerada bem-sucedida sem que todas as réplicas tenham sido atualizadas**. Isso resulta em **maior desempenho nas operações de escrita**, pois **o sistema não precisa esperar pelas confirmações de todos os nós**. No entanto, pode ocorrer uma **inconsistência eventual** em consultas subsequentes, já que **os dados podem não ter sido totalmente replicados nos demais nós**, podendo existir diferentes versões do dado até que a replicação seja concluída.

![Replicação Assíncrona](/assets/images/system-design/replicacao-assincrona.png)

A **replicação assíncrona é amplamente utilizada em cenários onde a disponibilidade e o desempenho são mais importantes do que a consistência imediata**, como em redes sociais, assets em uma CDN, dados menos críticos usados para reduzir acessos a uma origem, clusters de cache e afins.


## Replicação Semi-Síncrona

A Replicação Semi-Síncrona **combina aspectos da replicação síncrona e assíncrona**. Nesse modelo, **pelo menos uma réplica, ou um pequeno subconjunto de réplicas, deve confirmar a gravação dos dados** antes que a operação seja considerada bem-sucedida. As demais réplicas podem ser atualizadas de forma assíncrona.

![Replicação Semi-Síncrona](/assets/images/system-design/replicacao-semi-sincrona.png)

Esse tipo de replicação **oferece um equilíbrio entre consistência e desempenho**. Ele adiciona níveis extras de resiliência, **garantindo que os dados sejam gravados em pelo menos um nó de forma síncrona**, enquanto mantém baixa latência ao **não exigir que todas as réplicas sejam atualizadas imediatamente**. Em alguns bancos de dados, como MySQL e MariaDB, **a operação de escrita é confirmada assim que um nó secundário grava os dados**. **Outros nós podem receber as atualizações posteriormente de forma assíncrona**, oferecendo um grau adicional de consistência sem comprometer totalmente a performance.


## Replicação por Logs

A Replicação por Logs **é uma abordagem em que todas as operações realizadas em um sistema são registradas em um log de operações sequenciais**, e **esse log é então replicado para outros nós do cluster, que executam as mesmas operações**. Em vez de replicar o estado completo dos dados, o sistema replica as mudanças, **permitindo que as réplicas apliquem essas alterações localmente e mantenham seus dados consistentes**.

![Replicação por Logs](/assets/images/system-design/replicacao-logs.png)

Essa abordagem é vantajosa em **cenários onde as alterações são mais frequentes que as leituras** ou onde o volume de dados é muito grande, pois **apenas as modificações são replicadas**, reduzindo a quantidade de dados trafegados entre os nós do cluster. Esse tipo de replicação é comum em **tecnologias que permitem interoperabilidade entre múltiplas regiões de nuvens públicas, datacenters ou zonas de recuperação de desastres**.

Tecnologias amplamente conhecidas e maduras, como o [Apache Kafka e outras plataformas de streaming e eventos](/mensageria-eventos-streaming/), utilizam replicação por logs em sua arquitetura de nós e réplicas. Em Kafka, cada tópico é composto por múltiplas partições, e as alterações nessas partições são registradas em logs de transações que são replicados entre os brokers, garantindo durabilidade e resiliência.


<br>

# Arquitetura

As estratégias de replicação **podem ser aplicadas manualmente na engenharia de software para resolver diversos desafios arquiteturais**. Embora a replicação seja frequentemente associada a funcionalidades prontas, como em caches ou bancos de dados, é importante entender que, conceitualmente, **ela pode ser usada de forma muito mais ampla**. Quando adotada de maneira estratégica, a replicação **permite escalar sistemas distribuídos de forma inteligente e eficiente**. A seguir, exploraremos algumas abordagens arquiteturais que utilizam replicação, combinada com outras técnicas, para melhorar o desempenho e a escalabilidade de sistemas de grande porte.


## Event-Carried State Transfer - Replicação de Estados e Objetos de Domínios

Em grandes sistemas, especialmente em arquiteturas corporativas complexas, uma solução eficaz para lidar com a alta disponibilidade de grandes volumes de dados é o **Event-Carried State Transfer**.

Esse padrão **permite que o estado de um objeto seja transmitido entre serviços ou domínios de software por meio de eventos**. Ele **combina estratégias de cache, sistemas baseados em eventos e replicação de dados**, proporcionando uma maneira custosa, porém poderosa, de lidar com grandes volumes de dados sem aumentar o nível de acoplamento.

A ideia central é que, **sempre que houver uma atualização em uma entidade de um domínio**, essa mudança seja publicada em tópicos de eventos. **Os demais serviços que dependem desse domínio podem consumir esses eventos e atualizar suas próprias bases de dados locais**, **criando uma cópia em cache do estado**. Isso é especialmente útil em **sistemas que toleram consistência eventual**, pois, em vez de consultar uma fonte centralizada a cada solicitação, os serviços mantêm e utilizam suas próprias versões dos dados, que são atualizadas conforme os eventos são processados. Em sistemas complexos e altamente distribuídos, a relação custo-benefício dessa abordagem pode se tornar viável.

![State Transfer](/assets/images/system-design/state-transfer.drawio.png)

Imagine um sistema governamental que compartilha os dados dos cidadãos entre diferentes sistemas de diversos órgãos, como bancários, fiscais, entidades de segurança, sistemas de trânsito, imobiliário e social. Pensando nesse caso orientado a eventos, sempre que o cidadão atualizar seu estado civil, renda, endereço ou telefone de contato em um sistema central de cadastro, essa informação seria notificada por um evento, e cada um desses sistemas de órgãos públicos o consumiria, atualizando sua base cadastral.


<br>

## Replicação por Change Data Capture - Captura de Alterações em Dados

O **Change Data Capture (CDC)** é uma técnica que detecta e captura as alterações feitas em uma fonte de dados, como um **[banco de dados relacional ou não relacional](/teorema-cap/)**, e as **transmite para outros sistemas em tempo real**. Isso **permite que outros serviços sejam imediatamente atualizados sem a necessidade de consultar diretamente o banco de dados original**. Essa abordagem é muito útil para **sincronizar dados entre diferentes sistemas**, alimentar filas de mensagens ou manter caches atualizados com as informações mais recentes.

![CDC](/assets/images/system-design/cdc.drawio.png)

O objetivo desse padrão é oferecer um mecanismo que **monitora operações como inserções, atualizações e deleções**, **capturando essas mudanças à medida que ocorrem**. Depois de capturadas, as **alterações podem ser enviadas para tópicos de eventos ou diretamente para sistemas que dependem desses dados**. Isso possibilita que outros serviços recebam as informações mais recentes **sem sobrecarregar o banco de dados principal com consultas constantes**.

![Replicação Proativa](/assets/images/system-design/replicacao-proativa.drawio.png)

Essa técnica serve como base para outras estratégias, como o **Event-Carried State Transfer**, que se beneficia da captura de eventos para replicar dados de forma inteligente e proativa. O CDC também viabiliza processos que envolvem streaming de dados para datalakes, **[cacheamento proativo](/caching/)** e **[CQRS](/cqrs/)**, atuando como uma ponte reativa que facilita a replicação e a integração com outros padrões.


<br>

### Revisores

* [Tarsila, o amor da minha vida](https://twitter.com/tarsilabianca_c)

<br>

### Referências

[What is data replication?](https://www.manageengine.com/device-control/data-replication.html)

[What is Change Data Capture?](https://www.qlik.com/us/change-data-capture/cdc-change-data-capture)

[O que é Change Data Capture](https://triggo.ai/blog/o-que-e-change-data-capture/)

[SQL-Server: O que é a CDA (captura de dados de alterações)?](https://learn.microsoft.com/pt-br/sql/relational-databases/track-changes/about-change-data-capture-sql-server?view=sql-server-ver16)

[Event-Carried State Transfer Pattern](https://rivery.io/data-learning-center/data-replication/)

[7 Data Replication Strategies & Real World Use Cases 2024](https://estuary.dev/data-replication-strategies/)

[Replication Strategies and Partitioning in Cassandra](https://www.baeldung.com/cassandra-replication-partitioning)

[Event-Carried State Transfer: A Pattern for Distributed Data Management in Event-Driven Systems ](https://dev.to/cadienvan/event-carried-state-transfer-a-pattern-for-distributed-data-management-in-event-driven-systems-165h)

[Event-Carried State Transfer: Consistência e isolamento entre microsserviços](https://medium.com/@lauanguermandi/event-carried-state-transfer-consist%C3%AAncia-e-isolamento-entre-microsservi%C3%A7os-89d1937de33d)

[Event-Carried State Transfer Pattern](https://www.grahambrooks.com/event-driven-architecture/patterns/stateful-event-pattern/)

