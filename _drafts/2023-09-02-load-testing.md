---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Testes de Carga e Estresse
---

> Artigo extra escrito para a aula ao vivo sobre testes de performance da turma de Arquitetura de Containers na AWS. 

# Introdução 


##  A importância dos testes de performance 

Realizar testes de performance, embora muitas vezes não seja possível por uma quantidade significativa de fatores, deveria ser uma prática que acompanha o ciclo de vida de qualquer software produtivo, desde seus estágios de build até sua maturidade de vôo. Eles são talvez a forma mais prática e cientifica de descobrir os limites do seu sistema e também garantir que o mesmo irá cumprir com os requisitos propostos. 

Uma vez que os limites do software são conhecidos e impostos por produto, a tarefa dos testes de estresse, performance e carga buscam dar uma garantia pragmática de que os requisitos base de uso serão entregues e irão suprir as necessidades do cliente final. Dessa forma, na construção ou refatoração de um sistema, conseguimos oferecer alguns graus de garantia e expectativas de capacidade de curto, médio e longo prazo. Dizendo dessa forma, até parece complexo, burocrático e de algumas formas pedante. Mas ao decorrer desse texto, meu objetivo é te mostrar como arquitetar testes de forma assertiva, dinâmica e facilmente adaptável para diferentes tipos de cenário. Buscando te guiar nos primeiros, segundos e terceiros passos de como direcionar testes de performance, e principalmenete, como utilizá-los para elaborar e responder perguntas chave sobre o seu produto. 

<br>

##  A importância de conhecer comportamentos do sistema

Quando estamos projetando sistemas do zero, ou cuidado para que o mesmo tenha um ciclo de vida saudável a longo prazo, é importante existir documentada todas as funcionalidades e lógicas do sistema. Nem sempre isso é possível, e em muitos casos tratado como "o mundo ideal" de muitos times de engenharia. Conhecer a jornada do seu cliente, como ele interage com o seu sistema, quando e com que frequência, tem um valor muito alto. Começar a tratar funcionalidades como comportamentos e jornadas, pode nos levar a mapear quais serão os maiores gargalos sistêmicos e nos fazer encontrar inumeras possibilidades de melhoria. 

Quando estamos arquitetando um relatório gerencial de fechamento de caixa, entendemos que, por mais que seja uma tarefa intuitivamente custosa computacionalmente, presumimos também que a frequência que o mesmo é gerado é baixa, e presumimos por inferência que os períodos pelos quais os mesmos serão gerados não irão variar muito dos ultimos ou primeiros dias do mês. 

Quando temos uma funcionalidade que a função é registrar e concluír vendas de diversos produtos de um catálogo, podemos da mesma forma presumir que, embora esse estímulo seja muito mais frequente em termos de repetição, a demanda computacional não tende a ser um grande problema na maioria dos casos. 

Isso quer dizer que, quando começamos a projetar um roteiro de testes, precismos testar em escala a carga da funcionalidade de vendas, e em estresse a função de relatórios. Não faz sentido, é claro, nesse caso em específico, estar uma grande volumetria de diversos relatórios contábeis sendo emitidos em paralelo. Assim como talvez não faça sentido testar como a performance de um sistema inteiro varia quando temos apenas uma venda sendo concluída. 

Entender a jornada comum de um cliente do nosso sistema pode nos facilitar, e muito, a elaboração de um teste que vai nos permitir entender cientificamente como nosso sistema se comporta e varia em determinadas condições. Como por exemplo, em uma jornada fictícia, podemos presumir que, um cliente médio acessa a home do nosso e-commerce, procura pela categoria que lhe convêm, realiza a busca por algum termo aleatório, acessa quatro ou cinco opções do catalogo, coloca uma ou duas no carrinho, volta para "namorar" mais um pouco de opções, volta para o carrinho, tenta aplicar algum cupom, podendo ter sucesso ou falha, dependendo do sucesso, aplicamos um desconto, ele pode proativamente ou reativamente realizar o login ou cadastro, preencher os seus dados caso não existam apenas uma vez, efetuar o pagamento e durante alguns dias visitar o site para entender o status do produto. 

Essa é uma jornada praticamente "comum" e intuitiva de um sistema de e-commerce por exemplo. Aqui podemos tirar alguns insights que, por mais que a busca e navegação tenham sido feitas em grande quantidade, o login foi feito uma única vez no processo. Mediante a cadastro que foi executado somente uma vez, o preenchimento dos dados também ocorre muito menos vezes que as outras operações, a visita de consulta pode variar bastante em quantidade. 

Nisso podemos desenhar testes específicos pra esse tipo de jornada, moldando as transações injetadas nos baseando em comportamento. Entender isso pode ser uma chave interessante pra projetar testes que agregam valor instantâneo para a engenharia. 

<br>

## Testes de Performance em Build e Run

Esse tipo de teste pode ser realizado em diversos estágios do ciclo de vida de um software. Para exemplificar, iremos separar em dois grandes marcos genéricos, na fase de Build que corresponde a construção inicial e primeiros estágios do software em seu MVP ou Pós MVP, e no Run onde constantemente revisitamos a capacidade atual e desejada para garantir que os requisitos não foram muito alterados e deteriorados conforme a evolução do sistema. Os testes de performance na fase de Run ocorrem em ambientes mais realistas, como pré-produção ou até mesmo produção em diversos casos, podendo ou não concorrer com o cliente final. O objetivo fazer com que o sistema seja submetido a cenários que simulam cargas reais ou extremas. O objetivo de um teste agressivo nesse sentido é testar de maneira controlada sistemas que já existem e estão consolidados em determinados cenários para chegar seus níveis de disponibilidade, resiliência e performance, impedindo que esses insumos cheguem de forma reativa ou em momentos de crise. 

# Testes de Carga e Estresse

A terminologia dos testes de carga pode ser bastante confusa para definir "o que serve para quê", e até mesmo se há alguma diferença entre os termos. No entanto, essas diferenças existem e podem ser compreendidas em sua natureza, ajudando-nos a elaborar estratégias para diferentes tipos de cenários.

O objetivo de um teste de carga é avaliar como o sistema se comporta sob cargas reais e esperadas. Normalmente, esse teste serve para garantir que as estimativas e expectativas do produto sejam atendidas. Um teste de carga busca garantir as "baselines" que os times de engenharia recebem quando há alguma expectativa de onboarding de clientes, transações esperadas, contratos de disponibilidade, tempos de resposta, entre outros fatores.

Por exemplo, se um produto ou funcionalidade está sendo construído para suportar um cliente que necessita realizar 300 transações por segundo, com o tempo de resposta de cada transação abaixo de 400ms, o teste de carga nos permite injetar a carga de tráfego esperada e verificar se o sistema está cumprindo esses requisitos. Se o sistema estiver sendo desenvolvido também levando em consideração o onboarding de novos clientes ao longo do tempo, ou se há uma estimativa de crescimento de X% em determinado período, os testes devem ser desenhados para garantir que o sistema acompanhe esse crescimento gradual. Assim, será possível identificar até que ponto o sistema atenderá aos processos esperados antes de atingir um limite que comprometa essas expectativas.

Por outro lado, um teste de estresse busca avaliar as mesmas dimensões, porém em condições adversas, como picos de acesso, cargas repentinas ou volumes muito maiores que o habitual por determinados períodos. O objetivo desse teste é encontrar gargalos e limitações do sistema sob condições não convencionais. É comum que, em um teste de estresse, seja aplicada uma carga muito superior à esperada justamente para identificar esses gargalos e limitações.

Ambos os cenários nos ajudam a identificar gargalos de capacidade, oportunidades de otimização, realizar análises de recursos e simular o uso de dependências. A seguir, vamos abordar alguns tipos de testes que podem ser aplicados em ambos os cenários e que ajudam a responder perguntas específicas.

# Tipos de Teste 

O objetivo dessa sessão é especificar alguns dos principais tipos de teste e que tipo de pergunta eles visam responder quando aplicados. 

## Teste de Fumaça, Smoke Tests

Os testes de fumaça, ou smoke tests, são uma forma simplificada de injetar uma carga mínima e verificar as principais funcionalidades de um sistema sob uma ótica de tráfego básico. Normalmente, a baseline de um smoke test busca garantir o funcionamento mínimo necessário com uma carga minimamente aceitável. Esse tipo de cenário é comumente executado em pipelines de CI/CD, fazendo parte da cadeia de qualidade durante o processo de release de versões, ou em automações periódicas, aplicadas em ambientes produtivos ou pré-produtivos, para garantir a funcionalidade recorrente e gerar evidências de bom funcionamento.

![Smoke Test](/assets/images/system-design/load-test-smoke.drawio.png)

Esses testes são usados para validar se a aplicação está "pronta para ser testada" em cenários mais complexos e intensivos. Não é objetivo do smoke test realizar uma análise detalhada de desempenho, mas sim garantir que não há falhas críticas que impediriam o funcionamento básico da aplicação. Ele serve como uma verificação inicial de que as funcionalidades principais estão operando corretamente antes de seguir para testes mais aprofundados.

## Teste de Average Load

O objetivo do Average Load é avaliar como o sistema se comporta sob a carga esperada por longos períodos, verificando se ele consegue manter a performance estabelecida. Ao contrário de testes que simulam cenários adversos ou básicos, o objetivo do average load test é garantir o bom funcionamento e o entendimento do sistema dentro dos limites esperados. Se o direcionamento do produto é, por exemplo, uma carga média hipotética de 400 transações por segundo, garantindo um tempo de resposta de até 200ms, o teste visa injetar esse volume continuamente por períodos prolongados para avaliar se surgem outliers ou comportamentos inesperados que comprometam a execução uniforme da performance.

![Smoke Test](/assets/images/system-design/load-test-average.drawio.png)

Os cenários ideais para a execução de Average Load são aqueles que duram dias ou semanas, permitindo um estudo aprofundado de todas as variações ocorridas durante esse período, a fim de identificar padrões e correlações. Testes desenhados nesse formato podem ser especialmente úteis para verificar a existência de problemas como memory leaks.

![Smoke Test Longo](/assets/images/system-design/load-test-average-long.drawio.png)

## Testes de Estresse 

Os testes de estresse são amplamente conhecidos e, muitas vezes, utilizados de forma genérica para se referir a outros tipos de testes de performance. No entanto, o teste de estresse tem um objetivo claro: avaliar o comportamento de um sistema quando este é submetido a condições extremas, que excedem o fluxo normal esperado.

O principal objetivo desse teste é identificar gargalos, limites de capacidade e falhas de resiliência por meio da sobrecarga de uso. A aplicabilidade desse tipo de teste é relevante quando há a necessidade de descobrir como o sistema reage em cenários de sobrecarga, seja em eventos de alto tráfego, seja em picos inesperados de demanda.

![Stress Test](/assets/images/system-design/load-test-stress.drawio.png)

Os indicadores mais comumente avaliados durante um teste de estresse incluem métricas de capacidade, como uso de CPU, memória, rede, I/O, e o número de conexões no pool do sistema e suas dependências. Esses fatores são analisados em conjunto para determinar o ponto de saturação do sistema.

As lições aprendidas com esse tipo de teste são valiosas para identificar, de forma proativa, pontos de falha e oportunidades de melhoria, evitando que esses problemas sejam descobertos apenas em cenários reais, já impactando o cliente final. Além disso, os insights obtidos podem ajudar as equipes de engenharia a identificar quais partes do sistema continuam operando durante falhas graves e se isso é mais benéfico ou prejudicial para a recuperação completa do sistema.


## Testes de Spike

Os testes de spike podem ser considerados tanto uma variação quanto um complemento dos testes de estresse. O objetivo desse teste é simular picos repentinos de uso e fornecer dados sobre como o sistema se comporta diante desse cenário. Um teste de spike pode ser programado para ser executado durante um teste de estresse ou de breakpoint convencional, que normalmente aumenta a carga de maneira progressiva. No entanto, o teste de spike é focado em avaliar uma progressão súbita de uso, seguida de uma redução rápida.

![Spike Test](/assets/images/system-design/load-test-spike.drawio.png)

Esse tipo de teste é utilizado para validar a estabilidade do sistema e identificar possíveis degradações momentâneas de desempenho. Ele é especialmente valioso para sistemas que, de fato, experimentam aumentos repentinos e imprevisíveis de uso por parte de seus clientes.

As lições aprendidas a partir desse teste fornecem informações sobre como a arquitetura do sistema pode ser ajustada para absorver esses aumentos repentinos de tráfego sem a necessidade de superdimensionar sua capacidade e infraestrutura. O foco é otimizar o uso dos recursos, garantindo que o sistema possa lidar eficientemente com picos inesperados, sem comprometimento significativo de desempenho.

## Testes de Breakpoint

Os testes de breakpoint são utilizados para avaliar como o sistema se comporta sob tráfego progressivo por longos períodos, com o objetivo de encontrar o ponto limite de quebra. Esses testes são projetados para identificar o momento exato em que o sistema começa a falhar à medida que a carga aumenta, detectando quando ocorrem degradações no tempo de resposta, aumento na taxa de erros, e falhas críticas nos componentes.

![Breakpoint Test](/assets/images/system-design/load-test-breakpoint.drawio.png)

A execução desse tipo de teste deve ser feita de maneira muito mais controlada do que outros tipos de testes, pois o objetivo aqui não é validar a performance ou capacidade para cenários específicos, mas sim levar o sistema até o seu limite real.

Durante o teste de breakpoint, várias métricas precisam ser avaliadas, como a saturação de recursos, incluindo CPU, memória, latência, I/O, disco, rede, taxa de erros do serviço e todas as suas dependências. Isso permite identificar quais componentes falham primeiro e como a cascata de falhas acontece, facilitando a compreensão dos pontos fracos e das limitações do sistema. Aqui normalmente são analisados as limitações das politicas atuais de [escalabilidade horizontal]().

<br>

# Respondendo a Perguntas Chave

O objetivo de um teste de performance ou estresse é responder perguntas específicas sobre o sistema avaliado. Isso significa que apenas injetar carga, sem antes definir que tipo de respostas se quer obter com o teste, não é a estratégia mais eficiente nem em termos de esforço, nem de resultado. Quando planejamos um teste, ele precisa ser executado em condições que nos permitam compreender detalhadamente, ou estimar por inferência, as capacidades do sistema ou de suas funcionalidades isoladas. Simplesmente simular carga por simular pode gerar resultados dispersos e de pouco valor para o produto.

Portanto, por mais que a fase de planejamento seja mais demorada em comparação à execução do teste, é essencial alinhar as expectativas e definir objetivos claros. Dessa forma, os resultados obtidos podem realmente auxiliar os times de negócio e engenharia na tomada de decisões técnicas e na definição de prioridades.

### Qual é o trafego esperado do meu sistema hoje? 

Quantos usuários simultâneos o sistema suporta atualmente? Quantas transações por segundo são processadas em média? O volume de tráfego tem picos em horários específicos? Estas são as primeiras perguntas que devem ser respondidas ao iniciar o planejamento de um teste eficiente, visando estabelecer dados sobre o ciclo de vida completo do produto. Esses pontos são facilmente respondidos em casos onde o sistema já está em operação e conta com mecanismos de observabilidade, que monitoram regularmente o desempenho e fornecem métricas valiosas sobre o comportamento do sistema.

Se o teste estiver sendo proposto para um sistema novo, é essencial que essas informações sejam fornecidas pelo time de produto, com base nos acordos estabelecidos com o cliente, seja ele interno ou externo. Esse processo garante que, caso o volume de tráfego ainda não seja conhecido, ele seja pesquisado e comunicado a todos os stakeholders envolvidos no desenvolvimento e operação do sistema.

### Quais são meus objetivos de tempo de resposta, taxa de erros e saturação? 

Sabendo o volume de uso do sistema, o próximo passo é determinar quais são os limites aceitáveis de erros nos fluxos e o tempo de resposta considerado ideal. Esse processo pode ser medido por jornadas ou ações específicas, ao invés de tratar o sistema como uma "caixa preta", onde toda a experiência é considerada em uma única média. Diferentes tipos de ações dentro de um produto geralmente possuem pesos e níveis de complexidade variados. Portanto, mapear essas jornadas é uma abordagem interessante se o objetivo for granularizar os resultados dos testes de performance.

Se todas as jornadas estiverem mapeadas, pode ser valioso realizar testes de performance que simulem comportamentos heterogêneos, com vários usuários executando ações completamente diferentes no sistema. Isso cria um cenário mais próximo do real e permite uma avaliação mais precisa do desempenho. No entanto, para que esses testes sejam realmente válidos no contexto do produto, os limites aceitáveis de erros e tempos de resposta precisam ser conhecidos. Dessa forma, será possível avaliar se o sistema está atingindo ou não os objetivos propostos.


### Qual é o trafego esperado do meu sistema em períodos de pico? 

Depois de estabelecermos os baselines, é fundamental entender as variações esperadas ou estimadas no uso do sistema. Os sistemas normalmente têm fluxos de uso previsíveis, mas não uniformes. Por exemplo, um sistema de delivery de comida pode ter um uso constante ao longo do dia, com picos próximos aos horários de almoço e jantar.

É importante compreender como esses picos se comportam e como podem influenciar a experiência total do cliente. Esse tipo de dado é extremamente valioso e deve ser utilizado para testes de spike ou estresse, que podem ser configurados para simular capacidades variáveis ou progressivas, sempre refletindo os momentos de maior demanda, ou "vales de acesso", no sistema.

### Quais os protocolos e estímulos que minha aplicação é exposta? 

Agora que temos os objetivos de uso e os limites aceitáveis de experiência, precisamos aprofundar e nível arquitetural e encontrar quais os tipos de protocolo as aplicações falam para que seja possível selecionar a ferramenta e processo ideial para os testes do mesmo. 

Minha aplicação é exposta inicialmente por aplicações sincronas como HTTP, gRPC e Websockets? A aplicação produz ou consome mensagens ou eventos vindos de estímulos assincronos como AMQP, Kafka, Pooling, MQTT? O ideal é mapear os principais protocolos transacionais existentes para que seja possível estimular da forma correta pelas mesmas vias que o cliente fariam pelo fluxo normal. 

### Qual é a expectativa de crescimento do meu sistema?

Respondidas quais são as necessidades do sistema hoje, ou por um período definido, é importante projetar os testes de carga pra sempre olharem para um crescimento natural, para ajudar a responder "até quando meu capacity atual está condizente e quando eu precisarei revisitá-lo de forma proativa?". Esse tipo de abordagem quando alinhada as expectativas de produto são muito poderosas para projetar sistemas que tenham uma evolução saudável a longo prazo. É necessário manter uma clareza entre produto e engenharia sobre planos de expansão, metas de vendas, onboarding e afins.

### Qual é o cenário mais extremo que o sistema enfrentará? 

Mesmo conhecendo o comportamento natural do sistema, seus períodos de comum utilização, baixa utilização e picos de carga, ainda assim precisamos conhecer como nosso sistema se comportaria em sistemas ainda mais extremos que esse, principalmente em períodos de promoção, períodos como black friday, natal e afins, a até mesmo cenários suspresas que queremos antever. Conhecer ou estimar esse tipo de cenário tende a ser uma das partes mais importantes e divertidas de uma dinâmica como essa, e normalmente são nessa fase que encontramos os principais gargalos e pontos de melhoria de um sistema. 

## Quais são as funcionalidades principais que precisam ser testadas? 

Quais são as partes mais críticas da aplicação como busca, detalhes de itens, carrinho, checkout, pagamento, consulta de dados cadastrais que precisam de maior atenção? Há funcionalidades que impactam diretamente o core do sistema e devem ser testadas com maior carga? Se sim, seria interessante desenvolver até mesmo testes isolados e direcionados pra esses cenários antes de testar uma jornada por completo. Priorizar diretivas específicas também pode ser de grande valor quando alteramos o funcionamento apenas de partes específicas e gostariamos de entender se foi criado algum comportamento ofensor ou melhoria significativa perante aquela mudança. 

## Quais são as jornadas comuns do usuário? 

Talvez a melhor forma de se formular testes de carga e estresse seja a de realizar o teste dentro de uma jornada por completo, simulando uma jornada real do usuário dentro do sistema. Vamos abordar novamente o caso de um usuário dentro de um e-commerce fictício, onde em uma jornada convencional o usuário no "fluxo feliz" acessa a home, faz login, busca vários termos dentro do sistema de pesquisa, adiciona alguns ao carrinho, remove outros, inicie o checkout, realiza pagamentos e etc. Podemos dessa forma racionalizar o numero de interações proximo do realista entre as funcionalidades do sistema. 

![Jornadas](/assets/images/system-design/jornada.drawio.png)

Em um cenário não tão próximo de características sincronas, por exemplo, um sistema reativo de pagamentos que é estimulado por vários clientes internos com ações de cobrança e estorno, sabemos que 50% das solicitações são cobranças por cartão, 30% por pagamento instantâneo, 15% de boleto e 5% de estorno. Podemos criar mecanismos de teste que estimulem o sistema como um todo usando essas porcentagens de uso para o mesmo. 


## Quais os endpoints mais utilizados? E quais os mais caros? 

O objetivo de mapear as jornadas também é ajudar a mapear quais as funcionalidades mais utilizadas do sistema perantes as demais. Usando como base o exemplo acima, por exemplo entendemos que a pesquisa no site é usada muito mais vezes que o checkout, pois intuitivamente entendemos que o cliente pode procurar por várias categorias, navegar por vários produtos, adicionar ao carrinho e iniciar o processo de checkout pegamento apenas uma vez. E também podemos presumir que uma ação de pagamento seja mais custosa computacionalmente que uma pesquisa quando a mesma é otimizada da forma correta. Ter em mãos esse tipo de conhecimento pode nos ajudar a executar como e quando testar as funcionalidades de sistema da melhor forma sempre.

## Métricas em Testes de Performance

Já abordamos "o que olhar" durante a execução dos testes. Vamos tentar recapitular nesse tópico, mas sugerindo uma abordagem de aproveitar a movimentação do teste para criar dashboards, alertas, logs e tentar correlacionar todos esses pontos através de dashboards de jornadas numa abordagem de "Single Pane Of Glass" que visa dar uma observabilidade centralizada de multiplos recursos que pertencem a mesma jornada em ordem lógica para que seja possível acompanhar tanto todas os recursos, dimensões e aplicações que serão afetadas pelo teste, mas também servir para apoio no dia a dia de vôo do produto. Aproveitar grandes iniciativas para resolver mais de um problema é uma estratégia que casa perfeitamente 


### Service Levels como como objetivos esperados

Como saber se eu "passei no teste"? Uma oportunidade adicional é fazer com que toda essa pesquisa corporativa e multidisciplinar para descobrir os requisitos e objetivos sirva para definir quais serão os service levels oficiais do processo, dando uma estrela guia para os times de engenharia, negócios e arquitetura trabalharem e se atetarem as nuáncias. Se durante o teste foi escrito que é extremamente importante que a disponibilidade do checkout seja sempre acima de 99,99% e nunca demore mais que 3 segundos para concluir uma compra, temos a oportunidade perfeita de adotar essas métricas com os SLA's padrão do serviço e dar um norte para que todos os envolvidos se guiarem também no dia a dia sobre a saúde daquela funcionalidade, e criar os alertas pertinentes para garantir que a operação seja acionada antes mesmo da quebra do contrato. 


# Ferramental para Testes


### Referências

[Breakpoint testing: A beginner's guide](https://grafana.com/blog/2024/01/30/breakpoint-testing/)

[What is load testing?](https://grafana.com/load-testing/)

[How to do Load Testing? [A FULL GUIDE]](https://luxequality.com/blog/how-to-do-load-testing/)

[Teste de Desempenho vs. Teste de Estresse vs. Teste de Carga](https://www.loadview-testing.com/pt-br/blog/teste-de-desempenho-vs-teste-de-estresse-vs-teste-de-carga/)

[Spike Testing](https://grafana.com/blog/2024/01/30/spike-testing/)

[Application Break Point Test](https://www.perfmatrix.com/application-break-point-test/)

[Load Test Types](https://dev.to/eminetto/load-test-types-5b5m)

[What is single pane of glass? ](https://www.ibm.com/topics/single-pane-of-glass)