---
layout: post
image: assets/images/system-design/logo-ms-monolito.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Escalabilidade
---

# Definindo escalabilidade

Escalabilidade é a capacidade de um sistema, aplicação ou negócio de crescer e lidar com um aumento na carga de trabalho, sem comprometer a qualidade, desempenho e eficiência. Isso pode incluir o aumento de usuários, transações, dados ou recursos. É um atributo crítico para sistemas que esperam um aumento no volume de usuários ou dados.

A escalabilidade é um conceito importante no design de sistemas, pois é crucial para garantir que as aplicações e produtos possam lidar com um aumento na carga de trabalho sem sacrificar a qualidade ou o desempenho. Isso é especialmente importante em ambientes de nuvem, onde as demandas podem mudar rapidamente e os sistemas devem ser capazes de se adaptar a essas mudanças

# Importância da Escalabilidade em Sistemas Modernos

# Escalabilidade Vertical e Escalabilidade Horizontal

Existem dois tipos principais de escalabilidade que são frequentemente discutidos no design de sistemas: escalabilidade horizontal e escalabilidade vertical.

## Escalabilidade Vertical

![Escalabilidade Vertical](/assets/images/system-design/onibus-vertical.png)

CPU, RAM. Embora seja uma solução mais simples, frequentemente encontra limites físicos e de custo.

![Escalabilidade Vertical](/assets/images/system-design/scale-up.png)

### Scale UP e Scale Down

Scale-UP e Scale-Down são atividades que ocorrem nas operações de escalabilidade vertical, que se dedicam a aumentar ou reduzir recursos computacionais de determinado servidor que desempenha alguma funcionalidade. Scale-Up se refere ao ato de aumentar recursos, sendo esses CPU, memória, disco, rede. E Scale-Down é a operação de diminuir esses recursos quando necessário. 

## Escalabilidade Horizontal

![Escalabilidade Horizontal](/assets/images/system-design/onibus-horizontal.png)

Escalabilidade Horizontal: Adicionar mais máquinas ou instâncias no sistema para lidar com a carga. É frequentemente associada à flexibilidade e à capacidade de crescimento contínuo.

A escalabilidade horizontal refere-se à adição de mais nós como servidores, containers, replicas a um componente ou um sistema. Isso é também conhecido como "scale out". Por exemplo, se você está executando uma aplicação web em um único nó, mas começa a receber muito tráfego, você pode adicionar mais replicas ao sistema para compartilhar a carga de trabalho. Este método é chamado de escalabilidade horizontal 

![Escalabilidade Horizontal](/assets/images/system-design/scale-out.png)

### Scale Out e Scale In

Scale-In e Scale-Out são as atividades demandadas pela escalabilidade **horizontal**. Scale-Out (Escale para Fora) se refere a incrementar o número de servidores ou replicas que atendem exercem a mesma função, para dividir a carga de processamento entre eles. Scale-In é a operação inversa, onde reduzimos o número de servidores ou replicas do pool de maquinas.

# Escalabilidade de Software

# Outros principios de escalabilidade


#### Referências

[Test of the New Infortrend CS Scale-Out NAS Cluster (Part 1)](https://www.digistor.com.au/the-latest/cat/digistor-blog/post/test-new-infortrend-cs-scale-out-nas-cluster/)

