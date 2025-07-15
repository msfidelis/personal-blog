---
layout: post
image: assets/images/system-design/capa-storage.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Databases
---

O objetivo desse artigo é mostrar as principais implementacões e suas diferenças, para que as mesmas fiquem claras para eventuais escolhas arquiteturais. 

# Definindo um Banco de Dados

Um Banco de dados, em essência, é **uma forma de organizar dados dentro de uma estrutura predefinida que pode ser armazenada, gerenciada e disponibilizada para acesso de escrita e leitura através de um padrão de consulta pré-estabelecido.** Um banco de dados trabalha como uma **camada intermediária entre o cliente e o dado**, permitindo que os mesmos sejam manipulados sem que o desenvolvedor precise lidar de temas de alocação em disco, indexação e algoritmos de distribuição para buscar o dado de forma performática. Esse dado pode estar sendo persistido em [storages duráveis](/storage/), temporários ou uma combinação de ambos, escolhas que variam de sua implementação. 

Em arquiteturas distribuídas, o papel de um banco de dados pode adquirir complexidades adicionais para elevar o nível de consistência, disponibilidade e performance, principalmente trabalhando com camadas de replicação geográticas, baixa latência ou realizando a melhor escolha entre consistência forte ou consistência eventual para as operações que precisam ser realizadas nos dados. 


# Tipos de Bancos de Dados

Quando avaliamos o banco de dados para uma determinada solução, devemos sempre tratar a escolha como um "racional de features" de cada um, e onde cada uma delas agrega ou ofende os níveis de performance, consistência e custo que o mesmo precisa. Para tornar isso um pouco mais claro, vamos abordar de forma macro, porém bem detalhada a nível arquitetural, as principais possibilidades que podemos encontrar para nos auxiliar nas definições de engenharia de um produto. Esse tipo de cuidado é essencial para evitar escolhas que possuam muitas features que não são utilizadas pelo produto, enquanto não agrega nos requisitos do mesmo. 

## Bancos de Dados Relacionais SQL

Os bancos de dados SQL (Structured Query Language) são baseados num modelo proposto por **Edgar F. Codd em 1970**, sendo **o modelo mais conceituado entre as opções arquiteturais**. O modelo é um organizado em tabelas **compostas por tuplas (linhas) e atributos (colunas)** e possuem features que **viabilizam schemas e estruturas rígidas**, definindo por um contrato os **tipos de dados, restrições de integridades, indentificadores únicos e regras de coerencia entre os relacionamentos das tabelas**. Os bancos relacionais, como o próprio nome diz, são pensados para **proporcionar relacionamentos internos e declarativos entre os dados de diferentes tabelas**. A engenharia de software faz uso desse modelo relacional para trabalhar com entidades e agregados dentro de [contextos de domínios](/monolitos-microservicos/) de um software. Esses bancos contam normalmente com features do modelo [ACID, como Atomicidade, Consistencia, Integridade e Durablidade](/teorema-cap/). 

## Banco de Dados Não-Relacionais NoSQL

Os bancos Não Relacionais, ou NoSQL (Not Only SQL), são uma proposta mais flexivel aos modelos rigidos dos bancos SQL, trocando níveis altos de consistencia e integridade por escalabilidade. Os bancos NoSQL por padrão utilizam outros formatos de dados além de tabelas e linhas, e não possuem relacionamentos diretos entre os seus conjuntos de dados, tendo schemas mais flexiveis e com consistência eventual em troca de maior desempenho de leitura, escrita, escalabilidade horizontal e distribuição. 

São nos bancos NoSQL que encontramos maior diversidade de formatos, como chave-valor, JSON, BSON, Grafos e etc, sendo que o principal foco é evitar joins custosos a favor de modelos de dados mais simples e com regras mais mutáveis, o que pode acarretar tanto em maior performance quanto também gerar riscos de incosistências de tipos de dados e contratos que precisam ser respeitados do lado da aplicação que consome o dado de fato. 

## Bancos de Dados NewSQL

O maior desafio dos sistemas distribuídos é conviver com tradeoffs encontrados nas camadas de dados. Os bancos NewSQL são databases que focam sua implementação em conciliar os dois mundos, buscando dar uma confiança transacional e relacional para as operações vindas dos modelos SQL e ainda agregar features de escalabilidade horizontal e alto throughput dos modelos NoSQL.

As implementações de databases NewSQL costumam ser extremamente focadas em necessidades distribuídas, realizando operações de [sharding](/sharding/) e [replicação](/replicacao/) de forma transparente e sincrona para garantir a confiabilidade ACID das transações mas aplicando protocolos de consenso distribuida para realizar isso de forma mais distribuída e performática possível. 

## Bancos de Dados em Memória

Os databases em memoria, ou in-memory databases, são bancos de dados especializados em volatilidade e realizar a gestão de seus dados diretamente na RAM do servidor ao invés de tratar a persistência de forma durável em [discos e volumes físicos](/storage/). 

O objetivo dos bancos de dados em memória é reduzir latência e tempos de resposta da consulta do dado, uma vez que uma consulta em memória volátil pode ser realizado em nanosegundos na RAM ao invés de milisesegundos em um acesso em disco, cenário que pode ser agravado por um uso intensivo de I/O do volume. 

Os modelos de dados encontrados nesse tipo de implementação costumam ser extremamente simples, e seu melhor uso possível se baseando em chave-valor e combinado com outros tipos de databases duráveis, sendo pensados para sistemas de [cache](/caching/) de dados, fazendo uma camada de acesso rápido para dados caros e que não são alterados com grande frequência. 

Utilizar somente a memória RAM para armazenar dados presume uma série de tradeoffs consideráveis, como assumir a não-durabilidade do dado, uma vez que sendo reiniciado o serviço ou o servidor, todos os dados podem ser perdidos, logo o uso só é recomendado para dados que podem ser reconstituidos a qualquer momento diretamente de sua origem, além de sua escalabilidade costumar ser financeiramente cara de forma [horizontal e vertical](/performance-capacidade-escalabilidade/).


## Time-Series Databases 

Os bancos de dados baseados em tempo são especializados em armazenar séries temporais com indexação baseada por tempo, e também são conhecidos como TSDBs (Time-Series Data Bases). Cada registro inserido em um Time Series Database é como um "carimbo" temporal preciso daquela métrica ao decorrer do tempo. Os modelos desse tipo de banco de dados implementam o armazenamento por "append-only", registrando cada ponto do dado de forma sementada e sequencial. Esse tipo de banco de dados é utilizado em sistemas de observabilidade e monitoramento, sendo utilizado para acompanhar o desempenho de determinada métrica ao decorrer de longos períodos de tempo, como horas, dias, semanas, meses e até anos, garantindo buscas tápidas além da capacidade de realizar diversas operações e calculos matemáticos nas mesas de forma performática e barata, além de alta capacidade de ingestão de dados distibuídos através de endpoints centralizados e escaláveis. 

Os principais usos dos TSDB's são agregadores de logs, métricas, preços, medições sequenciais de IOT e etc. 

Esse tipo de database possui também features inteligentes de expurgo de dados expirados, afim de gerenciar de forma mais performática o storage para comportar diversas métricas ao correr do tempo. 


# Modelos de Dados 

## Modelos Relacionais 

## Modelos de Documentos

Bancos de dados orientados a documentos, cada registro é um uma entidade completamente autonoma e geralmente com formato livre e sem restrições e consistencias de campos, normalmente sendo estruturados em JSON ou BSON. Esse modelo flexivel facilita evoluir a estrutura de dados e contratos pela ótica da aplicação consumidora sem a necessidade de migrações complexas e operações imperativas que atuam na estrutura geral. Os modelos de documentos normalmente são utilizados para agrupar dados relacionados direto no mesmo objeto ou entidade e fornecerem indexação invertida ou full-text search, permitindo buscar por padrões de dados em todo o documento sem necessariamente se prender a uma condição de busca baseada em um campo específico. Seus filtros são estruturados sobre atributos aninhados, agregações e pipelines de transformação, suportando indexação em campos internos de forma flexivel e performática. 

Seus usos mais comuns estão em implementações de catalogos de produtos, historicos de clientes, historicos de paciêntes, agregadores de logs armazenamento de crawlers e outros usos que precisam fornecer agregações, sumarizações e buscas flexíveis e desestruturadas. É comum os bancos de dados orientados a documentos serem uma segunda camada de consulta após transformações de dados, sendo uma forma otimizada de consultas para implementações [CQRS](/cqrs/).

## Modelos Colunares (Wide-Column)

Os modelos de dados colunares são inspirados em sistemas como o Apache Cassandra ou o Google Bigtable. Os modelos transacionais organizam seus dados em formatos de colunas e linhas dentro de uma tabela. Todos os dados dessa tabela possuem o mesmo número de variáveis colunares, e caso você precise adicionar uma nova coluna para adicionar um atributo novo nos dados da tabela, essa coluna será inserida em toda a tabela com adotando valores nulos ou default caso definido no schema. Os bancos de dados colunares ainda possuem o conceito de linhas, porém cada registro pode conter seu próprio conjunto de colunas. 

Os dados são organizados em famílias de colunas agrupadas ao redor de chaves de linha. Para assimilar como funciona o agrupamento e recuperação dos dados, linha pode ter um conjunto diferente de colunas e essas colunas são agrupadas em "famílias de colunas", e quando você precisa buscar os dados dessas colunas de forma explicita via query de consulta, o sistema do banco de dados busca apenas as linhas que estão dentro dessas familias de colunas. Isso é eficiente quando temos conjuntos de dados dispersos, séries temporais, data-warehouses, data lakes desestruturados e dispersos. 

As implementações de databases wide-column são adaptados para lidar com replicação e e sharding de forma distribuída com capacidade de escala até milhares de nós, com pontos únicos de falha reduzidas e schemas altamente flexíveis a custo de consistência eventual e capacidade de transações atômicas e joins limitados entre tabelas e famílias limitados. 

## Modelos Key-Value (Chave-Valor)

Os bancos chave-valor, ou key-value, talvez sejam o tipo mais simples de bancos de dados NoSQL que podemos encontrar e trabalhar. Como o próprio nome sugere, eles armazenam seus dados em uma coleção de paridade, sendo uma chave que funciona como um identificador único para o dado no conjunto e o valor que pode estar em diversos formatos não estruturados, esses que variam de simples strings, números, valores booleanos, JSON's e até mesmo blobs complexos. Os exemplos mais notáveis que temos são as engines de cache como Redis, Valkey e Memcached, mas quando devidamente configurados e modelados, podemos encontrar implementações até mesmo em databases como MongoDB, DynamoDB, Elasticsearch e etc. 

Sua performance está embasada na extrema facilidade de indexação e recuperação do dados, pois o mesmo ocorre diretamente pela chave previamente composta e conhecida pelo cliente, e permite facilmente uma replicacão e distribuição para suportar grandes volumes de acesso e armazenamento, além da simplificação da forma de acesso, sendo realizado normalmente através de protocolos já bem estabelecidos diretamente via [TCP/IP](/protocolos-de-rede/) ou implementações [RESTful](/padroes-de-comunicacao-sincronos/), evitando a utilização de protocolos complexos. 


## Modelos Baseados em Grafos

Os bancos de dados baseados em grafos são tecnologias implementadas em estruturas onde o relacionamento entre as entidades é mais, ou tão quão importantes quanto o próprio dado em si. Comparando com os modelos SQL onde os relacionamentos são criados baseados em chaves estrangeiras entre tabelas e JOIN's criados durante a consulta, os bancos de grafos aplicam o conceito de nodes (entidades) e arestas (relacionamentos) como os objetos de primeira classe, permitindo relacionar vários tipos de dados entre diferentes entidades. Os dados são propriedades chave-valor chamados de vértices, e as arestas que conectam os semelhantes desses dados. Isso permite realizar de forma performática consultas que precisam responder questões como "alunos da turma da manhã que moram no mesmo bairro e possuam uma média escolar maior que 8", ou "encontre amigos de amigos que vivem na mesma cidade e trabalharam na mesma empresa" sem a necessidade de JOIN's custosos em difersas tabelas relacionais. 

O uso dos bancos de dados baseados em grafos podem ser implementados para encontrar relacionamentos e proporcionar features de recomendação de produtos com base no comportamento de certos tipos de usuários parecidos, análise de redes sociais, modelagem de ameaças, análises de fraude e estudar cadeias de valor e de logística de forma complexa. As consultas de um banco de grafos deve levar em conta o grau e complexidade dos vértices, a seletividade de padrões e a cardinalidade de seus valores e familiaridades para construir padrões que minimizem leituras aleatórias de disco 


# Armazenamento e Indexação

A forma a engine do banco de dados realiza seu armazenamento e indexação impacta diretamente em termos de desempenho e flexibilidade na forma de escrita, leitura e operações complexas que podem ser realizadas nos conjuntos de dados. O objetivo desse tópico e descrever as principais formas de indexação e armazenamento que podem ser encontrados nas engines de mercado e quais seus principais tradeoffs existentes. 

## Page Size 

O storage baseado em páginas, prevê que os dados serão armazenados em blocos de dados de tamanho fixo e configurável. Databases orientados em linha, como os bancos relacionais e alguns não-relacionais, armazenam chunks de dados contendo multiplas tuplas em páginas de tamanhos como 4 KB, 8 KB ou 16 KB junto a diversos metadados para controlar relações e indexação. O principal tradeoff desse tipo de implementação se baseia no tamanho da página. Page Sizes maiores reduzem a satuação de leituras de diversos objetos, evitando a abertura e leitura desnecessária para agregar e organizar dados sequenciais, porém elevam o custo de transferência de dados para consultas simples onde apenas alguns dados são realmente necessários. Em contraparte, páginas menores minimizam leituras desnecessários em blocos de dados sem relacionamento, porém geram um número muito maior de operações de [I/O de disco](/storage) para leituras longas e complexas.

Diversos bancos SQL e NoSQL aplicam o conceito de Page Size paralelo a outros tipos de armazenamento de indexação, como MySQL (InnoDB), MariaDB (InnoDB), PostgreSQL e SQL Server. Todos eles dispersam e armazenam seus dados em blocos de tamanhos fixos em memória ou em disco. 

## Formato Colunar 

A indexação por formato colunar, ou column-based indexing, especifica padrões onde cada coluna de uma tabela é escrita em um segmento contínuo no sistema de arquivos. Essa separação, por mais que contra intuitiva a respeito de I/O, permite que as consultas sejam específicas ao nível de atributos recuperados, permitindo recuperar somente os compos necessários que foram específicados. Nesse sentido, temos uma redução de I/O considerável quanto otimizamos as pesquisas e processos analíticos. Esse tipo de cenário também facilita aplicar operações matemáticas diretamente nas consultas do banco.  Esse tipo de formato também facilita compressão quando os dados são pouco diversificados e heterogêneos, facilitando a aplicação de algoritmos de compressão por dicionários. 

Bancos de dados otimizados para analytics, big data, data-warehouses como Redshit, BigUQery, MemSQL e SQL Server em modo Columnstore Index utlizam esse tipo de arquitetura de armazenamento e indexação. 

## Log-Structured

Os Log-Structured Systems também são conhecidos pelo termo LSM-Tree, ou Log-Structured Merge-Tree, aplicam modelos de dados que são salvos primeiro em tabelas em memoria (memtable) e após isso são exportados para arquivos imutáveis no disco (sstables) num modelo de append-only pattern. O modelo append-only, oferece extrema performance de escrita e baixa latência de confirmação do recebimento da transação, pois evita ao máximo consultas em disco para realizar qualquer tipo de operação, porém impedem atualização de registros, ao invés disso são inseridas "versões mais recentes" do dado, o mesmo pode acontecer com a deleção do dado, que dependendo da implementação pode não ser possível. Esse tipo de cenário é ideal para sistemas que precisam garantir transações sequenciais e imutáveis para auditoria e rastreabilidade de modificações, pois mantém todas as versões anteriores que ainda podem ser recuperadas se necessário, permitindo a implementação de ledger tables, livros caixa, registros e rastreabilidade de transações financeiras, trace de operações de usuários em sistemas críticos e etc. 

Engines como BigTable, DynamoDB, Apache Cassandra, InfluxDB e ScyllaDB implementam o modelo de LSM-Tree para escrita e indexação posterior para otimizar sua escrita em troca de consistência eventual e performance. 


## Indexação B-Tree e B+Tree

A indexação por B-Tree, ou Binary Tree, ou Arvore Binária, aplicam estruturas de dados de busca e armazenamento aplicando o conceito de arvores auto-balanceadas. PAra isso os dados precisam ser catalogados e classificados, permitindo buscas, inserções, atualizações e deleções em tempo logarítmico. Uma arvore binária consiste em nós. Cada nó pode ter um certo número de chaves (dados de indexação) e ponteiros para outros nós (filhos). Os nós internos (não-folha) armazenam chaves e ponteiros para os nós filhos. Os nós folha armazenam as chaves e os ponteiros para os registros de dados reais no disco.

A implementação de B+Tree, ou B-PLus Tree otimiza ainda mais a busca e demais operações dentro de uma engine de bancos de dados. 

## Indexação por Hashing

## Indices Invertidos

# Arquitetura 

## Compressão e Encoding


## Cenários Transacionais 

## Cenários de Write-Intensive 

## Cenários de Read-Intensive 

## Consistencia Forte e Consistencia Eventual 


## Padrão de Acesso aos Dados

### Chave Única / Primária 

### Consultas Complexas e Indices

### Consultas por Padrões e Indices

### Full-Text Searchs


## Referências 

[A Relational Model of Data for Large Shared Data Banks, 1970 - E. F. CODD - IBM Research Laboratory, San Jose, California](https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf)

[Edgar F. Codd](https://dblp.org/pid/c/EFCodd.html)

[Banco de dados NoSQL, SQL e NewSQL: diferenças e vantagens](https://blog.geekhunter.com.br/banco-de-dados-nosql/)

[SQL, NoSQL ou New SQL?](https://medium.com/@habbema/sql-no-ou-new-sql-b8059921cd5b)

[SQL vs NO SQL vs NEW SQL](https://www.geeksforgeeks.org/dbms/sql-vs-no-sql-vs-new-sql/)

[NoSQL vs NewSQL vs Distributed SQL: A Comprehensive Comparison](https://dev.to/ankitmalikg/nosql-vs-newsql-vs-distributed-sql-a-comprehensive-comparison-lm7)

[What is NewSQL?](https://www.dremio.com/wiki/newsql/)

[SQL, NewSQL, and NOSQL Databases: A Comparative Survey](https://ieeexplore.ieee.org/document/9078970)

[Clash of Database Technologies: SQL vs. NoSQL vs. NewSQL](https://aaron-russell.co.uk/blog/sql-vs-nosql-vs-newsql/)

[Wide-column Database Definition FAQ's](https://www.scylladb.com/glossary/wide-column-database/)

[Cassandra Column Family](https://www.scylladb.com/glossary/cassandra-column-family/)

[Pages and extents architecture guide](https://learn.microsoft.com/en-us/sql/relational-databases/pages-and-extents-architecture-guide?view=sql-server-ver17)

[Choosing a Large or Small Page Size](https://ibexpert.com/docu/doku.php?id=02-ibexpert:02-01-getting-started:registering-a-database:page-sizes)

[Índices columnstore: visão geral](https://learn.microsoft.com/pt-br/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)

[Row-based vs. Column-based Indexes](https://www.linkedin.com/pulse/row-based-vs-column-based-indexes-ayman-elnory/)