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

Identificar os SPoF de algum ambiente pode parecer extremamente trivial, porém se tornar uma tarefa árdua de esforço corporativo em ambientes grandes e de larga escala, pois precisamos mapear quais as funcionalidades mais críticas, documentar cada serviço, clusters, nodes, servidores, databases, componentes de rede, brokers de eventos e mensagens e até fornecedores, sem falar dos times responsáveis e formas de acionamento de cada um deles. 

![SPOF](/assets/images/system-design/spof-identiticacao.drawio.png)

Durante esse mapeamento, é **necessário desenhar um "fluxo feliz" de cada transação dessas funcionalidades críticas**, **mapear todos os atores, desde a requisição de fato, até a resposta para o usuário**. Em seguida é necessário inspecionar **quais desses componentes [não possuam réplicas](), [implementem padrões de resiliência](), fallbacks e mecanismos que consigam assumir esses fluxos alternativos automaticamente**. São nesses atores que são encontrados **candidatos para se tornarem pontos únicos de falha** num fluxo crítico. 

A identificação de "Pontos únicos de falha" não é uma tarefa pontual ou trivial, necessita de constante revisão arquitetural e força corporativa para que seja realmente efetivo. 

## 

# Lidando com Single Point of Failures

Existem estratégias comuns que podem nos auxiliar corrigir e principalmente evitar a criação de SPoF's, nesta sessão iremos identificar de forma macro como endereçar algumas delas.

## Design Stateless de Aplicação

## Redundância e Replicação Ativa 

![Ativa](/assets/images/system-design/spof-ativa.drawio.png)


## Redundância e Replicação Passiva 

![Passiva](/assets/images/system-design/spof-passiva.drawio.png)

## Failover Automático 

![Circuit Breaker](/assets/images/system-design/spof-circuit-breaker.drawio.png)

## Ativo-Ativo

## Ativo-Passivo

## Pilot Light (Luz Piloto)

### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)