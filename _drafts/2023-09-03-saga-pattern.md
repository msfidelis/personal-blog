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

Dentro de uma implementação do Saga Pattern, uma Saga possui uma característica sequencial, na qual a transação depende de diversos microserviços para ser concluída, com etapas que devem ser executadas uma após a outra de forma ordenada. A implementação dessas etapas pode variar entre abordagens Coreografadas e Orquestradas, as quais serão exploradas mais adiante. Independentemente da abordagem escolhida, o objetivo principal é gerenciar transações que envolvem dados em diferentes microserviços e bancos de dados, ou que são de longa duração, e garantir que todos os passos sejam executados sem perder a consistência e controle. 


# O problema de lidar com transações distribuídas

Vamos imaginar o sistema de pedidos de um grande e-commerce. A funcionalidade principal desse sistema é receber uma solicitação de pedido e executar todas as ações necessárias para garantir a efetivação completa desse pedido, desde a solicitação até a entrega. Para isso, é preciso interagir com diversos microserviços pertinentes, como **Serviço de Pedidos**,  **Serviço de Pagamentos**, **Serviço de Estoque**, **Serviço de Entregas** e um **Serviço de Notificações** que notifica o cliente de todas as etapas do pedido. 

![Saga Problema](/assets/images/system-design/saga-problema-distribuido-1.drawio.png)

Em uma arquitetura complexa com múltiplos serviços interligados, cada domínio isolado precisa garantir uma parte da sequência da execução para que o pedido seja concluído com sucesso. À medida que o número de componentes aumenta, a complexidade também cresce, aumentando a probabilidade de falhas e inconsistências.

![Saga Error](/assets/images/system-design/saga-distribuido-error.drawio.png)

Imagine que, durante a execução dessas etapas, um dos serviços falhe por algum motivo não sistêmico em termos de resiliência, como a falta de um item no estoque ou a recepção de informações inválidas pelo serviço de estoque. Nessas situações, pode ser impossível continuar as chamadas para os serviços subsequentes, como o serviço de entregas, mesmo que etapas críticas, como o processamento do pagamento, já tenham sido concluídas com sucesso. Nesse caso, conhecer e desfazer os passos anteriores pode se tornar um problema complicado. 

Esse cenário representa um grave problema de consistência distribuída. Sem mecanismos adequados, o sistema pode acabar em um estado inconsistente, onde o pagamento foi efetuado, mas o pedido não foi concluído. O **Saga Pattern** é uma solução que tenta solucionar exatamente esse tipo de problema, garantindo que, mesmo em caso de falhas, o sistema mantenha a integridade dos dados e retorne a um estado consistente em todos os serviços que compõe a transação.


# O problema de lidar com transações longas

# A Proposta de Transações Saga

# Principais Modelos de Saga

## Modelo Orquestrado

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

[SAGA Pattern para microservices](https://dev.to/thiagosilva95/saga-pattern-para-microservices-2pb6)

[Saga Pattern — Um resumo com Caso de Uso (Pt-Br)](https://luanmds.medium.com/saga-pattern-um-resumo-com-caso-de-uso-pt-br-d534cec67625)

[Try-Confirm-Cancel (TCC) Protocol](https://blog.sofwancoder.com/try-confirm-cancel-tcc-protocol)

[Microservices Patterns: The Saga Pattern](https://medium.com/cloud-native-daily/microservices-patterns-part-04-saga-pattern-a7f85d8d4aa3)