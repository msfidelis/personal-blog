---
layout: post
image: assets/images/system-design/sharding-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Replicação de Dados
---

# Definindo Replicação na Engenharia de Software

Replicação, principalmente dentro nos requisitos de engenharia, se refere ao ato de criar uma ou mais cópias do mesmo dado em destinos diferentes. Essa é uma prática bem vista e bem vinda, especialmente em sistemas distribuídos, onde a consistência, disponibilidade e tolerância a falhas são requisitos mandatórios para uma operabilidade saudável e duradoura. Quando olhamos para [Bancos de Dados](), a replicação permite que mesmo em caso de falhas terminais de hardware ou problemas de rede, os dados permaneçam acessíveis em outros locais e dão a garantia de que o sistema se tornará consistente em algum momento. 

Essas réplicas podem estar localizadas em servidores diferentes, em datacenters separados geograficamente ou até mesmo em diferentes regiões de nuvens públicas. A finalidade principal da replicação é garantir que os dados estejam disponíveis em vários locais, o que é crítico para sistemas que exigem alta disponibilidade e continuidade de negócios.

Os beneficios de estratégias de replicação são vários, como por exemplo, ao replicar dados em vários locais, um sistema pode continuar a operar mesmo que uma parte do sistema falhe. Em caso de um cluster de databases um nó do mesmo falhar, as réplicas dos dados em outros nós podem assumir e se tornarem a fonte principal da consulta, garantindo que o serviço continue disponível.

# Tipos de Replicacão

## Replicação Total e Parcial

## Replicação Sincrona

## Replicação Assincrona

## Replicação por Logs

## Replicação Semi-Sincrona

## Replicação Primary-Replica

## Replicação Primary-Primary* - verificar se não tem um termo novo

# Arquitetura

## Replicação de Domínios