---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Saga Pattern
---

# O que é o modelo SAGA?

Uma transação Saga é um padrão arquitetural que visa garantir a consistência dos dados em transações distribuídas, especialmente em cenários onde essas transações dependem da execução contínua da mesma em múltiplos microserviços.

O termo Saga vem do sentido literal de Saga, que o conceito remete a uma aventura, uma história, uma jornada do herói, jornada na qual a mesma remonta vários capítulos onde o mesmo precisa cumprir objetivos, enfrentar desafios, superar seus limites e concluir um objetivo predestinado. Dentro de uma implementação do Saga Pattern, uma Saga possui uma característica sequencial, na qual a transação depende de diversos microserviços para ser concluída, com etapas que devem ser executadas uma após a outra de forma ordenada e distribuída. 

A implementação dessas etapas pode variar entre abordagens Coreografadas e Orquestradas, as quais serão exploradas mais adiante. Independentemente da abordagem escolhida, o objetivo principal é gerenciar transações que envolvem dados em diferentes microserviços e bancos de dados, ou que são de longa duração, e garantir que todos os passos sejam executados sem perder a consistência e controle. 


<br>

# O problema de lidar com transações distribuídas

Vamos imaginar o sistema de pedidos de um grande e-commerce. A funcionalidade principal desse sistema é receber uma solicitação de pedido e executar todas as ações necessárias para garantir a efetivação completa desse pedido, desde a solicitação até a entrega. Para isso, é preciso interagir com diversos microserviços pertinentes, como **Serviço de Pedidos**,  **Serviço de Pagamentos**, **Serviço de Estoque**, **Serviço de Entregas** e um **Serviço de Notificações** que notifica o cliente de todas as etapas do pedido. 

![Saga Problema](/assets/images/system-design/saga-problema-distribuido-1.drawio.png)

Em uma arquitetura complexa com múltiplos serviços interligados, cada domínio isolado precisa garantir uma parte da sequência da execução para que o pedido seja concluído com sucesso. À medida que o número de componentes aumenta, a complexidade também cresce, aumentando a probabilidade de falhas e inconsistências.

![Saga Error](/assets/images/system-design/saga-distribuido-error.drawio.png)

Imagine que, durante a execução dessas etapas, um dos serviços falhe por algum motivo não sistêmico em termos de resiliência, como a falta de um item no estoque ou a recepção de informações inválidas pelo serviço de estoque. Nessas situações, pode ser impossível continuar as chamadas para os serviços subsequentes, como o serviço de entregas, mesmo que etapas críticas, como o processamento do pagamento, já tenham sido concluídas com sucesso. Nesse caso, conhecer e desfazer os passos anteriores pode se tornar um problema complicado. 

Esse cenário representa um grave problema de consistência distribuída. Sem mecanismos adequados, o sistema pode acabar em um estado inconsistente, onde o pagamento foi efetuado, mas o pedido não foi concluído. O **Saga Pattern** é uma solução que tenta solucionar exatamente esse tipo de problema, garantindo que, mesmo em caso de falhas, o sistema mantenha a integridade dos dados e retorne a um estado consistente em todos os serviços que compõe a transação.

<br>

# O problema de lidar com transações longas

Em diversos cenários, processos complexos exigem um período um pouco mais longo para serem concluídos. Por exemplo, uma solicitação dentro de um sistema que precisa passar por várias etapas de execução pode levar desde milissegundos até semanas ou meses para ser finalizada completamente.

O tempo de espera entre a execução de um microserviço e o serviço subsequente pode variar intencionalmente devido a fatores como agendamentos, estímulos externos, agrupamento de períodos e outros. Exemplos disso incluem controle de cobrança de parcelamento, agendamento financeiro, consolidação de franquias de uso de produtos digitais, agrupamento de solicitações para processamento em batch, fechamento de faturas e controle de uso de clientes.

Gerenciar o ciclo de vida dessas transações de longo prazo representa um desafio arquitetural significativo, especialmente em termos de consistência e conclusão. É necessário criar mecanismos que permitam controlar transações de ponta a ponta em cenários complexos, monitorar todas as etapas pelas quais a transação passou e determinar e gerenciar o estado atual da transação de forma transparente. O **Saga Pattern** resolve esses problemas ao decompor transações longas em uma série de transações menores e independentes, cada uma gerenciada por um microserviço específico. Isso facilita a garantia de consistência, a recuperação de falhas no quesito de resiliência operacional.

<br>

# A Proposta de Transações Saga

Concluindo o que foi abordado anteriormente na explicação da problemática, o Saga Pattern é um padrão arquitetural projetado para lidar com transações distribuídas e dependentes da consistência eventual de em multiplos microserviços. 

A proposta da aplicabilidade do Saga Pattern é decompor uma transação longa e complexa em uma sequência de transações menores e coordenadas, chamadas **sagas**, que são gerenciadas de algumas maneiras para garantir a consistência e sucesso da execução, e principalmente garantir a consistência dos dados em diferentes serviços que sigam o modelo "One Database Per Service". 

Cada Saga corresponde a uma transação pseudo-atômica dentro do sistema, onde cada solicitação corresponde a execução de uma saga isolada. Cada Saga consiste em um agrupamento de operacões menores que acontecem localmente em cada microserviço da saga. Além de proporcionar meios de garantir que todas as etapas sejam concluídas, caso uma das operações da saga falhe, o Saga Pattern define **transações compensatórias** para desfazer as operações já executadas, assegurando que o sistema se mantenha consistênte até mesmo durante uma falha. 

A proposta da Saga [quando aplicado em abordagens assincronas](/mensageria-eventos-streaming/) elimina a necessidade de bloqueios síncronos e prolongados, como o caso do **Two-Phase Commit (2PC)** que são computacionalmente caros e podem se tornar gargalos de desempenho em ambientes distribuídos. 

Existem dois modelos principais para implementar o Saga Pattern, o **Modelo Orquestrado** e o **Modelo Coreografado**. Cada um deles possui características de coordenação e comunicação das transações Saga diferentes em termos arquiteturais. A escolha entre os modelos depende das necessidades específicas de como o sistema foi projetado, e principalmente deve levar em conta a complexidade das transações.


## Modelo Orquestrado

No **Modelo Orquestrado**, propõe a existência de um componente centralizado de **Orquestração** que gerencia a execução das sagas. O Orquestrador é responsável por iniciar a saga, coordenar a sequência de transações e gerenciar o fluxo de compensação em caso de falhas. Ele atua como um control plane que envia comandos para os microserviços participantes e espera pelas respostas para decidir os próximos passos da saga.

Então a função do orquestrador é basicamente montar um "mapa da saga", com todas as etapas que precisam ser concluídas para a finalização da mesma, enviar mensagens e eventos para os respectivos microserviços e a partir de suas respostas, resumir e estimular o próximo passo da Saga. 

![Orquestrador](/assets/images/system-design/saga-orquestrado-circulo.png)



## Modelo Coreografado



# Adoções Arquiteturais

## Maquinas de Estado

## Logs de Saga

## Modelos de Ação e Compensação

## Dual Write em Transações Saga

## Two-Phase Commit em Transações Saga

## Try-Confirm-Cancel (TCC) Protocol

## Mecanismos de Resumo de Saga



### Referências 

[SAGAS - Department of Computer Science Princeton University](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf)

[Saga distributed transactions pattern](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga)

[Pattern: SAGA](https://microservices.io/patterns/data/saga.html))

[Model: 8 types of sagas](https://tjenwellens.eu/everblog/ec936db8-ba4c-430b-aeb4-15d9c50c0f8c/)

[Saga Pattern in Microservices](https://www.baeldung.com/cs/saga-pattern-microservices)

[SAGA Pattern para microservices](https://dev.to/thiagosilva95/saga-pattern-para-microservices-2pb6)

[Saga Pattern — Um resumo com Caso de Uso (Pt-Br)](https://luanmds.medium.com/saga-pattern-um-resumo-com-caso-de-uso-pt-br-d534cec67625)

[Try-Confirm-Cancel (TCC) Protocol](https://blog.sofwancoder.com/try-confirm-cancel-tcc-protocol)

[Microservices Patterns: The Saga Pattern](https://medium.com/cloud-native-daily/microservices-patterns-part-04-saga-pattern-a7f85d8d4aa3)