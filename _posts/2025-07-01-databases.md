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

<br>

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

<br>

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

Os bancos de dados baseados em grafos são tecnologias implementadas em estruturas **onde o relacionamento entre as entidades é mais, ou tão  importantes quanto o próprio dado** em si. 

Comparando com os modelos SQL onde os relacionamentos são criados baseados em chaves estrangeiras entre tabelas e JOIN's criados durante a consulta, **os bancos de grafos aplicam o conceito de nodes (entidades) e arestas (relacionamentos) como os objetos de primeira classe, permitindo relacionar vários tipos de dados entre diferentes entidades**. Os dados são **propriedades chave-valor chamados de vértices, e as arestas que conectam os semelhantes desses dados**. Isso permite realizar de forma performática consultas que precisam responder questões como "alunos da turma da manhã que moram no mesmo bairro e possuam uma média escolar maior que 8", ou "encontre amigos de amigos que vivem na mesma cidade e trabalharam na mesma empresa" sem a necessidade de JOIN's custosos em difersas tabelas relacionais. 

O uso dos bancos de dados baseados em grafos podem ser implementados para **encontrar relacionamentos e proporcionar features de recomendação de produtos com base no comportamento de certos tipos de usuários parecidos**, análise de redes sociais, modelagem de ameaças, análises de fraude e estudar cadeias de valor e de logística de forma complexa. As consultas de um banco de grafos deve levar em conta o grau e complexidade dos vértices, a seletividade de padrões e a cardinalidade de seus valores e familiaridades para construir padrões que minimizem leituras aleatórias de disco 

<br>

# Armazenamento e Indexação

A forma **como a engine de um banco de dados** realiza seu armazenamento e indexação impacta diretamente o **desempenho e a flexibilidade** das operações de escrita, leitura e consultas complexas sobre os conjuntos de dados. O objetivo deste tópico **é descrever** as principais formas de indexação e armazenamento **encontradas** nas engines de mercado e seus principais trade-offs existentes.

Sem a devida indexação, o **banco de dados** em questão precisaria escanear **toda a tabela ou coleção** para encontrar os dados desejados. Esta é uma operação extremamente lenta em tabelas grandes, **inviabilizando** uma escalabilidade saudável. Nesse tópico, **iremos explorar** alguns conceitos comuns entre as implementações de bancos de dados que **auxiliarão na compreensão** dessas operações.

## Page Size (Tamanho da Página)

O **armazenamento de páginas** em databases prevê que os dados serão organizados e armazenados em **blocos de dados de tamanho fixo e configurável** no banco de dados. Esses blocos são conhecidos como páginas. Bancos de dados **orientados a linhas**, como a maioria dos bancos de dados relacionais e alguns não-relacionais, armazenam **chunks (pedaços) de dados** contendo múltiplas tuplas (linhas) dentro dessas páginas. Tamanhos comuns de páginas são 4 KB, 8 KB ou 16 KB, e elas também contêm diversos metadados para controlar relações e indexação.

O principal trade-off dessa implementação reside no tamanho da página, pois **Páginas maiores** tendem a **reduzir o número de operações de I/O** necessárias para leituras de grandes volumes de dados ou para buscar múltiplos objetos fisicamente próximos. Isso otimiza a leitura de dados sequenciais, pois mais informações são transferidas em uma única operação. No entanto, elas **elevam o custo de transferência de dados** para consultas mais simples, onde apenas alguns dados são realmente necessários, já que uma página inteira é lida desnecessariamente. Em contrapartida, **páginas menores** **minimizam a leitura de dados irrelevantes** para consultas que acessam poucos dados ou blocos de dados não relacionados. Contudo, elas geram um **número muito maior de operações de I/O de disco** para leituras extensas e complexas, pois mais páginas individuais precisam ser carregadas.

Diversos bancos de dados SQL e NoSQL aplicam o conceito de Page Size em conjunto com outros tipos de armazenamento e indexação. Exemplos notáveis incluem **MySQL (InnoDB), MariaDB (InnoDB), PostgreSQL e SQL Server**. Todos eles organizam e armazenam seus dados em blocos de tamanhos fixos, seja em memória ou em disco.

## Formato Colunar 

A indexação por **formato colunar, columnar format, ou column-based indexing**, especifica padrões onde cada coluna de uma tabela é **escrita em um segmento contínuo no sistema de arquivos**. Essa separação, por mais que contra intuitiva a respeito de I/O, *permite que as consultas sejam específicas ao nível de atributos recuperados, permitindo recuperar somente os compos necessários que foram específicados*. Nesse sentido, temos uma redução de I/O considerável quanto otimizamos as pesquisas e processos analíticos. Esse tipo de cenário também facilita aplicar operações matemáticas diretamente nas consultas do banco.  

Outro grande benefício é a **compressão de dados**. O formato colunar agrupa dados **homogêneos** (com pouca diversidade ou muitos valores repetidos) da mesma coluna, o que é ideal para a aplicação de algoritmos de compressão altamente eficazes, como a compressão por dicionários. Isso economiza muito espaço em disco e melhora ainda mais o desempenho de I/O.

Bancos de dados e engines otimizados para analytics, big data e data warehouses, como **Amazon Redshift, Google BigQuery, MemSQL e SQL Server (com seu modo Columnstore Index)**, utilizam esse tipo de arquitetura de armazenamento e indexação para alcançar alta performance em consultas complexas e analíticas.

## Log-Structured

Os Log-Structured Systems, frequentemente implementados através do padrão **LSM-Tree (Log-Structured Merge-Tree)**, aplicam modelos de dados que são salvos primeiro em tabelas em memória (memtables) e, posteriormente, exportados para arquivos imutáveis no disco (sstables) em um modelo de **append-only**.

O modelo **append-only** oferece **extrema performance de escrita e baixa latência de confirmação** do recebimento da transação, pois as operações de escrita são sequenciais (adicionadas ao final) e evitam ao máximo consultas aleatórias em disco. No entanto, ele **não realiza atualizações in-place** de registros. Ao invés disso, **novas "versões" do dado são inseridas** como novos registros. Da mesma forma, a **deleção de um dado** é tipicamente realizada através da inserção de um registro especial chamado **"tombstone"** (lápide), que marca o dado como logicamente excluído. A remoção física dos dados antigos ou marcados com tombstone ocorre posteriormente, durante um processo de **compactação** (merge) dos sstables.

Esse tipo de cenário é ideal para sistemas que precisam garantir **transações sequenciais e imutáveis** para auditoria e rastreabilidade de modificações, pois mantém todas as versões anteriores do dado que ainda podem ser recuperadas se necessário. Isso permite a implementação de **ledger tables**, livros-caixa, registros de auditoria e rastreabilidade de transações financeiras, **trace** de operações de usuários em sistemas críticos, entre outros.

Engines de banco de dados como **BigTable, DynamoDB, Apache Cassandra, InfluxDB e ScyllaDB** implementam o modelo de LSM-Tree para otimizar sua escrita e indexação posterior, **facilitando designs que priorizam alta performance de escrita e escalabilidade horizontal, muitas vezes em detrimento de uma forte consistência transacional imediata, caminhando para modelos de consistência eventual.**


## Indexação B-Tree (Árvores B)

A **B-Tree (ou Árvore B)** é uma estrutura de dados autobalanceada, projetada para gerenciar grandes volumes de informações armazenados em storages e volumes. Uma B-Tree é uma **árvore "multi-way"**, onde cada nó pode conter **várias chaves e múltiplos ponteiros** para outros nós. Essa característica permite que a árvore seja mais "larga" e menos "profunda", otimizando o acesso a dados em disco, ao contrário de implementações de Binary Tree's que podem ter alta profundidade.

Os dados são armazenados de forma ordenada dentro dos nós, permitindo buscas, escritas, upgrades e deleções em **tempo logarítmico**. O armazenamento em B-Tree é construído para possibilitar que cada nó que contém uma parcela do dado seja alocado perfeitamente em um **bloco de disco**. Isso minimiza a quantidade de operações de leitura e escrita em disco, diminuindo as operações de I/O, que costumam ser os maiores ofensores de bancos de dados grandes. 

Quando você busca uma chave, o sistema carrega apenas os poucos blocos de disco necessários para percorrer o caminho do nó raiz até o nó onde a chave ou o ponteiro para o dado está localizado. Essa estratégia permite que, mesmo em tabelas gigantescas, as buscas sejam rápidas e com poucas operações.


## Indexação por Hashing

A indexação baseada em hashing é uma técnica que permite localizar itens e valores em uma tabela através de **valores exatos, ou _exact-matches_**. Ao contrário de estruturas como as **B-trees (ou Árvores B+)**, que são otimizadas para **buscas de intervalo (_range queries_)** e minimizam operações de I/O de disco através de saltos logarítmicos, a indexação por hashing é projetada para **buscas diretas** e instantâneas.

Três conceitos fundamentais para a aplicação desse tipo de indexação são as **funções hash**, as **tabelas hash** e os **buckets**. Uma **função hash** é responsável por providenciar uma forma **determinística** e consistente de converter um dado (a "chave") para um endereço numérico. Ou seja, aplicando a função hash sobre uma string como `hash("fidelis")`, ela resultaria em um identificador numérico para esse dado, como por exemplo `10`. Se essa operação for repetida um milhão de vezes com a mesma entrada, o resultado deverá ser sempre `10`. Esse valor numérico identifica o **bucket** específico na tabela hash onde o dado será armazenado ou procurado.

Em um contexto de **resolução de colisões por encadeamento separado**, um bucket não armazena um único dado, mas sim atua como um ponteiro para uma estrutura secundária, geralmente uma **lista encadeada** (ou, em implementações otimizadas, uma árvore binária balanceada para cadeias longas). Por exemplo, quando você calcula `hash("fidelis")` e o valor resultante aponta para o `bucket 10` da sua tabela hash, o dado associado a "fidelis" será inserido nessa estrutura. Se esse bucket já contém outros dados, é porque outras chaves, como `hash("tarsila")`, `hash("sasha")` e `hash("saori")`, também **colidiram** e resultaram no mesmo `bucket 10`. Ao inserir o valor de `fidelis` nessa lista, o dado referente será adicionado sequencialmente ao final dessa lista (ou inserido em ordem, se a lista for mantida ordenada internamente).

*   Antes: `bucket[10] -> [ ("tarsila", "foo") -> ("sasha", "bar") -> ("saori", "ping") ]`
*   Depois: `bucket[10] -> [ ("tarsila", "foo") -> ("sasha", "bar") -> ("saori", "ping") -> ("fidelis", "pong") ]`

A busca pelo valor de uma chave específica também segue essa lógica. Quando precisamos recuperar o valor associado a uma chave, a **mesma função hash** é aplicada à chave, e o valor hash resultante aponta diretamente para o **bucket exato** onde o dado está armazenado. Isso possibilita que a *engine* do banco de dados recupere o dado de forma **quase instantânea**, realizando apenas uma **breve travessia** na pequena lista de dados localizada naquele bucket (no caso de colisões), sem a necessidade de múltiplas operações de leitura em disco.


## Indices Invertidos

Os **Indices Invertidos**, ou **Inverted Indexes**, são **estruturas de dados de busca que permitem encontrar documentos completos através de termos de busca específicos e dinamicos**, possibilitando **executar processos de "full-text search" em grandes volumes de dados**. Ao invés das estruturas convencionais que mapearam um documento ou entidade para um valor ou termo, **um indice invertido faz o trabalho oposto**, eles **mapeiam termos, palavras ou tokens para os respectivos documentos onde eles aparecem**, permitindo realizar buscas dentro de textos e valores longos através de termos simples, e são características de bancos orientados a documento como o Elasticsearch e Apache Solr, mas também podem ser implementados em bancos de dados relacionais que possuam as features de full-text search, como PostgreSQL, SQL Server e Oracle. 

Esse tipo de estrutura facilita imensamente a implementação de engines de busca em dados desestruturados ou semi-estruturados, como catálogos, lista de produtos de e-commerce, busca por termos dentro de contratos jurídicos e agregadores de logs. Imagine usar um motor de busca caso a engine precisasse escanear todos os atributos de todas as linhas de uma tabela buscando por padrões de texto, esse processo seria **extremamente lento e custoso computacionalmente** para grandes volumes de dados. Os índices invertidos resolvem isso. **Eles funcionam como um catálogo de biblioteca ou arquivo de documentos**: em vez de folhear cada livro para achar um termo específico, você consulta o catálogo, vulgo índice invertido, que te direciona diretamente aos documentos que contêm aquela palavra, tornando a busca **mais rápida e eficiente** para esse tipo de cenário.

Por exemplo, em uma loja online, ao realizar uma busca como "geladeira verde 2 portas", o índice invertido pode localizar rapidamente todos os produtos cujo campo de descrição (ou outros campos indexados) contém a palavra "geladeira", "verde" e "2 portas", independentemente de como esses termos estão dispostos ou em quais "atributos" do documento (seja um campo JSON ou uma coluna de texto) eles aparecem.

A construção de um índice invertido dentro das engines que implementam geralmente envolve uma certa pipeline do dado no momento da sua gravação e indexação, como por exemplo um pré-processamento, onde os documentam passam por processode map/reduce de palavras, normalização o dado, o processo de tokenização que viabilizam o processo de busca onde o texto é divido em tokens de palavras individuais e a por fim a criação do indice que permite a listagem de todos os documentos que aquele token aparece. 

## Compressão e Encoding

<br>

# Arquitetura 

A escolha do banco de dados é uma representação direta da arquitetura do sistema. Sistemas distibuídos no geral envolvem escolhas que impactam diretamente o desempenho, disponibilidade, escalabilidade e consistencia de uma parte, ou do sistema como um todo, e o delimitador do sucesso dessas escolhas é a escolha da tecnologia correta para a persistência do mesmo, que deve levar em conta suas características e seus requisitos funcionais e não funcionais. E escolha equivocada de um banco de dados pode acarretar em inumeros problemas de performance e confiabilidade se não levarmos em conta suas características e limitações. Dado isso, aqui listaremos os cenários mais comuns que podemos encontrar e sugestões do que levar inicialmente para as discussões de arquitetura. 

## Cenários Transacionais 

Cenários onde precisamos realizar duas ou mais operações dentro de um database, envolvendo uma ou mais tabelas, onde várias operações precisam ser concluídas em sua totalidade para assim garantir o sucesso da transação, caracterizam um ambiente transacional. Cada operação deve ser tratada como um contrato: ou ela é concluída com sucesso e de forma integral, ou é revertida completamente, garantindo que o estado do domínio permaneça sempre válido e confiável para todos os consumidores na malha de dados. São cenários que precisam de  consistência forte, permitindo níveis de consistência transacional que asseguram leituras imediatas das últimas escritas.

 Os cenários transacionais são ideais para ambientes e funcionalidades que demandam operações atômicas com garantias, como atualizações de saldo mediante a o registro de uma transação, atualização no estoque de um e-commerce baseado na compra e pagamento e etc.  Essas implementações são mais críticas em ambientes corporativos que demandam operações atomicidade e garantias [ACID](), e o as implementações mais comuns são os bancos relacionais que já fornecem esse tipo de funcionalidade por padrão. 

Os bancos transacionais normalmente são a fonte mais confiável para eventos de negócio, como a criação de um pedido, a confirmação de um pagamento ou o registro e atualização de um novo cliente. A diretriz arquitetônica para essas engines **não é a velocidade ou o volume**, mas a **integridade e a consistência inquestionáveis dos dados**, sendo em muitos casos **combinadas com outros padrões de bancos de dados** como camadas de cache em modelo chave-valor ou [CQRS]() para otimizar cenários de leitura intensiva em engines mais otimizadas para isso, isolando a "golden source" transacional de picos de acesso sem comprometer sua disponibilidade.

A estratégia de indexação mais comum é a implementação de B-Trees, pois facilitam buscas extremamente rápidas em chaves primárias das tabelas e indices segundários em multi-atributos dos dados, porém as características atômicas e consistentes acarretam em maior latência em escritas, principalmente em cenários distribuídos em várias réplicas. Quanto mais replicas a engine tiver, sejam elas para leitura ou não, maior o tempo de commit da transação, pois o dado precisa ser confirmado em todos os nós para que a transação seja efetivamente concluída para a sincronização. 

As soluções clássicas de bancos de dados SQL escalam verticalmente sem impacto na latência de commit, porém exigem hardware cada vez mais caro, enquanto iniciativas NewSQL escalam horizontalmente mas pagam o preço de protocolos de consenso, como (Raft/Paxos) que adicionam latência e aumentam o custo de rede e CPU entre os nodes. 


## Cenários de Write-Intensive 

Cenários Write-Intensive, ou Escriva Intensiva, são sistemas em que taxa de escrita supera consideralmente em magnitude a taxa de leitura. São sistemas que precisam ingerir um volume contínuo e massivo de dados e precisam que sua infraestrutura de apoio viabilizem isso de forma performática e com alta disponibilidade.  Nestes cenários intensivos em escrita, a prioridade é capturar os dados com alta velocidade e disponibilidade, garantindo que nenhuma informação seja perdida, mesmo que pra isso tenha que abrir mão da consistência forte e precise lidar com réplicas da camada de dados desatualizadas por períodos de tempo. 

Esses sistemas normalmente são aplicações corporativas que possuem seu processamento assincrono, agregadores de logs de sistemas, captação de dados de dispositivos IoT, feeds de posts e comentários de redes sociais e etc. 

Para suportar quantidades significativas a arquitetura de solução normalmente se volta para sistemas NoSQL, que são projetados para performance de escrita e escalabilidade horizontal de nodes. Suas arquiteturas internas são otimizada para distribuir escritas através de um cluster de múltiplos nós de forma performática, normalmente adotando operações sequenciais de escrita "append-only", estratégias de indexação e replicação assincrona normalmente sendo algoritmos de Log, como o LSM-Tree. 

Diferente das B-Trees, que podem exigir operações de I/O custosas para novas escritasa e atualizações, a implementação das LSM-Trees nessas arquiteuras transformam cada escrita em uma operação sequencial de append, que é extremamente rápida para gravação rápida, pois como explicadas no tópico conceitual, enfileram essas escritas em memória, e posteriormente são escritas em disco de forma organizada, não prendendo a solicitação até que a mesma seja totalmente finalizada em todos os nós. 

Essa arquitetura inerentemente favorece a consistência eventual, pois para alcançar alta disponibilidade e baixa latência das operações, o sistema não espera que a solicitação de escrita seja replicada e confirmada em todos os nós antes de responder ao cliente. As engines mais otimizadas para esse tipo de cenário são DynamoDB, Cassandra, ScyllaDB e etc. Engines que não são "as a service" possuem parametrizações de quorum para ter um equilibrio ajustável entre latência, disponibilidade e níveis de consitência. 

## Cenários de Read-Intensive 

Cenários Read-Intensive, ou de Leitura Intensiva, possuem necessidades inversas do Write-Intensive, sendo normalmente ambientes onde a quantidade de leitura se sobressai sobre as operações de escrita. 

## Consistencia Forte e Consistencia Eventual 


Ele garante que, eventualmente, todos os nós convergirão para o mesmo estado. Em contrapartida, a consistência eventual o torna inadequado para casos de uso transacionais, e os padrões de consulta são mais restritos, geralmente limitados à chave de partição para obter performance.

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

[Understanding Hash Indexing in Databases](https://medium.com/@rohmatmret/understanding-hash-indexing-in-databases-11c02b7d4ed1)

[Understanding Inverted Indexes: The Backbone of Efficient Search ](https://dev.to/surajvatsya/understanding-inverted-indexes-the-backbone-of-efficient-search-3hoe)