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

Os bancos de dados SQL (Structured Query Language) são baseados num modelo proposto por **Edgar F. Codd em 1970**, sendo **o modelo mais conceituado entre as opções arquiteturais**. O modelo é um organizado em tabelas **compostas por tuplas (linhas) e atributos (colunas)** e possuem features que **viabilizam schemas e estruturas rígidas**, definindo por um contrato os **tipos de dados, restrições de integridades, indentificadores únicos e regras de coerencia entre os relacionamentos das tabelas**. Os bancos relacionais, como o próprio nome diz, são pensados para **proporcionar relacionamentos internos e declarativos entre os dados de diferentes tabelas**. A engenharia de software faz uso desse modelo relacional para trabalhar com entidades e agregados dentro de [contextos de domínios]() de um software. Esses bancos contam normalmente com features do modelo [ACID, como Atomicidade, Consistencia, Integridade e Durablidade](). 

## Banco de Dados Não-Relacionais NoSQL

Os bancos Não Relacionais, ou NoSQL (Not Only SQL), são uma proposta mais flexivel aos modelos rigidos dos bancos SQL, trocando níveis altos de consistencia e integridade por escalabilidade. Os bancos NoSQL por padrão utilizam outros formatos de dados além de tabelas e linhas, e não possuem relacionamentos diretos entre os seus conjuntos de dados, tendo schemas mais flexiveis e com consistência eventual em troca de maior desempenho de leitura, escrita, escalabilidade horizontal e distribuição. 

São nos bancos NoSQL que encontramos maior diversidade de formatos, como chave-valor, JSON, BSON, Grafos e etc, sendo que o principal foco é evitar joins custosos a favor de modelos de dados mais simples e com regras mais mutáveis, o que pode acarretar tanto em maior performance quanto também gerar riscos de incosistências de tipos de dados e contratos que precisam ser respeitados do lado da aplicação que consome o dado de fato. 

## Bancos de Dados NewSQL

O maior desafio dos sistemas distribuídos é conviver com tradeoffs encontrados nas camadas de dados. Os bancos NewSQL são databases que focam sua implementação em conciliar os dois mundos, buscando dar uma confiança transacional e relacional para as operações vindas dos modelos SQL e ainda agregar features de escalabilidade horizontal e alto throughput dos modelos NoSQL.

As implementações de databases NewSQL costumam ser extremamente focadas em necessidades distribuídas, realizando operações de [sharding]() e [replicação]() de forma transparente e sincrona para garantir a confiabilidade ACID das transações mas aplicando protocolos de consenso distribuida para realizar isso de forma mais distribuída e performática possível. 

## Bancos de Dados em Memória

Os databases em memoria, ou in-memory databases, são bancos de dados especializados em volatilidade e realizar a gestão de seus dados diretamente na RAM do servidor ao invés de tratar a persistência de forma durável em [discos e volumes físicos](). 

O objetivo dos bancos de dados em memória é reduzir latência e tempos de resposta da consulta do dado, uma vez que uma consulta em memória volátil pode ser realizado em nanosegundos na RAM ao invés de milisesegundos em um acesso em disco, cenário que pode ser agravado por um uso intensivo de I/O do volume. 

Os modelos de dados encontrados nesse tipo de implementação costumam ser extremamente simples, e seu melhor uso possível se baseando em chave-valor e combinado com outros tipos de databases duráveis, sendo pensados para sistemas de [cache]() de dados, fazendo uma camada de acesso rápido para dados caros e que não são alterados com grande frequência. 

Utilizar somente a memória RAM para armazenar dados presume uma série de tradeoffs consideráveis, como assumir a não-durabilidade do dado, uma vez que sendo reiniciado o serviço ou o servidor, todos os dados podem ser perdidos, logo o uso só é recomendado para dados que podem ser reconstituidos a qualquer momento diretamente de sua origem, além de sua escalabilidade costumar ser financeiramente cara de forma [horizontal e vertical]().

## Bancos de Dados Baseados em Grafos

Os bancos de dados baseados em grafos são tecnologias implementadas em estruturas onde o relacionamento entre as entidades é mais, ou tão quão importantes quanto o próprio dado em si. Comparando com os modelos SQL onde os relacionamentos são criados baseados em chaves estrangeiras entre tabelas e JOIN's criados durante a consulta, os bancos de grafos aplicam o conceito de nodes (entidades) e arestas (relacionamentos) como os objetos de primeira classe, permitindo relacionar vários tipos de dados entre diferentes entidades. Os dados são propriedades chave-valor chamados de vértices, e as arestas que conectam os semelhantes desses dados. Isso permite realizar de forma performática consultas que precisam responder questões como "alunos da turma da manhã que moram no mesmo bairro e possuam uma média escolar maior que 8", ou "encontre amigos de amigos que vivem na mesma cidade e trabalharam na mesma empresa" sem a necessidade de JOIN's custosos em difersas tabelas relacionais. 

O uso dos bancos de dados baseados em grafos podem ser implementados para encontrar relacionamentos e proporcionar features de recomendação de produtos com base no comportamento de certos tipos de usuários parecidos, análise de redes sociais, modelagem de ameaças, análises de fraude e estudar cadeias de valor e de logística de forma complexa. 

## Time-Series Databases 

## Multi Model Databases


# Modelos de Dados 

## Modelos Relacionais 

## Modelos de Documentos

## Modelos Colunares (Wide-Column)

## Modelos Key-Value (Chave-Valor)

## Modelos de Grafos


# Armazenamento e Indexação

## Page Size 

## Formato Colunar 

## Log-Structured

## Compressão e Encoding

## Indexação B-Tree e B+Tree

## Indexação por Hashing

## Indices Invertidos

# Arquitetura 

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