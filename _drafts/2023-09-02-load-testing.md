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

Os testes de fumaça, ou smoke tests, são uma forma simplista de injetar uma carga mínima e testar as principais funcionalidades de um sistema sob uma ótima de trafego de base. Normalmente a baseline de um smoke test visa garantir o mínimo necessário numa carga minimamente aceitável. Esse tipo de cenário normalmente é executado em pipelines de CI/CD fazendo parte da supply chain de qualidade da release de versões ou em automações periódicas executadas em ambientes produtivos ou pré-produtivos para garantir a funcionalidade de forma recorrente e gerar evidências de bom funcionamento. Esses testes são usados para validar se a aplicação está "pronta para ser testada" em cenários maiores. Não é o objetivo se aprofundar em uma análise de desempenho muito detalhada, e sim garantem que não há falhas graves que impediriam o funcionamento básico da aplicação.

## Teste de Average Load

Avaliar como o sistema se comporta com a carga esperada por longos períodos de tempo

## Testes de Estresse 

Avaliar como o sistema se comporta em cargas altas e picos esperados. 

## Testes de Spike

Avaliar como o sistema se comporta com alto tráfego recebido de forma repentina

## Testes de Breakpoint

Avaliar como o sistema se comporta com tráfego progressivo por longos períodos de tempo, até encontrar o ponto limite de quebra. 

# Respondendo a Perguntas Chave

O objetivo de um teste de performance ou estresse, é responder perguntas sobre o sistema avaliado. Isso significa que, somente injetar carga sem antes definir que tipo de respostas você quer obter do teste, não seja a melhor das estratégias em termos de eficiência e esforço. 

## Qual é o trafego esperado do meu sistema hoje? 

Transações e Usuários

## Qual é o trafego esperado do meu sistema em períodos de pico? 

## Qual é a expectativa de crescimento do meu sistema?

## Qual é o cenário mais extremo que o sistema enfrentará? 

## Quais são as funcionalidades principais que precisam ser testadas? 

## Quais os endpoints mais utilizados? E quais os mais caros? 

## Quais são as jornadas comuns do usuário? 

Cadeias de chamadas, fluxos, dependências e etc

##  Quais são meus objetivos de tempo de resposta, taxa de erros e saturação? 

## Quais os protocolos e estímulos que minha aplicação é exposta? 

Teste Sync, Teste Async

## Métricas em Testes de Performance

Observabilidade da Jornada

### Service Levels como como objetivos esperados

Como saber se eu "passei no teste"?  - Abordagem de SRE e North Star

## Qual o melhor tipo de teste escolher pra responder minhas perguntas?

# Ferramental para Testes


### Referências

[Breakpoint testing: A beginner's guide](https://grafana.com/blog/2024/01/30/breakpoint-testing/)

[What is load testing?](https://grafana.com/load-testing/)

[How to do Load Testing? [A FULL GUIDE]](https://luxequality.com/blog/how-to-do-load-testing/)

[Teste de Desempenho vs. Teste de Estresse vs. Teste de Carga](https://www.loadview-testing.com/pt-br/blog/teste-de-desempenho-vs-teste-de-estresse-vs-teste-de-carga/)