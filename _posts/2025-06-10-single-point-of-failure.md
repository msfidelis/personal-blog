---
layout: post
image: assets/images/system-design/capa-resiliencia.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Single Point of Failure
---


Em sistemas ditribuidos, a confiabilidade é um dos temas de maior importância na construção de serviços. Existem infinitas possibilidades que podem acarretar em alta disponibilidade ou problemas de disponibilidade de um sistema, e uma das formas de identificar oportunidades de otimização de [resiliência](), além de [encontrar gargalos](), é identificar os Pontos Unicos de Falha entre os componentes. Nesse rápido capítulo, vamos explorar de forma simples esse conceito e treinar o olhar crítico para identificar possíveis riscos e oportunidades.

<br>

# Definindo um Single Point of Failure

Um Single Point of Failure, SPoF, ou "Ponto Único de Falha", é um termo usado para se referir a qualquer componente, serviço ou recurso centralizado cuja a falha provoca a indisponibilidade total ou parcial de um ou mais sistemas. Um Ponto Único de Falha pode representar um [Banco de Dados](), um [Balanceador de Carga](), um [API Gateway](), um broker de mensageria ou até mesmo outro microserviço que em caso de queda, não exista nenhum caminho alternativo para que as requisições sejam estabelecidas. 

Imagine que uma cidade só possua como forma de acesso uma unica ponte. Essa ponte seria no mundo real, um ponto único de falha. Por mais que ainda exista possibilidade de acesso de barco, helicoptero ou balça, não seriam todas as pessoas que teriam acesso e a entrada e saída, e o envio de recursos e afins estaria ainda gravemente impactado. Isso seria um Ponto Único de Falha que gera uma indisponibilidade total ou parcial de acesso a região. 


São raros os sistemas que não possuam nenhum tipo de Pontos Únicos de Falha, a partir disso podemos assumir algumas premissas, como a que quando um SPoF falha, o sistema pode entrar em modo degradado no melhor dos casos, ou parar completamente no pior. Logo, quanto maior a responsabilidade de um componente, maior o impacto de sua falha caso não existam [Fluxos de Fallback](). Outra característica importante é que recuperações manuais ou rebuilds desses componentes levam tempo e podem causar perdas significativas. 

<br>

# Identificando Single Point of Failures

Identificar os SPoF de algum ambiente pode parecer extremamente trivial, porém se tornar uma tarefa árdua de esforço corporativo em ambientes grandes e de larga escala, pois precisamos mapear quais são as funcionalidades mais críticas, documentar cada serviço, seus clusters, nodes, servidores, databases, componentes de rede, brokers de eventos e mensagens e até fornecedores, sem falar dos times responsáveis e formas de acionamento de cada um deles. 

![SPOF](/assets/images/system-design/spof-identiticacao.drawio.png)

Durante esse mapeamento, é **necessário desenhar um "fluxo feliz" de cada transação dessas funcionalidades críticas**, **mapear todos os atores, desde a requisição de fato, até a resposta para o usuário**. Em seguida é necessário inspecionar **quais desses componentes [não possuam réplicas](), [implementem padrões de resiliência](), fallbacks e mecanismos que consigam assumir esses fluxos alternativos automaticamente**. São nesses atores que são encontrados **candidatos para se tornarem pontos únicos de falha** num fluxo crítico. 

A identificação de "Pontos únicos de falha" não é uma tarefa pontual ou fácil, necessita de constante revisão arquitetural e força corporativa para que seja realmente efetivo, ainda mais se começarmos a descer o nível de abstrações de virtualização, networking, replicação de provedores e etc.

## 

# Lidando com Single Point of Failures

Existem estratégias comuns que podem nos auxiliar corrigir e principalmente evitar a criação de SPoF's, nesta sessão iremos identificar de forma macro como endereçar algumas delas.

## Design Stateless de Aplicação

## Redundância e Replicação Ativa 

![Ativa](/assets/images/system-design/spof-ativa.drawio.png)

Uma redundância ou replicação ativa é um modelo onde todas as intâncias e replicas de um serviço trabalham simultâneamente para receber e processar as requisições da carga de trabalho. Resumidamente, nenhuma das replicas tem como objetivo ficar ociosa aguardando uma falha geral para que assuma o processamento primário das requisições. Esse arranjo arquitetural pode ser encontrado em replicas de aplicações atrás de balanceadores de carga, onde todos são verificados em integridade e recebem carga quase que uniformemente mediante a solicitação do serviço, ou em mensageria onde todas as replicas estão conectadas nos tópicos/filas e podem receber mensagens e eventos para processar. No geral, esse tipo de arquitetura, quando trabalhada sem estado, permite que na falha eventual de pequenas quantidade das replicas, continue operando e consiga se recuperar sem gerar grandes ou nenhum dano a experiência do cliente.

Esse modelo também pode ser encontrado em replicas de leitura de bancos de dados que possuam em estado transacional, todas os dados escritos nas replicas primárias. E além de possuir um viés de disponibilidade, onde essa réplica é capaz de assumir o papel de escrita em caso de falha na replica princial, pode exercer funcionalidades ativas na [segregação de escrita e leitura]() em diferentes instâncias. 



## Redundância e Replicação Passiva 

![Passiva](/assets/images/system-design/spof-passiva.drawio.png)

## Failover Automático 

![Circuit Breaker](/assets/images/system-design/spof-circuit-breaker.drawio.png)

## Ativo-Ativo

![Ativo / Ativo](/assets/images/system-design/ativo-ativo.drawio.png)

## Ativo-Passivo

![Ativo / Passivo](/assets/images/system-design/ativo-passivo.drawio.png)

## Pilot Light (Luz Piloto)

![Pilot Light](/assets/images/system-design/pilot-light.drawio.png)

### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)