---
layout: post
image: assets/images/keda-tps/thumb.jpg
author: matheus
featured: false
published: false
categories: [ keda, kubernetes, containers, cloud-native, capacity, dicas ]
title: Keda Autoscaler - Escalando sua aplicação por requests HTTP usando métricas do Prometheus
---

# Introdução 

O [Keda Autoscaler]() é uma das minhas tecnologias favoritas da Landscape da [CNCF](). Considero divertido, sem meias palavras, as possibilidades que ele te proporciona pra trabalhar com autoscale. Há tech-hipsters que consideram a escalabilidade usando métricas de CPU/RAM meio "demodê". Eu por um coque samurai não estou andando no recreio com essa turma. 

Nesse artigo rápido vou apresentar uma prova de conceito interessante para propocionar o autoscale da sua aplicação por meio de demanda, ou seja, requisições dentro de um período de tempo

# Fundamentos e Premissas

Esse tipo de estratégia que será utilizada é uma alternativa para workloads muito sensíveis a trafego, e que contam com certos spikes de consumo aleatórios durante o dia. 

Por exemplo: 
* Meu workload precisa de no mínimo 3 replicas no ar, independente do horário
* Eu sei que cada replica da minha aplicação aguenta sem se degradar 10 tps (transactions per second)
* Essa informação veio por meio de testes de carga que foram realizados de forma prévia. 
* Com base nisso,   

# Implementacão 

# Testes e Resultados 

# Referencias e Recursos Adicionais

